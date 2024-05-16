import {
  type MessageGetContentFromPopup,
  type MessageDataWithUrl,
  type StoredExtensionSettings,
  type AnyFn,
  type MessageFromPopup,
  type DeleteFieldsMessage,
  type StopMappingMessage,
  type MessageFromContent,
  type ContentConnectedMessage,
  type FoundContentMessage,
  type SaveSettingsMessage,
} from './types/index.js';
import {isProd, isCrxMessage, ActionNames} from './helpers/index.js';
import Logger from './helpers/Logger.js';
import Chrome from './helpers/Chrome.js';
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
import {getSavedSettingsForUrl, deleteMappedFields} from './background/storage/index.js';
import ContextMenu from './background/ContextMenu.js';
import Connection from './background/Connection.js';
import BackgroundActions from './background/BackgroundActions.js';

export default class Background {
  /**
   * Current active tab.
   */
  public static activeTab: undefined | chrome.tabs.Tab;

  /**
   * ID of the last window the browser was focused on.
   */
  private static lastWindowId: number;

  /**
   * The url of the popup window.
   */
  private static popupExternalUrl: string;

  /**
   * The popup window the backoffice runs in.
   */
  private static popupWindow: undefined | chrome.tabs.Tab;

  /**
   * Extension settings
   */
  private static settings: StoredExtensionSettings;

  /**
   * Loads config file then binds all events and scripts.
   */
  public static async boot(): Promise<void> {
    await this.loadConfig();
    await this.setGlobalSettings();
    await this.connectToPopup();

    this.bindEvents();
    this.bindPopupScript();
    this.bindContentScript();
  }

  /**
   * Get the active tab URL if available.
   */
  public static getUrl(): string | undefined {
    return this.activeTab?.url;
  }

  /**
   * Show popup if it exists or create it.
   */
  public static async openPopup(): Promise<void> {
    if (this.popupWindow) {
      this.moveFocus(this.popupWindow);
    } else {
      this.popupWindow = await this.createPopup();
    }

    await this.activateTab();
    this.setIcon(ACTIVE_ICON);
  }

  /**
   * Set given tab to active and content scripts on tab.
   */
  private static async activateTab(tab?: chrome.tabs.Tab): Promise<chrome.tabs.Tab | undefined> {
    const resolvedTab = tab ?? (await Chrome.getActiveTab());

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

    await this.confirmContentConnection({id: tab?.id, url: resolvedTab.url});

    return this.activeTab;
  }

  /**
   * Bind the injected content script connection and map ActionNames.
   */
  private static bindContentScript(): void {
    chrome.runtime.onConnect.addListener((port) => {
      Connection.savePort(port);
      void this.connectToPopup();

      port.onMessage.addListener((request) => {
        if (isCrxMessage(request)) {
          return;
        }

        this.contentListener({...request, id: port.sender?.tab?.id});
      });
    });
  }

  /**
   * Binds all browser events to functions.
   */
  private static bindEvents() {
    const withThisScope = (fn: AnyFn) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (...args: any[]) => fn.apply(this, args);
    };

    // Extension button click
    chrome.action.onClicked.addListener(withThisScope(this.openPopup));

    // Tab listeners
    chrome.tabs.onHighlighted.addListener(withThisScope(this.onTabHighlighted));
    chrome.tabs.onReplaced.addListener(withThisScope(this.onTabReplaced));
    chrome.tabs.onUpdated.addListener(withThisScope(this.onTabUpdated));

