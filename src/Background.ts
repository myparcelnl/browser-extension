import {
  type MessageGetContentFromPopup,
  type MessageDataWithUrl,
  type StoredExtensionSettings,
  type AnyFn,
  type AnyMessage,
  type MessageFromPopup,
  type MapFieldMessageToContent,
  type DeleteFieldsMessage,
  type StopMappingMessage,
  type FoundContentMessage,
  type MessageFromContent,
  type ContentConnectedMessage,
} from './types';
import {isProd} from './helpers/isProd.js';
import {isCrxMessage} from './helpers/isCrxMessage';
import Logger from './helpers/Logger';
import Chrome from './helpers/Chrome';
import {ActionNames} from './helpers/ActionNames';
import {
  EXTENSION_PATH,
  POPUP_DIMENSIONS,
  POPUP,
  CONTENT,
  CONTEXT_MENU_CREATE_SHIPMENT,
  CONTEXT_MENU,
  ACTIVE_ICON,
  DEFAULT_ICON,
  POPUP_URL,
} from './constants.js';
import storage from './background/storage';
import ContextMenu from './background/ContextMenu';
import Connection from './background/Connection';
import BackgroundActions from './background/BackgroundActions';

export default class Background {
  /**
   * Current active tab.
   */
  public static activeTab: undefined | chrome.tabs.Tab;

  /**
   * The popup window the backoffice runs in.
   */
  private static popupWindow: undefined | chrome.tabs.Tab;

  /**
   * ID of the last window the browser was focused on.
   */
  private static lastWindowId: number;

  private static popupExternalUrl: string;

  private static settings: StoredExtensionSettings;

  /**
   * Loads config file then binds all events and scripts.
   */
  public static async boot() {
    await this.loadConfig();
    await this.setGlobalSettings();
    await this.connectToPopup();

    this.bindEvents();
    this.bindPopupScript();
    this.bindContentScript();
  }

  /**
   * Connect the popup window if it already exists.
   */
  static async connectToPopup(): Promise<void> {
    if (this.popupWindow) {
      return;
    }

    this.popupWindow = await this.findPopup();

    if (this.popupWindow) {
      Logger.success('Connected to popup');
    }
  }

  /**
   * Get saved settings, merge new settings into them and update the settings object.
   */
  static async setGlobalSettings(settings?: StoredExtensionSettings) {
    const savedSettings = settings
      ? await BackgroundActions.saveGlobalSettings(settings)
      : await BackgroundActions.getGlobalSettings();

    this.updateGlobalSettings(savedSettings);
  }

  static updateGlobalSettings(settings: StoredExtensionSettings) {
    this.settings = settings;

    const contextMenusClickListener = (data: chrome.contextMenus.OnClickData) => ContextMenu.activate(data);

    if (settings.enable_context_menu) {
      ContextMenu.create(CONTEXT_MENU);
      // On opening context menu (right click)
      chrome.contextMenus.onClicked.addListener(contextMenusClickListener);
    } else {
      ContextMenu.remove(CONTEXT_MENU_CREATE_SHIPMENT);
      chrome.contextMenus.onClicked.removeListener(contextMenusClickListener);
    }
  }

  /**
   * Fetch config file and set variables.
   */
  static async loadConfig() {
    let appUrlClass = new URL([POPUP_URL, EXTENSION_PATH].join('/'));

    // Resolve url from settings if available. This is used for staging and development environments.
    if (!isProd()) {
      await new Promise((resolve) => {
        chrome.storage.sync.get({backofficeUrl: ''}, ({backofficeUrl}) => {
          if (backofficeUrl) {
            appUrlClass = new URL([backofficeUrl, EXTENSION_PATH].join('/'));
          }

          resolve(undefined);
        });
      });
    }

    appUrlClass.searchParams.set('referralurl', encodeURIComponent(EXTENSION_PATH));
    appUrlClass.searchParams.set('origin', 'browser-extension');

    this.popupExternalUrl = appUrlClass.href;
  }

