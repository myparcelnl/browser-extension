import ActionNames from './helpers/ActionNames';
import BackgroundActions from './background/BackgroundActions';
import Chrome from './helpers/Chrome';
import Config from './helpers/Config';
import Connection from './background/Connection';
import ContextMenu from './background/ContextMenu';
import Logger from './helpers/Logger'; // strip-log
import storage from './background/storage';

const manifest = chrome.runtime.getManifest();

const env = manifest.version_name.split('-')[1] || process.env.NODE_ENV;

export default class Background {
  /**
   * The popup window the backoffice runs in.
   *
   * @type {chrome.tabs.Tab}
   */
  static popupWindow;

  /**
   * Current active tab.
   *
   * @type {chrome.tabs.Tab}
   */
  static activeTab;

  /**
   * ID of the last window the browser was focused on.
   *
   * @type {Number}
   */
  static lastWindowId;

  /**
   * Loads config file then binds all events and scripts.
   *
   * @returns {Promise}
   */
  static async boot() {
    await this.loadConfig();
    await this.setGlobalSettings();

    this.bindEvents();
    this.bindPopupScript();
    this.bindContentScript();
  }

  /**
   * Get saved settings, merge new settings into them and update the settings object.
   *
   * @param {Object} settings - Settings object.
   *
   * @returns {Promise}
   */
  static async setGlobalSettings(settings = {}) {
    if (Object.keys(settings).length) {
      settings = await BackgroundActions.saveGlobalSettings(settings);
    } else {
      settings = await BackgroundActions.getGlobalSettings();
    }

    this.updateGlobalSettings(settings);
  }

  /**
   * Update settings.
   *
   * @param {Object} settings - Settings object.
   *
   * @returns {undefined}
   */
  static updateGlobalSettings(settings) {
    this.settings = settings;

    const contextMenusClickListener = (data) => ContextMenu.activate(data);
    if (settings.enable_context_menu === true) {
      ContextMenu.create(ContextMenu.find(Config.contextMenuCreateShipment));
      // On opening context menu (right click)
      chrome.contextMenus.onClicked.addListener(contextMenusClickListener);
    } else {
      ContextMenu.remove(Config.contextMenuCreateShipment);
      chrome.contextMenus.onClicked.removeListener(contextMenusClickListener);
    }
  }

  /**
   * Fetch config file and set variables.
   *
   * @returns {Promise}
   */
  static async loadConfig() {
    const response = await fetch(chrome.extension.getURL(Config.configFile));
    const json = await response.json();

    const path = json.extension_path;
    const appUrl = json.urls[env];

    let appUrlClass = new URL([appUrl, path].join('/'));

    await new Promise((resolve) => {
      chrome.storage.sync.get({backofficeUrl: ''}, ({backofficeUrl}) => {
        if (backofficeUrl) {
          appUrlClass = new URL([backofficeUrl, path].join('/'));
        }
        resolve();
      });
    });

    appUrlClass.searchParams.set('referralurl', encodeURIComponent(json.extension_path));
    appUrlClass.searchParams.set('origin', 'browser-extension');

    // Get app by current environment and name.
    this.popupExternalURL = appUrlClass.href;
    this.popupDimensions = json.popupDimensions;
  }

  /**
   * Bind the popup script connection and map external ActionNames.
   */
  static bindPopupScript() {
    chrome.runtime.onConnectExternal.addListener((port) => {
      Connection.popup = port;
      Connection.sendToPopup({
        action: ActionNames.booted,
        version: manifest.version,
      });

      port.onMessage.addListener((...args) => {
        this.popupListener(...args);
      });
    });
  }

  /**
   * Bind the injected content script connection and map ActionNames.
   */
  static bindContentScript() {
    chrome.runtime.onConnect.addListener((port) => {
      Connection.content = port;
      port.onMessage.addListener((...args) => {
        this.contentScriptListener(...args);
      });
    });
  }

