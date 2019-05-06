/* eslint-disable no-magic-numbers,no-console */
import ActionNames from './helpers/ActionNames';
import BackgroundActions from './background/BackgroundActions';
import Chrome from './helpers/Chrome';
import Config from './helpers/Config';
import ContextMenu from './background/ContextMenu';
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
 */
export const sendToPopup = (data) => {
  if (Background.popupConnected) {
    try {
      popupConnection.postMessage(data);
      Logger.request('popup', data);
    } catch (e) {
      Logger.error(e);
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
      Logger.error(`sendToContent: ${e}`);
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
   * @type {boolean|number}
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

    console.log('settings', settings);
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

    console.log(appURL);

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
        const url = await this.getURL();
        await BackgroundActions.getContent({...request, url});
        break;
    }
  }

  /**
   * Get the active tab URL if available.
   *
   * @returns {URL}
   */
  static async getURL() {
    // Try to find the active tab
    if (!activeTab) {
      const tab = await this.getActiveTab();
      this.activateTab(tab);
    }

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
        await this.onContentConnect(request);
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
    this.contentConnected = activeTab.id;
    Logger.info('Sending content queue');
    this.contentQueue = flushQueue(this.contentQueue, sendToContent);

    sendToPopup({...request, action: ActionNames.backgroundConnected});
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

    const tabUpdateListener = (...args) => {
      this.updateTab(...args);
    };

    // Extension button click
    chrome.browserAction.onClicked.addListener(browserActionClickListener);

    // Tab listeners
    chrome.tabs.onHighlighted.addListener(tabReplaceListener);
    chrome.tabs.onReplaced.addListener(tabReplaceListener);
    chrome.tabs.onUpdated.addListener(tabUpdateListener);

    // Window listeners
    chrome.windows.onFocusChanged.addListener(tabReplaceListener);
    chrome.windows.onRemoved.addListener(windowRemoveListener);
  }

  /**
   * Checks if script and css are present on current tab and injects them if not.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   */
  static injectScripts(tab) {
    if (!tab) {
      return;
    }

    const insertScripts = () => {
      Logger.event(`Injecting css and js on ${new URL(tab.url).hostname}.`);
      chrome.tabs.insertCSS(tab.id, {file: Config.contentCSS}, Chrome.catchError);
      chrome.tabs.executeScript(tab.id, {file: Config.contentJS}, Chrome.catchError);
    };

    try {
      if (tab.id === this.contentConnected) {
        Logger.event('Script already present');
        sendToContent({action: ActionNames.checkContentConnection});
      } else {
        throw 'Content not connected';
      }
    } catch (e) {
      Logger.warning(e);
      insertScripts();
      sendToContent({action: ActionNames.checkContentConnection});
    }
  }

  /**
   * Set active tab and send messages to popup and content to process the change.
   *
   * @param {number} id - Tab ID.
   *
   * @return {Promise<undefined>}
   */
  static async switchTab(id) {
    // Tab id for console windows and such
    if (id === chrome.tabs.TAB_ID_NONE) {
      return;
    }

    const tab = await this.getActiveTab();

    if (this.activateTab(tab)) {
      sendToPopup({action: ActionNames.switchedTab, url: this.getURL().hostname});
    }
  }

  /**
   * Gets the active tab based on a query.
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
        },
        (tabs) => resolve(tabs[0]),
      );
    });
  }

  /**
   * On updating tab set new tab as active tab and change app icon.
   *
   * @param {number} id   - Chrome tab ID.
   * @param {chrome.tabs.TabChangeInfo} data - Chrome event data.
   * @param {chrome.tabs.Tab} tab  - Chrome tab object.
   */
  static async updateTab(id, data, tab) {
    Logger.event('updateTab');
    if (data.status === 'complete') {
      activeTab = undefined;
      this.setIcon();

      this.activateTab(tab);
      sendToPopup({action: ActionNames.switchedTab, url: await this.getURL().hostname});
    }
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
  static async activateTab(tab) {
    if (!tab) {
      tab = await this.getActiveTab();
    }

    if (!tab || tab.url === this.popupExternalURL) {
      return false;
    }

    if (!tab || !popup || tab.windowId === popup.windowId || (!!activeTab && tab.id === activeTab.id)) {
      Logger.warning('No tab to activate.');
      return false;
    }

    activeTab = tab;
    Logger.success(`Tab activated: ${tab.url}`);

    if (this.isWebsite(tab)) {
      this.injectScripts(tab);
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
    const notPopup = popup ? tab.windowId !== popup.windowId : true;
    const isTab = tab.id !== chrome.tabs.TAB_ID_NONE;

    const bool = tab.url && tab.url.startsWith('http') && notPopup && isTab;
    Logger.info(`${tab.url} is ${bool ? '' : 'not'} a website`);
    return bool;
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
   *
   * @param {chrome.tabs.Tab} tab - The tab the extension button was clicked from..
   */
  static async openPopup(tab = null) {
    if (tab) {
      this.activateTab(tab);
    }

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