  /**
   * Bind the popup script connection and map external ActionNames.
   */
  static bindPopupScript() {
    const manifest = chrome.runtime.getManifest();

    chrome.runtime.onConnectExternal.addListener((port) => {
      // /** This allows the extension to keep working after reloading the popup. */
      void this.connectToPopup();

      Connection.popup = port;
      Connection.sendToPopup({
        action: ActionNames.booted,
        version: manifest.version,
      });

      port.onMessage.addListener((request: MessageFromPopup) => {
        this.popupListener(request);
      });
    });
  }

  /**
   * Bind the injected content script connection and map ActionNames.
   */
  static bindContentScript() {
    chrome.runtime.onConnect.addListener((port) => {
      void this.connectToPopup();

      port.onMessage.addListener(async (request) => {
        if (isCrxMessage(request)) {
          return;
        }

        const currentTab = await this.getActiveTab();

        // Ignore messages from other tabs than the active one
        if (!currentTab || currentTab.id !== port.sender?.tab?.id) {
          return;
        }

        Connection.savePort(port);

        await this.activateTab(port.sender?.tab);

        this.contentScriptListener(request);
      });
    });
  }

  /**
   * Listener for popup script ActionNames.
   */
  static popupListener<Action extends ActionNames>(request: MessageFromPopup<Action>) {
    Logger.request(POPUP, request, true);

    const resolvedRequest: AnyMessage<Action> = {
      ...request,
      url: request.url ?? this.activeTab?.url,
    };

    switch (resolvedRequest.action) {
      case ActionNames.popupConnected:
        Connection.onPopupConnect(resolvedRequest);
        break;

      case ActionNames.checkContentConnection:
        void this.confirmContentConnection(resolvedRequest);
        break;

      case ActionNames.mapField:
        this.moveFocus();
        Connection.sendToContent(resolvedRequest as MapFieldMessageToContent);
        break;

      case ActionNames.deleteFields:
        void BackgroundActions.deleteFields(resolvedRequest as DeleteFieldsMessage);
        break;

      case ActionNames.saveSettings:
        void this.setGlobalSettings(resolvedRequest.settings as StoredExtensionSettings);
        break;

      case ActionNames.getSettings:
        Connection.sendToPopup({
          action: ActionNames.foundSettings,
          settings: this.settings,
        });
        break;

      case ActionNames.getContent:
        void BackgroundActions.getContent(resolvedRequest as MessageGetContentFromPopup);
        break;

      /**
       * Just pass to content.
       */
      case ActionNames.stopMapping:
        Connection.sendToContent(request as StopMappingMessage);
        break;
    }
  }

  /**
   * Listener for content script ActionNames.
   */
  static contentScriptListener<Action extends ActionNames>(request: MessageFromContent<Action>) {
    Logger.request(CONTENT, request, true);

    switch (request.action) {
      case ActionNames.contentConnected:
        Connection.onContentConnect({...request, url: this.activeTab?.url} as MessageDataWithUrl);
        break;

      case ActionNames.mappedField:
        BackgroundActions.saveMappedField(request);

        this.moveFocus(this.popupWindow);
        break;

      case ActionNames.deleteFields:
        void BackgroundActions.deleteFields(request as DeleteFieldsMessage);
        break;

      case ActionNames.foundContent:
        Connection.sendToPopup(request as FoundContentMessage);
        break;
    }
  }

  /**
   * Binds all browser events to functions.
   */
  static bindEvents() {
    const withThisScope = (fn: AnyFn) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (...args: any[]) => fn.apply(this, args);
    };

    // Extension button click
    chrome.action.onClicked.addListener(withThisScope(this.openPopup));

    // Tab listeners
    chrome.tabs.onHighlighted.addListener(withThisScope(this.highlightTab));
    chrome.tabs.onReplaced.addListener(withThisScope(this.switchTab));
    chrome.tabs.onUpdated.addListener(withThisScope(this.updateTab));