  /**
   * Listener for popup script ActionNames.
   *
   * @param {Object} request - Request object.
   *
   * @returns {undefined}
   */
  static popupListener(request) {
    Logger.request(Connection.POPUP, request, true);

    switch (request.action) {
      case ActionNames.popupConnected:
        Connection.onPopupConnect();
        break;

      case ActionNames.checkContentConnection:
        this.confirmContentConnection();
        break;

      case ActionNames.mapField:
        this.moveFocus();
        Connection.sendToContent(request);
        break;

      case ActionNames.deleteFields:
        BackgroundActions.deleteFields(request);
        break;

      case ActionNames.saveSettings:
        this.setGlobalSettings(request.settings);
        break;

      case ActionNames.getSettings:
        Connection.sendToPopup({
          action: ActionNames.foundSettings,
          settings: this.settings,
        });
        break;

      case ActionNames.getContent:
        BackgroundActions.getContent(request);
        break;

      /**
       * Just pass to content.
       */
      case ActionNames.stopMapping:
        Connection.sendToContent(request);
        break;
    }
  }

  /**
   * Listener for content script ActionNames.
   *
   * @param {Object} request - Request object.
   */
  static contentScriptListener(request) {
    Logger.request(Connection.CONTENT, request, true);

    switch (request.action) {
      case ActionNames.contentConnected:
        Connection.onContentConnect(request);
        break;

      case ActionNames.mappedField:
        BackgroundActions.saveMappedField(request);
        this.moveFocus(this.popupWindow);
        break;

      case ActionNames.deleteFields:
        BackgroundActions.deleteFields(request);
        break;

      case ActionNames.foundContent:
        const {origin, ...newRequest} = request;
        Connection.sendToPopup(newRequest);
        break;
    }
  }

  /**
   * Binds all browser events to functions.
   */
  static bindEvents() {
    const browserActionClickListener = (...args) => {
      this.openPopup(...args);
    };

    const windowRemoveListener = (...args) => {
      this.checkPopupClosed(...args);
    };

    const tabReplaceListener = (...args) => {
      this.switchTab(...args);
    };

    const tabHighlightListener = (...args) => {
      this.highlightTab(...args);
    };

    const tabUpdateListener = (...args) => {
      this.updateTab(...args);
    };

    const focusChangeListener = (...args) => {
      this.changeFocus(...args);
    };

    // Extension button click
    chrome.browserAction.onClicked.addListener(browserActionClickListener);

    // Tab listeners
    chrome.tabs.onHighlighted.addListener(tabHighlightListener);
    chrome.tabs.onReplaced.addListener(tabReplaceListener);
    chrome.tabs.onUpdated.addListener(tabUpdateListener);

    // Window listeners
    chrome.windows.onFocusChanged.addListener(focusChangeListener);
    chrome.windows.onRemoved.addListener(windowRemoveListener);
  }

  /**
   * Checks if script and css are present on current tab and injects them if not.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   *
   * @returns {Promise}
   */
  static injectScripts(tab) {
    return new Promise((resolve) => {
      const insertScripts = () => {
        Logger.info(`Injecting css and js on ${new URL(tab.url).hostname}.`);
        chrome.tabs.insertCSS(tab.id, {file: Config.contentCSS}, Chrome.catchError);
        chrome.tabs.executeScript(tab.id, {file: Config.contentJS}, Chrome.catchError);
        resolve(true);
      };

      if (Connection.contentConnected === tab.url) {
        try {
          // Use content connection directly instead of sendToContent to skip the queue
          Connection.content.postMessage({action: ActionNames.checkContentConnection});
          resolve(true);
        } catch (e) {
          insertScripts();
        }
      } else {
        insertScripts();
      }
    });
  }

