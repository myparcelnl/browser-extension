/* eslint-disable no-magic-numbers,no-console */
import actionNames from './helpers/actionNames';
import actions from './background/actions';
import config from './helpers/config';
import contextMenu from './background/context-menu';
import defaultSettings from './settings/defaultSettings';
import log from './helpers/log';
import storage from './background/storage';

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
 * @type {MessagePort}
 */
export let popupConnection;

/**
 * Connection with the injected content script.
 *
 * @type {MessagePort}
 */
export let contentConnection;

/**
 * Send data to popup.
 *
 * @param {Object} data - Request object.
 */
export const sendToPopup = (data) => {
  if (background.popupConnected) {
    log.popup(data.action);
    popupConnection.postMessage(data);
  } else {
    log.popup(data.action, 'queue');
    background.popupQueue.push(data);
  }
};

/**
 * Send data to injected content script.
 *
 * @param {Object} data - Request object.
 */
export const sendToContent = (data) => {
  log.content(data.action);
  if (background.contentConnected) {
    contentConnection.postMessage(data);
  } else {
    background.contentQueue.push(data);
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

const background = {

  /**
   * Loads config file then binds all events and scripts.
   */
  async boot() {
    await this.loadConfig('flespakket');

    this.settings = defaultSettings;

    this.popupQueue = [];
    this.contentQueue = [];

    this.popupConnected = false;
    this.contentConnected = false;

    this.getSettings();
    this.bindEvents();

    if (this.settings.context_menu_enabled === true) {
      contextMenu.create();
    }

    this.bindPopupScript();
    this.bindContentScript();
  },

  /**
   * Get saved settings and add save them to the settings object.
   */
  getSettings() {
    this.settings = { ...storage.getSavedSettings() };
  },

  /**
   * Fetch config file and set variables.
   *
   * @param {string} app - App name.
   *
   * @return {Promise}
   */
  async loadConfig(app) {
    const response = await fetch(chrome.extension.getURL(config.configFile),);
    const json = await response.json();

    this.popupExternalUrl = json.apps[app];
    this.popupDimensions = json.popupDimensions;
    this.development = json.development;
  },

  /**
   * Bind the popup script connection and map external actions.
   */
  bindPopupScript() {
    chrome.runtime.onConnectExternal.addListener((port) => {
      popupConnection = port;
      port.onMessage.addListener((...args) => {
        this.popupListener(...args);
      });
    });
  },

  /**
   * Bind the injected content script connection and map actions.
   */
  bindContentScript() {
    chrome.runtime.onConnect.addListener((port) => {
      // console.log(port);
      contentConnection = port;
      port.onMessage.addListener((...args) => {
        this.contentScriptListener(...args);
      });
    });
  },

  /**
   * Listener for popup script actions.
   *
   * @param {Object} request - Request object.
   *
   * @return {undefined}
   */
  popupListener(request) {
    log.request('popup', request, true);

    switch (request.action) {

      case actionNames.popupConnected:
        this.onPopupConnect();
        break;
        // sendToContent({action: Actions.checkContentConnection});

        // case actionNames.contentConnected:
        //   sendToPopup(request);
        //   break;

      case actionNames.mapField:
        this.moveFocus();
        sendToContent(request);
        break;

      case actionNames.deleteField:
        actions.deleteField(request);
        break;

      case actionNames.getPreset:
        actions.getPreset(request.preset);
        break;

      case actionNames.saveSettings:
        actions.saveSettings(request);
        break;

      case actionNames.getSettings:
        actions.getSettings(request);
        break;

        // case actionNames.getContent:
        //   return sendToContent(request);

        // case actionNames.getStorage:
        //   return actions.getStorage(request);

        // case actionNames.getFieldSettingsForURL:
        //   return actions.getFieldSettingsForURL(request);

      case actionNames.getContent:
        actions.getContent({...request, url: new URL(activeTab.url) || window.location});
        break;
    }
  },

  /**
   * Listener for content script actions.
   *
   * @param {Object} request - Request object.
   */
  contentScriptListener(request) {
    log.request('content', request, true);

    switch (request.action) {
      case actionNames.contentConnected:
        this.onContentConnect(request);
        break;

      case actionNames.mappedField:
        actions.saveMappedField(request);
        this.moveFocus(popup);
        break;

        // case actionNames.foundElementContent:
        //   sendToPopup(request);
        //   break;

      case actionNames.deleteField:
        actions.deleteField(request);
        break;

      case actionNames.trackShipment:
        actions.trackShipment(request.barcode);
        break;

      case actionNames.foundContent:
        sendToPopup(request);
        break;

      // case actionNames.createShipment:
      //   actions.createShipment(request);
      //   break;
    }
  },

  /**
   * Set popupConnected, flush the popup queue and tell the popup the background is ready.
   */
  onPopupConnect() {
    this.popupConnected = true;
    log.info('sending popup queue');
    this.popupQueue = flushQueue(this.popupQueue, sendToPopup);

    // if (activeTab && activeTab.url) {
    //   actions.getContent({url: activeTab.url});
    // }
  },

  /**
   * Set contentConnected, flush the content queue and tell the popup the content script is ready.
   *
   * @param {Object} request - Request object.
   */
  onContentConnect(request) {
    console.log(request);
    this.contentConnected = activeTab.id;
    log.info('sending content queue');
    this.contentQueue = flushQueue(this.contentQueue, sendToContent);

    sendToPopup({...request, action: actionNames.backgroundConnected});
  },

  /**
   * Binds all browser events to functions.
   */
  bindEvents() {
    // Extension button click
    chrome.browserAction.onClicked.addListener((...args) => {
      this.openPopup(...args);
    });

    // On opening context menu (right click)
    if (this.settings.context_menu_enabled === true) {
      chrome.contextMenus.onClicked.addListener((data) => {
        contextMenu.activate(data);
      });
    }

    // Tab listeners
    chrome.tabs.onHighlighted.addListener(() => {
      // log.event('onHighlighted – not doing anything');
      log.event('onHighlighted – switchTab()');
      this.switchTab();
    });

    chrome.tabs.onReplaced.addListener(() => {
      log.event('onReplaced – switchTab()');
      this.switchTab();
    });

    chrome.tabs.onUpdated.addListener((...args) => {
      this.updateTab(...args);
    });

    // Window listeners
    chrome.windows.onFocusChanged.addListener(() => {
      log.event('onFocusChanged – switchTab()');
      this.switchTab();
    });

    chrome.windows.onRemoved.addListener((...args) => {
      this.checkPopupClosed(...args);
    });
  },

  /**
   * Checks if script and css are present on current tab and injects them if not.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   */
  injectScripts(tab) {
    if (!tab) {
      return;
    }

    if (!activeTab) {
      activeTab = tab;
    }

    const insertScripts = () => {
      log.event(`Injecting css and js on ${new URL(tab.url).hostname}.`);
      chrome.tabs.insertCSS(tab.id, {file: config.injectCSS});
      chrome.tabs.executeScript(tab.id, {file: config.injectJS});
    };

    try {
      if (tab.id === this.contentConnected) {
        log.event('Script already present');
        sendToContent({action: actionNames.checkContentConnection});
      } else {
        throw 'content not connected';
      }
    } catch (e) {
      insertScripts();
    }
  },

  /**
   * Set active tab and send messages to popup and content to process the change.
   */
  async switchTab() {
    log.separator();
    const tab = await this.getActiveTab();

    if (!tab || !popup || tab.id === popup.id || (activeTab && tab.id === activeTab.id)) {
      return;
    }

    this.activateTab(tab);

    if (popupConnection) {
      sendToPopup({action: actionNames.switchedTab, url: tab.url});
    }

    if (contentConnection) {
      sendToContent({action: actionNames.switchedTab});
    }
  },

  /**
   * Gets the active tab based on a query.
   *
   * @return {Promise<chrome.tabs.Tab>}
   */
  getActiveTab() {
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
  },

  /**
   * On updating tab set new tab as active tab and change app icon.
   *
   * @param {number} id   - Chrome tab ID.
   * @param {chrome.tabs.TabChangeInfo} data - Chrome event data.
   * @param {chrome.tabs.Tab} tab  - Chrome tab object.
   */
  async updateTab(id, data, tab) {
    log.event('updateTab');
    if (data.status === 'complete' && activeTab && activeTab.id === tab.id) {
      await this.activateTab(tab);
      this.setIcon();

      sendToContent({action: actionNames.checkContentConnection});
    }
  },

  /**
   * When a window is closed check if it's our popup and clean up if so.
   *
   * @param {number} windowId - Chrome window ID.
   */
  checkPopupClosed(windowId) {
    if (popup && windowId === popup.windowId) {
      this.closePopup(windowId);
    }
  },

  /**
   * Set given tab to active and inject scripts on tab.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   */
  activateTab(tab) {
    this.checkIfWebsite(tab);
    activeTab = tab;

    if (this.isWebsite) {
      this.injectScripts(tab);
    }
  },

  /**
   * On moving focus update current window and tab.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   */
  moveFocus(tab = activeTab) {
    console.log(tab);
    chrome.windows.update(tab.windowId, {focused: true});
    chrome.tabs.update(tab.id, {active: true});
  },

  /**
   * Check if given tab is a website and not a Chrome page.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   */
  checkIfWebsite(tab) {
    const {url, windowId} = tab;
    const notPopup = popup ? windowId !== popup.id : true;

    this.isWebsite = url && url.startsWith('http') && notPopup;
  },

  /**
   * Create popup and load given URL in it.
   *
   * @return {Promise<Object>}
   */
  createPopup() {
    return new Promise((resolve) => {
      const {height, width} = this.popupDimensions;
      chrome.windows.getCurrent((win) => {
        chrome.windows.create({
          url: this.popupExternalUrl,
          type: 'popup',
          left: win.left + win.width,
          top: win.top,
          height,
          width,
        }, (win) => {
          resolve(win.tabs[0]);
        });
      });
    });
  },

  /**
   * Show popup if it exists or create it.
   *
   * @param {chrome.tabs.Tab} tab - Chrome tab object.
   */
  async openPopup(tab) {
    if (popup) {
      await this.showPopup();
    } else {
      // todo remove this
      chrome.windows.getAll({windowTypes: ['popup']}, (windows) => {
        windows.forEach((window) => {
          chrome.windows.remove(window.id);
        });
      });

      popup = await this.createPopup();
    }

    this.injectScripts(tab);
    this.setIcon(config.activeIcon);
    // actions.getContent(url);
  },

  /**
   * Create a shipment.
   */
  createShipment() {
    log.info('creating shipment');
    const settings = storage.getSavedMappingsForURL(activeTab.url);
    console.log(settings);
  },

  /**
   * Switch focus to our popup.
   */
  showPopup() {
    chrome.windows.getCurrent(() => {
      chrome.windows.update(popup.windowId, {
        focused: true,
        drawAttention: true,
      });
    });
  },

  /**
   * Clean up on closing of popup. Resets variables and extension icon.
   */
  async closePopup() {
    await sendToContent({action: actionNames.stopListening});
    popup = null;
    popupConnection = null;
    activeTab = null;
    this.popupConnected = false;
    this.setIcon();
  },

  /**
   * Changes the extension icon to given path.
   *
   * @param {string} path - Path to icon file.
   */
  setIcon(path = config.defaultIcon) {
    chrome.browserAction.setIcon({path});
  },
};

background.boot();

export default background;