    // Window listeners
    chrome.windows.onFocusChanged.addListener(withThisScope(this.onWindowFocusChanged));
    chrome.windows.onRemoved.addListener(withThisScope(this.onWindowRemoved));
  }

  /**
   * Bind the popup script connection and map external ActionNames.
   */
  private static bindPopupScript() {
    const manifest = chrome.runtime.getManifest();

    chrome.runtime.onConnectExternal.addListener((port) => {
      // This allows the extension to keep working after reloading the popup.
      void this.connectToPopup();

      Connection.popup = port;
      Connection.sendToPopup({
        action: ActionNames.booted,
        version: manifest.version,
      });

      port.onMessage.addListener(this.popupListener.bind(this));
    });
  }

  /**
   * Clean up on closing of popup. Tells content connection to stop listening and resets variables and extension icon.
   */
  private static closePopup() {
    Connection.sendToContent({action: ActionNames.stopListening});

    Connection.popup = undefined;

    this.activeTab = undefined;
    this.popupWindow = undefined;

    this.setIcon();
  }

  /**
   * Validates the connection with the content and tells the popup some things about the current tab.
   */
  private static async confirmContentConnection(message: {url?: string; id?: number}) {
    let settings: undefined | StoredExtensionSettings = undefined;

    // Don't send to popup if the tab is not active.
    if (message.id && !this.isActiveTab(message.id)) {
      return;
    }

    if (message.url) {
      const activeTabUrl = new URL(message.url).hostname;

      settings = await getSavedSettingsForUrl(activeTabUrl);
    }

    Connection.sendToPopup({
      action: ActionNames.contentConnected,
      settings: settings && Object.keys(settings).length ? settings : null,
      url: message.url,
    } satisfies ContentConnectedMessage);
  }

  /**
   * Connect the popup window if it already exists.
   */
  private static async connectToPopup(): Promise<void> {
    if (this.popupWindow) {
      return;
    }

    this.popupWindow = await this.findPopup();

    if (this.popupWindow) {
      Logger.success('Connected to popup');
    }
  }

  /**
   * Listener for messages from content script.
   */
  private static contentListener<Action extends ActionNames>(message: MessageFromContent<Action>) {
    Logger.request(CONTENT, message, true);

    switch (message.action) {
      case ActionNames.contentConnected:
        // Confirm the connection and pass the content script its id.
        Connection.sendToContent({...message, action: ActionNames.contentConnected});
        Connection.flushQueue({type: CONTENT, id: message.id});

        void this.confirmContentConnection({
          ...message,
          url: message.url ?? this.activeTab?.url,
        } as MessageDataWithUrl);
        break;

      case ActionNames.mappedField:
        BackgroundActions.saveMappedField(message);

        this.moveFocus(this.popupWindow);
        break;

      case ActionNames.deleteFields:
        void deleteMappedFields(message as DeleteFieldsMessage);
        break;

      case ActionNames.foundContent:
        Connection.sendToPopup(message as unknown as FoundContentMessage);
        break;
    }
  }

  /**
   * Create popup and load given URL in it.
   */
  private static async createPopup(): Promise<chrome.tabs.Tab> {
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
            // when we open the extension outside the window this will result in an error
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
   * Find an existing popup window by checking all popups containing "tabs" with our popup url.
   */
  private static findPopup(): Promise<chrome.tabs.Tab | undefined> {
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
   * Check if a tab id matches the active tab id. Returns false if not and if there is no active tab.
   */
  private static isActiveTab(tabId?: number): boolean {
    return Boolean(tabId) && tabId === this.activeTab?.id;
  }

  /**
   * Check if a window/tab ID matches the popup window's id. Returns false if not and if the popup window doesn't exist.
   */
  private static isPopup(windowOrTabId?: number): boolean {
    return Boolean(windowOrTabId) && windowOrTabId === this.popupWindow?.windowId;
  }

  /**
   * Check if given tab is a website and not a Chrome page.
   */
  private static isWebsite(tab: chrome.tabs.Tab): boolean {
    const isInvalidTab = tab.id === chrome.tabs.TAB_ID_NONE;

    return Boolean(tab.url?.startsWith('http') && !this.isPopup(tab.id) && !isInvalidTab);
  }

  /**
   * Fetch config file and set variables.
   */
  private static async loadConfig() {
    let appUrlClass = new URL([POPUP_URL, EXTENSION_PATH].join('/'));

    // Resolve url from settings if available. This is used for testing and development environments.
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
   * On moving focus update current window and tab.
   */
  private static moveFocus(tab: undefined | chrome.tabs.Tab = this.activeTab): void {
    if (!tab) {
      return;
    }

    void chrome.windows.update(tab.windowId, {focused: true});
    void chrome.tabs.update({active: true});
  }

  /**
   * Set active tab and send messages to popup and content to process the change.
   */
  private static async onTabHighlighted(info: chrome.tabs.TabHighlightInfo): Promise<void> {
    Logger.event('onTabHighlighted', info);

    const tab = await Chrome.getTabById(info.tabIds[0]);

    await this.activateTab(tab);
  }

  /**
   * Set active tab and send messages to popup and content to process the change.
   */
  private static async onTabReplaced(addedTabId: number, removedTabId: number): Promise<void> {
    Logger.event('onTabReplaced', `${addedTabId}, ${removedTabId}`);

    const tab = await Chrome.getTabById(addedTabId);

    if (!tab) {
      return;
    }

    void this.activateTab(tab);
  }

  /**
   * This is triggered when a tab is updated, e.g. when a page is refreshed, a new URL is loaded or a tab is created.
   */
  private static async onTabUpdated(
    tabId: number | undefined,
    data: {status: string},
    tab: chrome.tabs.Tab | undefined,
  ): Promise<void> {
    Logger.event(`onTabUpdated – ${tabId} – ${data.status}`);

    // Ignore tabs that are not fully loaded.
    if (data.status !== 'complete') {
      return;
    }

    const activeTab = await Chrome.getActiveTab();

    // If the tab is not active, ignore it.
    if (activeTab?.id !== tabId) {
      return;
    }

    void this.activateTab(tab);
  }

  /**
   * Fired when the currently focused window changes. Try to find valid tab in the window, set it as active tab and
   * change app icon. Ignores popups, invalid windows and ignores change if the window id is equal to the previous one.
   */
  private static async onWindowFocusChanged(windowId: number) {
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
  }

  /**
   * When a window is closed check if it's our popup and clean up if so.
   */
  private static onWindowRemoved(windowId: number) {
    if (!this.isPopup(windowId)) {
      return;
    }

    Logger.event('Popup closed');
    this.closePopup();
  }

  /**
   * Listener for messages from popup.
   */
  private static popupListener<Action extends ActionNames>(message: MessageFromPopup<Action>) {
    Logger.request(POPUP, message, true);

    message.url = message.url ?? this.activeTab?.url;

    switch (message.action) {
      case ActionNames.popupConnected:
        Connection.flushQueue({type: POPUP});

        void this.confirmContentConnection(message);
        break;

      case ActionNames.mapField:
        this.moveFocus();
        Connection.sendToContent(message as MessageFromPopup<ActionNames.mapField>);
        break;

      case ActionNames.deleteFields:
        void deleteMappedFields(message as DeleteFieldsMessage);
        break;

      case ActionNames.saveSettings:
        void this.setGlobalSettings((message as SaveSettingsMessage).settings);
        break;

      case ActionNames.getSettings:
        Connection.sendToPopup({
          action: ActionNames.foundSettings,
          settings: this.settings,
        });
        break;

      case ActionNames.getContent:
        void BackgroundActions.getContent(message as MessageGetContentFromPopup);
        break;

      /**
       * Just pass to content.
       */
      case ActionNames.stopMapping:
        Connection.sendToContent(message as StopMappingMessage);
        break;
    }
  }

  /**
   * Get saved settings, merge new settings into them and update the settings object.
   */
  private static async setGlobalSettings(settings?: StoredExtensionSettings) {
    const savedSettings = settings
      ? await BackgroundActions.saveGlobalSettings(settings)
      : await BackgroundActions.getGlobalSettings();

    this.updateGlobalSettings(savedSettings);
  }

  /**
   * Changes the extension icon to given path.
   */
  private static setIcon(path: string = DEFAULT_ICON) {
    chrome.action.setIcon({path}, Chrome.catchError);
  }

  private static updateGlobalSettings(settings: StoredExtensionSettings) {
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
}