  /**
   * Set active tab and send messages to popup and content to process the change.
   *
   * @param {Number} addedTabId - Tab ID.
   * @param {Number} removedTabId - Tab ID.
   *
   * @returns {undefined}
   */
  static switchTab(addedTabId, removedTabId) {
    Connection.contentConnected = false;

    const isInvalidTab = addedTabId === chrome.tabs.TAB_ID_NONE;

    if (isInvalidTab || this.isPopup(addedTabId)) {
      return;
    }

    Logger.event('switchTab', `addedTabId: ${addedTabId}, removedTabId: ${removedTabId}`);
    this.activateTab();
  }

  /**
   * Set active tab and send messages to popup and content to process the change.
   *
   * @param {chrome.tabs.TabHighlightInfo} info - Chrome highlight info.
   */
  static async highlightTab(info) {
    Logger.event('highlightTab', info);

    const tab = chrome.tabs.get(info.tabIds[0], (tab) => {
      return tab;
    });

    if (await this.activateTab(tab)) {
      Connection.sendToPopup({action: ActionNames.switchedTab});
    }
  }

  /**
   * Gets the active tab based on a query.
   *
   * @see https://developer.chrome.com/extensions/tabs#method-query
   *
   * @returns {Promise<chrome.tabs.Tab>}
   */
  static getActiveTab() {
    return new Promise((resolve) => {
      chrome.tabs.query(
        {
          active: true,
          highlighted: true,
          // Exclude popups and other unexpected "tabs"
          windowType: 'normal',
        },
        (tabs) => resolve(tabs[0] || {}),
      );
    });
  }

  /**
   * On updating tab set new tab as active tab and change app icon.
   *
   * @param {Number} id - Chrome tab ID.
   * @param {chrome.tabs.TabChangeInfo} data - Chrome event data.
   * @param {chrome.tabs.Tab} tab -  - Chrome tab object.
   *
   * @returns {undefined}
   */
  static updateTab(id, data, tab) {
    if (this.isPopup(id) || !this.isActiveTab(tab.id)) {
      return;
    }

    Logger.event(`updateTab – ${data.status}`);
    if (data.status === 'complete') {
      this.activeTab = undefined;
      this.setIcon();

      this.activateTab(tab);
      Connection.sendToPopup({action: ActionNames.switchedTab});
    }
  }

  /**
   * Fired when the currently focused window changes. Try to find valid tab in the window, set it as active tab and
   * change app icon. Ignores popups, invalid windows and ignores change if the window id is equal to the previous one.
   *
   * @param {Number} windowId - ID of the newly-focused window.
   */
  static changeFocus(windowId) {
    const isInvalidTab = windowId === chrome.windows.WINDOW_ID_NONE;
    const tabDidNotChange = windowId === this.lastWindowId;

    if (!this.popupWindow
      || isInvalidTab
      || tabDidNotChange
      || this.isPopup(windowId)
    ) {
      return;
    }

    Logger.event('changeFocus', windowId);

    this.lastWindowId = windowId;
    this.activeTab = undefined;
    this.setIcon();
    this.activateTab();
    Connection.sendToPopup({action: ActionNames.switchedTab});
  }

  /**
   * When a window is closed check if it's our popup and clean up if so.
   *
   * @param {Number} windowId - Chrome window ID.
   */
  static checkPopupClosed(windowId) {
    if (this.isPopup(windowId)) {
      Logger.event('Popup closed');
      this.closePopup(windowId);
    }
  }

  /**
   * Set given tab to active and content scripts on tab.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   *
   * @returns {undefined}
   */
  static async activateTab(tab = undefined) {
    if (!this.popupWindow) {
      return;
    }

    if (!tab) {
      tab = await this.getActiveTab();
    }

    if (this.isPopup(tab.windowId) || this.isActiveTab(tab.windowId)) {
      return;
    }

    if (this.isWebsite(tab)) {
      this.activeTab = tab;
      Logger.success(`Active tab: ${tab.url}`);

      await this.injectScripts(tab);
    } else {
      this.activeTab = undefined;
    }

    await this.confirmContentConnection();
  }

  /**
   * On moving focus update current window and tab.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   */
  static moveFocus(tab = this.activeTab) {
    chrome.windows.update(tab.windowId, {focused: true});
    chrome.tabs.update({active: true});
  }

