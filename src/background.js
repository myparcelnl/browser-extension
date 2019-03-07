/* eslint-disable no-magic-numbers,no-console */
import actionNames from './helpers/actions';
import actions from './background/actions';
import config from './helpers/config';
import log from './helpers/log';
import storage from './background/storage';

export let popup = null;
export let popupConnection = null;
export let contentConnection = null;

/**
 * Send data to popup
 * @param data
 */
export const sendToPopup = (data) => {
  popupConnection.postMessage(data);
};

/**
 * Send data to injected content script
 * @param data
 */
export const sendToContent = (data) => {
  contentConnection.postMessage(data);
};

const background = {

  /**
   * Loads config file then binds all events and scripts
   */
  boot() {
    this.loadConfig(chrome.extension.getURL(config.configFile))
      .then(() => {
        this.bindEvents();
        this.createContextMenu();

        this.bindPopupScript();
        this.bindContentScript();
      });
  },

  /**
   * Fetch config file and set variables
   * @param url
   * @returns {Promise<any | never>}
   */
  loadConfig(url) {
    return fetch(url)
      .then((response) => response.json())
      .then((json) => {
        this.popupExternalUrl = json.app;
        this.popupDimensions = json.popupDimensions;
        this.development = json.development;
      });
  },

  /**
   * Bind the popup script connection and map external actions
   */
  bindPopupScript() {
    chrome.runtime.onConnectExternal.addListener((port) => {
      popupConnection = port;
      port.onMessage.addListener((...args) => this.popupListener(...args));
    });
  },

  /**
   * Bind the injected content script connection and map actions
   */
  bindContentScript() {
    chrome.runtime.onConnect.addListener((port) => {
      contentConnection = port;
      port.onMessage.addListener((...args) => this.contentScriptListener(...args));
    });
  },

  /**
   * Listener for popup script actions
   * @param request
   */
  popupListener(request) {
    console.log(request);

    switch (request.action) {
      case actionNames.popupConnected:
        sendToPopup({action: actionNames.backgroundConnected});
        // sendToContent({action: Actions.checkContentConnection});
        break;

      case actionNames.contentConnected:
        sendToPopup(request);
        break;

      case actionNames.mapField:
        this.moveFocus();
        sendToContent(request);
        break;

      case actionNames.getStorage:
        actions.getStorage(request);
        break;
    }
  },

  /**
   * Listener for content script actions
   * @param request
   * @param connection
   */
  contentScriptListener(request, connection) {
    console.log(request);

    switch (request.action) {
      case actionNames.contentConnected:
        sendToPopup(request);
        break;

      case actionNames.mappedField:
        actions.saveMappedField(request);
        sendToPopup(request);
        this.moveFocus(popup);
        break;

      case actionNames.trackShipment:
        actions.trackShipment(request.barcode);
        break;
    }
  },

  /**
   * Binds all browser events
   */
  bindEvents() {
    // Extension button click
    chrome.browserAction.onClicked.addListener(() => this.openPopup());

    // On opening context menu (right click)
    chrome.contextMenus.onClicked.addListener((info) => this.checkContextMenu(info));

    // Tab listeners
    chrome.tabs.onHighlighted.addListener(() => this.switchTab());
    chrome.tabs.onReplaced.addListener(() => this.switchTab());
    chrome.tabs.onUpdated.addListener((...args) => this.updateTab(...args));

    // Window listeners
    chrome.windows.onFocusChanged.addListener(() => this.switchTab());
    chrome.windows.onRemoved.addListener((...args) => this.checkPopupClosed(...args));
  },

  /**
   * Checks if script and css are present on current tab and injects them if not
   */
  injectScripts(tab) {
    if (!popup || !this.isWebsite || !this.activeTab) {
      return;
    }

    const insertScripts = () => {
      log.warning(`Script not found. Injecting css and js on ${new URL(tab.url).hostname}.`);
      chrome.tabs.insertCSS(tab.id, {file: config.injectCSS});
      chrome.tabs.executeScript(tab.id, {file: config.injectJS});
    };

    if (contentConnection && contentConnection.sender.id !== tab.id) {
      insertScripts();
    } else {
      try {
        sendToContent({action: actionNames.checkContentConnection});
      } catch (e) {
        insertScripts();
      }
    }
  },

  /**
   * On switching tabs
   */
  async switchTab() {
    const tab = await this.getActiveTab();

    if (!tab || !popup || tab.id === popup.id || (this.activeTab && tab.id === this.activeTab.id)) {
      return;
    }

    this.activateTab(tab);
    if (popupConnection) {
      sendToPopup({action: actionNames.switchedTab});
    }
  },

  getActiveTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => resolve(tabs[0]));
    });
  },

  /**
   * On updating tab set new tab as active tab and change app icon
   * @param id
   * @param info
   * @param tab
   */
  updateTab(id, info, tab) {
    if (info.status === 'complete' && this.activeTab && this.activeTab.id === tab.id) {
      this.activateTab(tab);
      this.setIcon();
    }
  },

  /**
   * When a window is closed check if it's our popup and clean up if so
   * @param windowId
   */
  checkPopupClosed(windowId) {
    if (popup && windowId === popup.windowId) {
      this.closePopup(windowId);
    }
  },

  /**
   * Set given tab to active and inject scripts on tab
   * @param tab
   */
  activateTab(tab) {
    this.checkIfWebsite(tab);
    this.activeTab = tab;

    if (this.isWebsite) {
      this.injectScripts(tab);
    }
  },

  /**
   * On moving focus update current window and tab
   * @param tab
   */
  moveFocus(tab = this.activeTab) {
    chrome.windows.update(tab.windowId, {focused: true});
    chrome.tabs.update(tab.id, {active: true});
  },

  /**
   * Check if given tab is a website and not a Chrome page
   * @param tab
   */
  checkIfWebsite(tab) {
    const {url, windowId} = tab;
    const notPopup = popup ? windowId !== popup.id : true;

    this.isWebsite = url && url.startsWith('http') && notPopup;
  },

  createPopup(url) {
    const {height, width} = this.popupDimensions;
    chrome.windows.getCurrent((win) => {
      chrome.windows.create({
        url: url,
        type: 'popup',
        left: win.left + win.width,
        top: win.top,
        height,
        width,
      }, (win) => {
        popup = win.tabs[0];
      });
    });
  },

  /**
   * Show popup if it exists or create it
   * @param url
   */
  async openPopup(url = this.popupExternalUrl) {
    if (popup) {
      this.showPopup();
    } else {
      if (!this.activeTab) {
        this.activeTab = await this.getActiveTab();
      }

      // todo remove this
      chrome.windows.getAll({windowTypes: ['popup']}, (windows) => {
        windows.forEach((window) => {
          chrome.windows.remove(window.id);
        });
      });

      this.createPopup(url);
      // await new Promise((resolve) => {
      //   popupConnection.onMessage.addListener((request) => {
      //     if (request.action === Actions.popupConnected) {
      //       console.log('resolving');
      //       resolve();
      //     }
      //   });
      // });
      // console.log('activating tab');
      // this.activateTab(this.activeTab);
    }

    this.createShipment();
    this.setIcon(config.activeIcon);
  },

  async createShipment() {
    log.info('creating shipment');
    const settings = await storage.getSavedMappingsForURL(this.activeTab.url);
    console.log(settings);
  },

  /**
   * Switch focus to our popup
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
  closePopup() {
    popup = null;
    sendToContent({action: 'stopListening'});
    popupConnection = null;
    this.setIcon();
  },

  /**
   * Create context menu
   * @param title
   */
  createContextMenu() {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
      id: config.contextMenuItemId,
      title: config.contextMenuTitle,
      contexts: ['selection'],
    });
  },

  /**
   * Check if user clicked our context menu item. If so, send action and selected text to popup
   * @param item
   */
  checkContextMenu(item) {
    if (item.menuItemId !== config.contextMenuItemId) {
      return;
    }

    const selection = item.selectionText.trim().replace(/,/, ' ');
    this.openPopup();
    sendToPopup({action: actionNames.createShipmentFromSelection, selection});
  },

  /**
   * Changes the extension icon to given path
   * @param icon
   */
  setIcon(icon = config.defaultIcon) {
    chrome.browserAction.setIcon({path: icon});
  },
};

background.boot();

export default background;
