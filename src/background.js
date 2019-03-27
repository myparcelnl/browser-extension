/* eslint-disable no-magic-numbers,no-console */
import actionNames from './helpers/actionNames';
import actions from './background/actions';
import config from './helpers/config';
import contextMenu from './background/context-menu';
import log from './helpers/log';
import storage from './background/storage';

export let popup = null;
export let popupConnection = null;
export let contentConnection = null;
export let activeTab = null;

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

const background = {

  /**
   * Loads config file then binds all events and scripts.
   */
  async boot() {
    await this.loadConfig(chrome.extension.getURL(config.configFile));

    this.popupQueue = [];
    this.contentQueue = [];

    this.popupConnected = false;
    this.contentConnected = false;

    this.bindEvents();
    contextMenu.create();

    this.bindPopupScript();
    this.bindContentScript();
  },

  /**
   * Fetch config file and set variables.
   *
   * @param {string} configFile - Path to config.json.
   *
   * @returns {Promise}
   */
  async loadConfig(configFile) {
    const response = await fetch(configFile);
    const json = await response.json();

    this.popupExternalUrl = json.app;
    this.popupDimensions = json.popupDimensions;
    this.development = json.development;
  },

  /**
   * Bind the popup script connection and map external actions.
   */
  bindPopupScript() {
    chrome.runtime.onConnectExternal.addListener((port) => {
      popupConnection = port;
      port.onMessage.addListener((...args) => this.popupListener(...args));
    });
  },

  /**
   * Bind the injected content script connection and map actions.
   */
  bindContentScript() {
    chrome.runtime.onConnect.addListener((port) => {
      // console.log(port);
      contentConnection = port;
      port.onMessage.addListener((...args) => this.contentScriptListener(...args));
    });
  },

  /**
   * Listener for popup script actions.
   *
   * @param {Object} request - Request object.
   */
  popupListener(request) {
    log.popup(request.action, true);
    // console.log(request);

    switch (request.action) {
      case actionNames.popupConnected:
        this.popupConnected = true;
        log.info('sending popup queue');
        this.popupQueue.forEach((message) => {
          sendToPopup(message);
        });
        this.popupQueue = [];

        sendToPopup({action: actionNames.backgroundConnected});
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

        // case actionNames.getContent:
        //   return sendToContent(request);

        // case actionNames.getStorage:
        //   return actions.getStorage(request);

        // case actionNames.getFieldSettingsForURL:
        //   return actions.getFieldSettingsForURL(request);

      case actionNames.getContent:
        actions.getContent({...request, url: new URL(activeTab.url).hostname});
        break;
    }
  },

  /**
   * Listener for content script actions.
   *
   * @param {Object} request
   */
  contentScriptListener(request) {
    log.content(request.action, true);
    // console.log(request);

    switch (request.action) {
      case actionNames.contentConnected:
        log.info('sending content queue');
        this.contentConnected = activeTab.id;
        this.contentQueue.forEach((message) => {
          sendToPopup(message);
        });
        this.contentQueue = [];
        return sendToPopup(request);
        // return actions.getContent({...request, location: activeTab.url});

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
        return sendToPopup(request);

      // case actionNames.createShipment:
      //   actions.createShipment(request);
      //   break;
    }
  },

  /**
   * Binds all browser events.
   */
  bindEvents() {
    // Extension button click
    chrome.browserAction.onClicked.addListener((...args) => this.openPopup(...args));

    // On opening context menu (right click)
    chrome.contextMenus.onClicked.addListener((data) => contextMenu.activate(data));

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
    chrome.tabs.onUpdated.addListener((...args) => this.updateTab(...args));

    // Window listeners
    chrome.windows.onFocusChanged.addListener(() => {
      log.event('onFocusChanged – switchTab()');
      this.switchTab();
    });
    chrome.windows.onRemoved.addListener((...args) => this.checkPopupClosed(...args));
  },

  /**
   * Checks if script and css are present on current tab and injects them if not.
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
   * On switching tabs.
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
   * @param {int}    id
   * @param {Object} data
   * @param {Object} tab
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
   * @param {int} windowId
   */
  checkPopupClosed(windowId) {
    if (popup && windowId === popup.windowId) {
      this.closePopup(windowId);
    }
  },

  /**
   * Set given tab to active and inject scripts on tab.
   *
   * @param {Object} tab
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
   * @param {Object} tab
   */
  moveFocus(tab = activeTab) {
    chrome.windows.update(tab.windowId, {focused: true});
    chrome.tabs.update(tab.id, {active: true});
  },

  /**
   * Check if given tab is a website and not a Chrome page.
   *
   * @param {Object} tab
   * */
  checkIfWebsite(tab) {
    const {url, windowId} = tab;
    const notPopup = popup ? windowId !== popup.id : true;

    this.isWebsite = url && url.startsWith('http') && notPopup;
  },

  /**
   * Create popup and load given URL in it.
   *
   * @param {string} url
   * @returns {Promise<Object>}
   */
  createPopup(url) {
    return new Promise((resolve) => {
      const {height, width} = this.popupDimensions;
      chrome.windows.getCurrent((win) => {
        chrome.windows.create({
          type: 'popup',
          left: win.left + win.width,
          top: win.top,
          url,
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
   * @param {Object} tab
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

      popup = await this.createPopup(this.popupExternalUrl);
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
    await sendToContent({action: 'stopListening'});
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