  /**
   * Check if given tab is a website and not a Chrome page.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   *
   * @returns {Boolean}
   */
  static isWebsite(tab) {
    const isInvalidTab = tab.id === chrome.tabs.TAB_ID_NONE;

    return tab.url && tab.url.startsWith('http') && !this.isPopup(tab.id) && !isInvalidTab;
  }

  /**
   * Create popup and load given URL in it.
   *
   * @returns {Promise<chrome.tabs.Tab>}
   */
  static createPopup() {
    return new Promise((resolve) => {
      const {height, width} = this.popupDimensions;

      // Find popups we created and close them before creating a new one.
      // This is done by checking all popups containing "tabs" with our popup url.
      chrome.windows.getAll({windowTypes: ['popup']}, (popups) => {
        popups.forEach((popup) => {
          chrome.tabs.query({windowId: popup.id}, (tab) => {
            tab.forEach((tab) => {
              // If the popup url has the same hostname as the one we are going to create, close it.
              if (new URL(tab.url).hostname === new URL(this.popupExternalURL).hostname) {
                chrome.windows.remove(tab.windowId);
              }
            });
          });
        });
      });

      chrome.windows.getCurrent((win) => {
        chrome.windows.create({
          url: this.popupExternalURL,
          type: 'popup',
          left: win.left + win.width,
          top: win.top,
          // TODO: `setSelfAsOpener` is a chrome 64+ feature :(
          setSelfAsOpener: true,
          height,
          width,
        },
        (win) => {
          resolve(win.tabs[0]);
        });
      });
    });
  }

  /**
   * Show popup if it exists or create it.
   *
   * @returns {Promise}
   */
  static async openPopup() {
    if (this.popupWindow) {
      this.moveFocus(this.popupWindow);
    } else {
      this.popupWindow = await this.createPopup();
    }

    await this.activateTab();
    this.setIcon(Config.activeIcon);
  }

  /**
   * Clean up on closing of popup. Tells content connection to stop listening and resets variables and extension icon.
   */
  static closePopup() {
    Connection.sendToContent({action: ActionNames.stopListening});

    Connection.popup = undefined;
    Connection.popupConnected = false;

    this.activeTab = undefined;
    this.popupWindow = undefined;

    this.setIcon();
  }

  /**
   * Changes the extension icon to given path.
   *
   * @param {String} path - Path to icon file.
   */
  static setIcon(path = Config.defaultIcon) {
    chrome.browserAction.setIcon({path}, Chrome.catchError);
  }

  /**
   * Get the active tab URL if available.
   *
   * @returns {String}
   */
  static getURL() {
    if (this.activeTab) {
      return this.activeTab.url;
    }
  }

  /**
   * Check if a window/tab ID matches the popup window's id. Returns false if not and if the popup window doesn't exist.
   *
   * @param {Number} windowOrTabId
   * @returns {Boolean}
   */
  static isPopup(windowOrTabId) {
    return this.popupWindow && windowOrTabId === this.popupWindow.windowId;
  }

  /**
   * Check if a tab id matches the active tab id. Returns false if not and if there is no active tab.
   *
   * @param {Number} tabId
   * @returns {Boolean}
   */
  static isActiveTab(tabId) {
    return this.activeTab && tabId === this.activeTab.id;
  }

  /**
   * Validates the connection with the content and tells the popup some things about the current tab.
   *
   * @param {Object} data - Additional data to merge into the message.
   */
  static async confirmContentConnection(data = {}) {
    let settings = null;

    if (this.activeTab) {
      const activeTabUrl = new URL(this.activeTab.url).hostname;
      settings = await storage.getSavedSettingsForUrl(activeTabUrl);

      if (!Object.keys(settings).length) {
        settings = null;
      }
    }

    Connection.sendToPopup(
      {
        action: ActionNames.contentConnected,
        settings,
        ...data,
      },
    );
  }
}

Background.boot();
