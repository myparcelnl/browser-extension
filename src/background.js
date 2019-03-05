/* eslint-disable no-magic-numbers,no-console */
import Actions from './actions';
import MyParcelAPI from './helpers/MyParcelAPI';
import Storage from './background/storage';
import log from './helpers/log';

const activeIcon = 'icon-128px-alt.png';

const dirRoot = './dist';

const cssDir = `${dirRoot}/css`;
const imgDir = `${dirRoot}/images`;
const jsDir = `${dirRoot}/js`;
const defaultIcon = 'icon-128px.png';

new class MyParcelBackgroundView {

  /**
   * Loads config file then binds all scripts and events
   */
  constructor() {
    this.loadConfig(chrome.extension.getURL('config/config.json'))
      .then(() => {
        log.success(`Config loaded at ${(new Date()).toLocaleTimeString()}`);
        this.popupUrl = this.popupExternalUrl;

        this.bindPopupScript();
        this.createContextMenu(this.contextMenuTitle);
        this.bindEvents();
        this.bindContentScript();
        this.injectScripts();
      });
  }

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
        this.contextMenuTitle = json.contextMenuTitle;
        this.popupDimensions = json.popupDimensions;
        this.development = json.development;
      });
  }

  /**
   * Bind the popup script connection and map external actions
   */
  bindPopupScript() {
    chrome.runtime.onConnectExternal.addListener((port) => {
      if (port.sender.tab.id !== this.popup.id) {
        log.error('External connection disallowed.');
        return;
      }

      log.success('popup connected');
      this.popupConnection = port;

      port.onMessage.addListener((request) => {
        console.log(request);

        switch (request.action) {
          case Actions.popupConnected:
            this.sendToExternal({action: Actions.backgroundConnected});
            // this.sendToContent({action: Actions.checkContentConnection});
            break;

          case Actions.contentConnected:
            this.sendToExternal(request);
            break;

          case Actions.mapField:
            this.moveFocus();
            this.sendToContent(request);
            break;
        }
      });
    });
  }

  /**
   * Bind the injected content script connection and map actions
   */
  bindContentScript() {
    chrome.runtime.onConnect.addListener((port) => {
      this.connection = port;
      port.postMessage({action: Actions.checkContentConnection});

      port.onMessage.addListener((request, connection) => {
        console.log(request);
        const {url} = connection.sender.tab;

        switch (request.action) {
          case Actions.contentConnected:
            this.sendToExternal(request);
            break;

          case Actions.mappedField:
            this.moveFocus(this.popup);
            Storage.saveMappedField(Object.assign(request, {url}));
            this.sendToExternal(request);
            break;

          case Actions.trackShipment:
            this.trackShipment(request.barcode);
            break;
        }
      });
    });
  }

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
  }

  /**
   * Checks if script and css are present on current tab and injects them if not
   */
  injectScripts() {
    if (!this.popup || !this.isWebpage || !this.activeTab) {
      return;
    }

    if (this.connection && this.connection.sender.tab.id === this.activeTab.id) {
      this.sendToContent({action: Actions.checkContentConnection});
    } else {
      log.warning(`Script not found. Injecting css and js on ${new URL(this.domain).hostname}`);
      chrome.tabs.insertCSS(this.activeTab.id, {file: `${cssDir}/inject.css`});
      chrome.tabs.executeScript(this.activeTab.id, {file: `${jsDir}/inject.js`});
    }
  }

  /**
   * On switching tabs
   */
  switchTab() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (!tabs[0] || (this.activeTab && tabs[0].id === this.activeTab.id)) {
        return;
      }

      if (!this.popup || tabs[0].id !== this.popup.id) {
        this.activateTab(tabs[0]);
        if (this.popupConnection) {
          this.sendToExternal({action: Actions.switchedTab});
        }
      }
    });
  }

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
  }

  /**
   * On moving focus update current window and tab
   * @param tab
   */
  moveFocus(tab = this.activeTab) {
    chrome.windows.update(tab.windowId, {focused: true});
    chrome.tabs.update(tab.id, {active: true});
  }

  /**
   * When a window is closed check if it's our popup and clean up if so
   * @param windowId
   */
  checkPopupClosed(windowId) {
    if (this.popup && windowId === this.popup.windowId) {
      this.closePopup(windowId);
    }
  }

  /**
   * Set given tab to active and inject scripts on tab
   * @param tab
   */
  activateTab(tab) {
    this.checkIfWebsite(tab);
    this.activeTab = tab;

    if (this.isWebpage) {
      this.domain = tab.url;
      this.injectScripts();
    }
  }

  /**
   * Check if given tab is a website and not a Chrome page
   * @param tab
   */
  checkIfWebsite(tab) {
    this.isWebpage = tab.url && tab.url.startsWith('http') && tab.windowId !== this.popup;
  }

  createPopup(url) {
    const {height, width} = this.popupDimensions;
    chrome.windows.getCurrent((win) => {
      chrome.windows.create({
        url: url,
        type: 'popup',
        left: win.left + win.width, // - this.popupDimensions.width - 20,
        top: win.top,
        height,
        width,
      }, (win) => {
        this.popup = win.tabs[0];
      });
    });
  }

  /**
   * Show popup if it exists or create it
   * @param url
   */
  openPopup(url = this.popupUrl) {
    if (this.popup) {
      this.showPopup();
    } else {
      chrome.windows.getAll({windowTypes: ['popup']}, (windows) => {
        windows.forEach((window) => {
          chrome.windows.remove(window.id);
        });
      });
      this.createPopup(url);
    }

    this.setIcon(activeIcon);
  }

  /**
   * Switch focus to our popup
   */
  showPopup() {
    chrome.windows.getCurrent(() => {
      chrome.windows.update(this.popup.windowId, {
        focused: true,
        drawAttention: true,
      });
    });
  }

  /**
   * Clean up on closing of popup. Resets variables and extension icon.
   */
  closePopup() {
    this.popup = null;
    this.popupConnection = null;
    this.setIcon();
  }

  /**
   * Create context menu
   * @param title
   */
  createContextMenu(title) {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
      id: 'myparcel-create-shipment',
      title,
      contexts: ['selection'],
    });
  }

  /**
   * Check if user clicked our context menu item. If so, send action and selected text to popup
   * @param item
   */
  checkContextMenu(item) {
    if (item.menuItemId !== 'myparcel-create-shipment') {
      return;
    }

    const selection = item.selectionText.trim().replace(/,/, ' ');
    this.openPopup();
    this.sendToExternal({action: Actions.createShipmentFromSelection, selection});
  }

  /**
   * Changes the extension icon to given path
   * @param icon
   */
  setIcon(icon = defaultIcon) {
    chrome.browserAction.setIcon({path: `${imgDir}/${icon}`});
  }

  /**
   * Send data to popup
   * @param data
   */
  sendToExternal(data) {
    this.popupConnection.postMessage(data);
  }

  /**
   * Send data to injected content script
   * @param data
   */
  sendToContent(data) {
    this.connection.postMessage(data);
  }
};
