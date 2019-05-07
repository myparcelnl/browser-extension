/* eslint-disable no-magic-numbers,no-console */
import BackgroundActions from './background/BackgroundActions';
import ContextMenu from './background/ContextMenu';
import ActionNames from './helpers/ActionNames';
import Chrome from './helpers/Chrome';
import Config from './helpers/Config';
import Logger from './helpers/Logger'; // strip-log

const env = process.env.NODE_ENV;

/**
 * @type {chrome.tabs.Tab}
 */
export let popup;

/**
 * @type {chrome.tabs.Tab}
 */
export let activeTab;

/**
 * Connection with the popup script..
 *
 * @type {chrome.runtime.Port}
 */
export let popupConnection;

/**
 * Connection with the injected content script.
 *
 * @type {chrome.runtime.Port}
 */
export let contentConnection;

/**
 * Send data to popup.
 *
 * @param {Object} data - Request object.
 * @param addURL
 */
export const sendToPopup = (data, addURL = false) => {
  if (Background.popupConnected) {
    try {
      if (addURL === true) {
        data.url = Background.getURL().hostname;
      }

      popupConnection.postMessage(data);
      Logger.request('popup', data);
    } catch (e) {
      Logger.error('sendToPopup', e);
      addToQueue('popup', data);
    }
  } else {
    addToQueue('popup', data);
  }
};

/**
 * Send data to injected content script.
 *
 * @param {Object} data - Request object.
 */
export const sendToContent = (data) => {
  if (Background.contentConnected) {
    try {
      contentConnection.postMessage(data);
      Logger.request('content', data);
    } catch (e) {
      Logger.error('sendToContent', e);
      addToQueue('content', data);
    }
  } else {
    addToQueue('content', data);
  }
};

/**
 * Helper to add message to given queue.
 *
 * @param {string} type - Queue name. Content or popup.
 * @param {Object} data - Data to add to the queue.
 */
const addToQueue = (type, data) => {
  Logger.request(type, data, 'queue');
  Background[`${type}Queue`].push(data);
};

/**
 * Process queue and empty it afterwards.
 *
 * @param {Array} queue - Which queue to add to. Can be 'content' or 'popup'.
 * @param {Function} sendFunction - Function to process queue items with.
 *
 * @returns {Array}
 */
const flushQueue = (queue, sendFunction) => {
  // Dedupe queue
  const unique = new Set(queue.map((obj) => JSON.stringify(obj)));
  queue = Array.from(unique).map((obj) => JSON.parse(obj));

  queue.forEach((message) => {
    sendFunction(message);
  });

  return [];
};

export default class Background {

  static lastTabId = undefined;
  static lastWindowId = undefined;

  /**
   * @type {Array}
   */
  static popupQueue = [];

  /**
   * @type {Array}
   */
  static contentQueue = [];

  /**
   * @type {boolean|number}
   */
  static popupConnected = false;

  /**
   * Tab id and url of content connection or false.
   *
   * @type {boolean|Object}
   */
  static contentConnected = false;

  /**
   * Pre boot function. This communicates with the `default_popup` allowing the user to choose a platform.
   */
  static preBoot() {
    // Set popup.html as popup
    chrome.browserAction.setPopup({popup: chrome.extension.getURL(Config.bootPopup)});

    Logger.event('Awaiting boot choice.');

    const listener = async(appName) => {
      Logger.event(`Attempting to load app "${appName}"`);
      await this.boot(appName);
      chrome.runtime.onMessage.removeListener(listener);
    };
    chrome.runtime.onMessage.addListener(listener);
  }

  /**
   * Loads config file then binds all events and scripts.
   *
   * @param {string} app - App name.
   */
  static async boot(app) {
    // Remove selection popup
    await chrome.browserAction.setPopup({popup: ''});

    await this.loadConfig(app);
    await this.setSettings();

    this.bindEvents();
    this.bindPopupScript();
    this.bindContentScript();

    this.openPopup();
  }

  /**
   * Get saved settings, merge new settings into them and update the settings object.
   *
   * @param {Object} settings - Settings object.
   */
  static async setSettings(settings = {}) {
    if (Object.keys(settings).length) {
      settings = await BackgroundActions.saveSettings(settings);
    } else {
      settings = await BackgroundActions.getSettings();
    }

    this.updateSettings(settings);
  }