    // Window listeners
    chrome.windows.onFocusChanged.addListener(withThisScope(this.changeFocus));
    chrome.windows.onRemoved.addListener(withThisScope(this.checkPopupClosed));
  }

  /**
   * Set active tab and send messages to popup and content to process the change.
   */
  static switchTab(addedTabId: number, removedTabId: number): void {
    const isInvalidTab = addedTabId === chrome.tabs.TAB_ID_NONE;

    if (isInvalidTab || this.isPopup(addedTabId)) {
      return;
    }

    Logger.event('switchTab', `addedTabId: ${addedTabId}, removedTabId: ${removedTabId}`);

    void this.activateTab();
  }

  /**
   * Set active tab and send messages to popup and content to process the change.
   */
  static async highlightTab(info: chrome.tabs.TabHighlightInfo) {
    Logger.event('highlightTab', info);

    const tab: chrome.tabs.Tab = await new Promise((resolve) => {
      chrome.tabs.get(info.tabIds[0], resolve);
    });

    const activatedTab = await this.activateTab(tab);

    if (activatedTab) {
      Connection.sendToPopup({action: ActionNames.switchedTab});
    }
  }

  /**
   * Gets the active tab based on a query.
   *
   * @see https://developer.chrome.com/extensions/tabs#method-query
   */
  static getActiveTab(): Promise<undefined | chrome.tabs.Tab> {
    return Chrome.queryTab({
      active: true,
      highlighted: true,
      lastFocusedWindow: true,
      // Exclude popups and other unexpected "tabs"
      windowType: 'normal',
    });
  }

  /**
   * On updating tab set new tab as active tab and change app icon.
   */
  static updateTab(id: number | undefined, data: {status: string}, tab: chrome.tabs.Tab | undefined) {
    if (this.isPopup(id) || !this.isActiveTab(tab?.id)) {
      return;
    }

    Logger.event(`updateTab – ${data.status}`);

    if (data.status === 'complete') {
      this.activeTab = undefined;
      this.setIcon();

      void this.activateTab(tab);
      Connection.sendToPopup({action: ActionNames.switchedTab});
    }
  }

  /**
   * Fired when the currently focused window changes. Try to find valid tab in the window, set it as active tab and
   * change app icon. Ignores popups, invalid windows and ignores change if the window id is equal to the previous one.
   */
  static async changeFocus(windowId: number) {
    const isInvalidWindow = windowId === chrome.windows.WINDOW_ID_NONE;
    const windowChanged = windowId !== this.lastWindowId;

    if (isInvalidWindow || !windowChanged || this.isPopup(windowId)) {
      return;
    }

    Logger.event('changeFocus', windowId);

    this.lastWindowId = windowId;
    this.activeTab = undefined;
    this.setIcon();

    await this.activateTab();

    Connection.sendToPopup({action: ActionNames.switchedTab});
  }

  /**
   * When a window is closed check if it's our popup and clean up if so.
   */
  static checkPopupClosed(windowId: number) {
    if (!this.isPopup(windowId)) {
      return;
    }

    Logger.event('Popup closed');
    this.closePopup();
  }

  /**
   * Set given tab to active and content scripts on tab.
   */
  static async activateTab(tab?: chrome.tabs.Tab): Promise<chrome.tabs.Tab | undefined> {
    const resolvedTab = tab ?? (await this.getActiveTab());

    if (!resolvedTab?.active || this.isPopup(resolvedTab.windowId) || this.isActiveTab(resolvedTab.id)) {
      return;
    }

    if (this.isWebsite(resolvedTab)) {
      this.activeTab = resolvedTab;

      Logger.success(`Active tab: ${resolvedTab.url}`);
    } else {
      Logger.info('No active tab found.');

      this.activeTab = undefined;
    }

    await this.confirmContentConnection({url: resolvedTab.url});

    return this.activeTab;
  }

  /**
   * On moving focus update current window and tab.
   */
  static moveFocus(tab: undefined | chrome.tabs.Tab = this.activeTab) {
    if (!tab) {
      return;
    }

    void chrome.windows.update(tab.windowId, {focused: true});
    void chrome.tabs.update({active: true});
  }

  /**
   * Check if given tab is a website and not a Chrome page.
   */
  static isWebsite(tab: chrome.tabs.Tab): boolean {
    const isInvalidTab = tab.id === chrome.tabs.TAB_ID_NONE;

    return Boolean(tab.url?.startsWith('http') && !this.isPopup(tab.id) && !isInvalidTab);
  }

  /**
   * Find an existing popup window by checking all popups containing "tabs" with our popup url.
   */
  static findPopup(): Promise<chrome.tabs.Tab | undefined> {
    const {hostname: popupHostname} = new URL(this.popupExternalUrl);

    return new Promise((resolve) => {
      chrome.windows.getAll({windowTypes: ['popup']}, async (popups) => {
        await Promise.all(
          popups.map(async (popup) => {
            const allTabs = await Chrome.queryTabs({windowId: popup.id});

            const matchingTab = allTabs.find((tab) => {
              if (!tab.url) {
                return false;
              }

              const tabUrl = new URL(tab.url);

              return tabUrl.hostname === popupHostname;
            });

            if (!matchingTab) {
              return;
            }

            resolve(matchingTab);
          }),
        );

        resolve(undefined);
      });
    });
  }

  /**
   * Create popup and load given URL in it.
   */
  static async createPopup(): Promise<chrome.tabs.Tab> {
    const existingPopup = await this.findPopup();

    if (existingPopup) {
      await chrome.windows.remove(existingPopup.windowId);
    }

    return new Promise((resolve, reject) => {
      const {height, width} = POPUP_DIMENSIONS;

      chrome.windows.getCurrent((win) => {
        chrome.windows.create(
          {
            focused: true,
            url: this.popupExternalUrl,
            type: 'popup',
            // when we open the extension outside of the window this will result in an error
            left: win.width ? win.width - width : 0,
            height,
            width,
          },
          (win) => {
            const tab = win?.tabs?.[0];

            if (tab) {
              resolve(tab);
            }

            reject('No tab found');
          },
        );
      });
    });
  }

  /**
   * Show popup if it exists or create it.
   */
  static async openPopup(): Promise<void> {
    if (this.popupWindow) {
      this.moveFocus(this.popupWindow);
    } else {
      this.popupWindow = await this.createPopup();
    }

    await this.activateTab();
    this.setIcon(ACTIVE_ICON);
  }

  /**
   * Clean up on closing of popup. Tells content connection to stop listening and resets variables and extension icon.
   */
  static closePopup() {
    Connection.sendToContent({action: ActionNames.stopListening});

    Connection.popup = undefined;

    this.activeTab = undefined;
    this.popupWindow = undefined;

    this.setIcon();
  }

  /**
   * Changes the extension icon to given path.
   */
  static setIcon(path: string = DEFAULT_ICON) {
    chrome.action.setIcon({path}, Chrome.catchError);
  }

  /**
   * Get the active tab URL if available.
   */
  static getUrl(): string | undefined {
    return this.activeTab?.url;
  }

  /**
   * Check if a window/tab ID matches the popup window's id. Returns false if not and if the popup window doesn't exist.
   */
  static isPopup(windowOrTabId?: number): boolean {
    return Boolean(windowOrTabId) && windowOrTabId === this.popupWindow?.windowId;
  }

  /**
   * Check if a tab id matches the active tab id. Returns false if not and if there is no active tab.
   */
  static isActiveTab(tabId?: number): boolean {
    return Boolean(tabId) && tabId === this.activeTab?.id;
  }

  /**
   * Validates the connection with the content and tells the popup some things about the current tab.
   */
  static async confirmContentConnection(message: {url?: string}) {
    let settings: undefined | StoredExtensionSettings = undefined;

    if (message.url) {
      const activeTabUrl = new URL(message.url).hostname;

      settings = await storage.getSavedSettingsForUrl(activeTabUrl);
    }

    Connection.sendToPopup({
      ...message,
      action: ActionNames.contentConnected,
      settings: settings && Object.keys(settings).length ? settings : null,
    } satisfies ContentConnectedMessage);
  }
}
