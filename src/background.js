/* eslint-disable no-magic-numbers,no-console */
import ActionNames from './helpers/ActionNames';
import BackgroundActions from './background/BackgroundActions';
import Chrome from './helpers/Chrome';
import Config from './helpers/Config';
import ContextMenu from './background/ContextMenu';
import Logger from './helpers/Logger'; // strip-log

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
      Background.popupQueue.push(data);
    }
  } else {
    Logger.request('popup', data, 'queue');
    Background.popupQueue.push(data);
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
      Logger.error(e);
      Background.contentQueue.push(data);
    }
  } else {
    Background.contentQueue.push(data);
  }
};

/**
 * Process queue and empty it afterwards.
 *
 * @param {Array} queue - Which queue to add to. Can be 'content' or 'popup'.
 * @param {Function} sendFunction - Function to process queue items with.
 *
 * @return {Array}
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

    this.setSettings();
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
   * @return {undefined}
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
   * @return {Promise}
   */
  static async loadConfig(app) {
    const response = await fetch(chrome.extension.getURL(Config.configFile));
    const json = await response.json();

    let appURL = json.apps[process.env.NODE_ENV][app];
    appURL = new URL(appURL);
    appURL.searchParams.set('referralurl', appURL.pathname);

    // Get app by current environment and name.
    this.popupExternalURL = appURL.href;
    this.popupDimensions = json.popupDimensions;
    this.development = json.development;
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
   * @return {undefined}
   */
  static async popupListener(request) {
    Logger.request('popup', request, true);

    switch (request.action) {

      case ActionNames.popupConnected:
        this.onPopupConnect();
        break;
        // sendToContent({action: Actions.checkContentConnection});

        // case ActionNames.contentConnected:
        //   sendToPopup(request);
        //   break;

      case ActionNames.mapField:
        this.moveFocus();
        sendToContent(request);
        break;

      case ActionNames.deleteFields:
        BackgroundActions.deleteFields(request);
        break;

        // case ActionNames.getPreset:
        //   BackgroundActions.getPreset(request.preset);
        //   break;

      case ActionNames.saveSettings:
        this.setSettings(request.settings);
        break;

      case ActionNames.getSettings:
        // this.setSettings();
        console.log('current settings', this.settings);
        sendToPopup({action: ActionNames.foundSettings, settings: this.settings});
        break;

      case ActionNames.getContent:
        const url = await this.getURL();
        if (!!url) {
          await BackgroundActions.getContent({...request, url});
        }
        break;
    }
  }

  /**
   * Get the active tab URL if available.
   *
   * @return {URL}
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

      case ActionNames.trackShipment:
        BackgroundActions.trackShipment(
          request.barcode,
          request.postalCode,
          request.countryCode
        );
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

    // if (activeTab && activeTab.url) {
    //   ActionNames.getContent({url: this.getURL()});
    // }
  }

  /**
   * Set contentConnected, flush the content queue and tell the popup the content script is ready.
   *
   * @param {Object} request - Request object.
   */
  static onContentConnect(request) {
    console.log('onContentConnect', activeTab);
    // console.log('onContentConnect', chrome.windows.getAll((windows) => windows.map(
    //   (window) => {
    //     console.log(window)
    //     if (!window.tabs) {
    //       Logger.error('no tabs');
    //       return;
    //     }
    //
    //     window.tabs.map(
    //       (tab) => {
    //         console.log(`${tab.title} tab.id: `, tab.id);
    //         console.log(`${tab.title} tab.windowId: `, tab.windowId);
    //       }
    //     );
    //   }
    // )));

    this.contentConnected = activeTab.id;
    Logger.info('Sending content queue');
    this.contentQueue = flushQueue(this.contentQueue, sendToContent);

    // await BackgroundActions.getContent({...request, url: this.getURL()});
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

    const tabReplaceListener = () => {
      this.switchTab();
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
    }
  }

  /**
   * Set active tab and send messages to popup and content to process the change.
   */
  static async switchTab() {
    const tab = await this.getActiveTab();

    if (this.activateTab(tab)) {
      sendToPopup({action: ActionNames.switchedTab, url: this.getURL().hostname});
    }
    // sendToContent({action: ActionNames.switchedTab});
  }

  /**
   * Gets the active tab based on a query.
   *
   * @return {Promise<chrome.tabs.Tab>}
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
  static updateTab(id, data, tab) {
    Logger.event('updateTab');
    if (data.status === 'complete' && (!activeTab || activeTab.id !== tab.id)) {
      this.activateTab(tab);
      this.setIcon();

      sendToContent({action: ActionNames.checkContentConnection});
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
   * @return {boolean}
   */
  static activateTab(tab) {
    // try {
    //   console.log(activeTab);
    //   console.log('!tab', !tab);
    //   console.log('!popup', !popup);
    //   console.log('tab.windowId === popup.windowId', tab.windowId === popup.windowId);
    //   console.log('!!activeTab && tab.windowId === activeTab.windowId', !!activeTab && tab.windowId === activeTab.windowId);
    //   console.log('tab.url === this.popupExternalURL', tab.url === this.popupExternalURL);
    // } catch (e) {
    //   console.log(e);
    // }

    if (!tab || tab.url === this.popupExternalURL) {
      return false;
    }

    if (
      !tab
      || !popup
      || tab.windowId === popup.windowId
      || (!!activeTab && tab.id === activeTab.id)
    ) {
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
   * @return {boolean}
   */
  static isWebsite(tab) {
    console.log('isWebsite? ', tab);
    const notPopup = popup ? tab.windowId !== popup.windowId : true;

    return tab.url && tab.url.startsWith('http') && notPopup;
  }

  /**
   * Create popup and load given URL in it.
   *
   * @return {Promise<chrome.tabs.Tab>}
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