  /**
   * Update settings.
   *
   * @param {Object} settings - Settings object.
   *
   * @returns {undefined}
   */
  static updateSettings(settings) {
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
   * @param {string} app - App name.
   *
   * @returns {Promise}
   */
  static async loadConfig(app) {
    const response = await fetch(chrome.extension.getURL(Config.configFile));
    const json = await response.json();

    let appURL = json.apps[env][app];
    appURL = new URL(appURL);
    appURL.searchParams.set('referralurl', encodeURIComponent(appURL.pathname));
    appURL.searchParams.set('origin', 'browser-extension');

    // Get app by current environment and name.
    this.popupExternalURL = appURL.href;
    this.popupDimensions = json.popupDimensions;
  }

  /**
   * Bind the popup script connection and map external ActionNames.
   */
  static bindPopupScript() {
    chrome.runtime.onConnectExternal.addListener((port) => {
      popupConnection = port;
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
      contentConnection = port;
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
  static async popupListener(request) {
    Logger.request('popup', request, true);

    switch (request.action) {

      case ActionNames.popupConnected:
        this.onPopupConnect();
        break;

      case ActionNames.mapField:
        this.moveFocus();
        sendToContent(request);
        break;

      case ActionNames.deleteFields:
        BackgroundActions.deleteFields(request);
        break;

      case ActionNames.saveSettings:
        this.setSettings(request.settings);
        break;

      case ActionNames.getSettings:
        sendToPopup({action: ActionNames.foundSettings, settings: this.settings});
        break;

      case ActionNames.getContent:
        try {
          const {href, hostname} = await this.getURL();
          await BackgroundActions.getContent({...request, url: hostname, href});
        } catch (e) {
          console.log(e);
        }
        break;
    }
  }

  /**
   * Get the active tab URL if available.
   *
   * @returns {URL}
   */
  static getURL() {
    if (activeTab) {
      return new URL(activeTab.url);
    }
  }

  /**
   * Listener for content script ActionNames.
   *
   * @param {Object} request - Request object.
   */
  static async contentScriptListener(request) {
    Logger.request('content', request, true);

    switch (request.action) {
      case ActionNames.contentConnected:
        this.onContentConnect(request);
        break;

      case ActionNames.mappedField:
        BackgroundActions.saveMappedField(request);
        this.moveFocus(popup);
        break;

      case ActionNames.deleteFields:
        BackgroundActions.deleteFields(request);
        break;

      case ActionNames.foundContent:
        sendToPopup(request);
        break;
    }
  }

  /**
   * Set popupConnected, flush the popup queue and tell the popup the background is ready.
   */
  static onPopupConnect() {
    this.popupConnected = true;
    Logger.info('Sending popup queue');
    this.popupQueue = flushQueue(this.popupQueue, sendToPopup);
  }

  /**
   * Set contentConnected, flush the content queue and tell the popup the content script is ready.
   *
   * @param {Object} request - Request object.
   */
  static onContentConnect(request) {
    this.contentConnected = request.url;

    Logger.info('Sending content queue');
    this.contentQueue = flushQueue(this.contentQueue, sendToContent);

    sendToPopup({...request, action: ActionNames.contentConnected});
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
   */
  static injectScripts(tab) {
    const insertScripts = () => {
      Logger.event(`Injecting css and js on ${new URL(tab.url).hostname}.`);
      chrome.tabs.insertCSS(tab.id, {file: Config.contentCSS}, Chrome.catchError);
      chrome.tabs.executeScript(tab.id, {file: Config.contentJS}, Chrome.catchError);
    };

    try {
      contentConnection.postMessage({action: ActionNames.checkContentConnection});
    } catch (e) {
      Logger.warning(e);
      insertScripts();
    }
  }

  /**
   * Set active tab and send messages to popup and content to process the change.
   *
   * @param {number} addedTabId - Tab ID.
   * @param {number} removedTabId - Tab ID.
   *
   * @return {Promise<undefined>}
   */
  static async switchTab(addedTabId, removedTabId) {
    // Check if id equals id of console windows or popup id
    if (addedTabId === chrome.tabs.TAB_ID_NONE || (popup && addedTabId === popup.id)) {
      return;
    }

    Logger.event('switchTab', `addedTabId: ${addedTabId}, removedTabId: ${removedTabId}`);
    if (await this.activateTab()) {
      sendToPopup({action: ActionNames.switchedTab}, true);
    }
  }

  /**
   * Set active tab and send messages to popup and content to process the change.
   *
   * @param {chrome.tabs.TabHighlightInfo} info - Chrome highlight info/.
   */
  static async highlightTab(info) {
    Logger.event('highlightTab', info);

    const tab = chrome.tabs.get(info.tabIds[0], (tab) => tab);

    if (await this.activateTab(tab)) {
      sendToPopup({action: ActionNames.switchedTab}, true);
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
          currentWindow: true,
          highlighted: true,
          windowType: 'normal',
        },
        (tabs) => resolve(tabs[0]),
      );
    });
  }

  /**
   * On updating tab set new tab as active tab and change app icon.
   *
   * @param {number} id - Chrome tab ID.
   * @param {chrome.tabs.TabChangeInfo} data - Chrome event data.
   * @param {chrome.tabs.Tab} tab  - Chrome tab object.
   */
  static updateTab(id, data, tab) {
    if (popup && tab.id === popup.id) {
      return;
    }

    Logger.event(`updateTab – ${data.status}`);
    if (data.status === 'complete') {
      activeTab = undefined;
      this.setIcon();

      this.activateTab(tab);
      sendToPopup({action: ActionNames.switchedTab}, true);
    }
  }

  /**
   * Fired when the currently focused window changes. Try to find valid tab in the window, set it as active tab and
   * change app icon. Ignores popups, invalid windows and ignores change if the window id is equal to the previous one.
   *
   * @param {number} windowId - ID of the newly-focused window.
   */
  static changeFocus(windowId) {
    if (windowId === chrome.windows.WINDOW_ID_NONE
      || windowId === this.lastWindowId
      || (!!popup && windowId === popup.windowId)
    ) {
      return;
    }

    Logger.event('changeFocus', windowId);

    this.lastWindowId = windowId;
    activeTab = undefined;
    this.setIcon();
    this.activateTab();
    sendToPopup({action: ActionNames.switchedTab}, true);
  }

  /**
   * When a window is closed check if it's our popup and clean up if so.
   *
   * @param {number} windowId - Chrome window ID.
   */
  static checkPopupClosed(windowId) {
    if (popup && windowId === popup.windowId) {
      this.closePopup(windowId);
    }
  }

  /**
   * Set given tab to active and content scripts on tab.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   *
   * @returns {boolean}
   */
  static async activateTab(tab = undefined) {
    if (!tab) {
      tab = await this.getActiveTab();
    }
    console.log('activateTab:', tab);

    if (!tab || tab.url === this.popupExternalURL) {
      Logger.warning('activateTab: Can\'t activate popup.');
      return false;
    }

    if ((!!popup && tab.windowId === popup.windowId) || (!!activeTab && tab.id === activeTab.id)) {
      Logger.warning('activateTab: Tab is popup or already active.');
      return false;
    }

    if (this.isWebsite(tab)) {
      activeTab = tab;
      this.injectScripts(tab);
      Logger.success(`activateTab: Tab activated: ${tab.url}`);
    } else {
      activeTab = undefined;
    }
  }

  /**
   * On moving focus update current window and tab.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   */
  static moveFocus(tab = activeTab) {
    chrome.windows.update(tab.windowId, {focused: true});
    chrome.tabs.update({active: true});
  }

  /**
   * Check if given tab is a website and not a Chrome page.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   *
   * @returns {boolean}
   */
  static isWebsite(tab) {
    const notPopup = popup ? tab.id !== popup.id : true;
    const isTab = tab.id !== chrome.tabs.TAB_ID_NONE;

    return tab.url && tab.url.startsWith('http') && notPopup && isTab;
  }

  /**
   * Create popup and load given URL in it.
   *
   * @returns {Promise<chrome.tabs.Tab>}
   */
  static createPopup() {
    return new Promise((resolve) => {
      const {height, width} = this.popupDimensions;
      chrome.windows.getCurrent((win) => {
        chrome.windows.create({
          url: this.popupExternalURL,
          type: 'popup',
          left: win.left + win.width,
          top: win.top,
          setSelfAsOpener: true, // TODO: THIS IS A CHROME 64+ FEATURE :(
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
   */
  static async openPopup() {
    await this.activateTab();

    if (popup) {
      await this.showPopup();
    } else {
      chrome.windows.getAll(
        {windowTypes: ['popup']},
        (popups) => {
          popups.forEach((popup) => {
            chrome.windows.remove(popup.id, Chrome.catchError);
          });
        },
      );
      popup = await this.createPopup();
    }

    this.setIcon(Config.activeIcon);
  }

  /**
   * Switch focus to our popup.
   */
  static showPopup() {
    chrome.windows.getCurrent(() => {
      chrome.windows.update(
        popup.windowId,
        {
          focused: true,
          drawAttention: true,
        },
      );
    });
  }

  /**
   * Clean up on closing of popup. Resets variables and extension icon.
   */
  static async closePopup() {
    await sendToContent({action: ActionNames.stopListening});
    popup = undefined;
    popupConnection = undefined;
    activeTab = undefined;
    this.popupConnected = false;
    this.setIcon();
  }

  /**
   * Changes the extension icon to given path.
   *
   * @param {string} path - Path to icon file.
   */
  static setIcon(path = Config.defaultIcon) {
    chrome.browserAction.setIcon({path}, Chrome.catchError);
  }
}

Background.preBoot();
