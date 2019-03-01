/* eslint-disable no-magic-numbers,no-console */
// import { CONNECTION_NAME } from './helpers/config';
import log from './helpers/log';
import MyParcelAPI from './helpers/MyParcelAPI';

const dirRoot = './dist';
const cssDir = `${dirRoot}/css`;
const imgDir = `${dirRoot}/images`;
const jsDir = `${dirRoot}/js`;

log.warning('background.js');

new class MyParcelBackgroundView {

  constructor() {
    this.extensionUrl = window.chrome.extension.getURL('');
    this.extensionID = (/[a-z]{32}/).exec(this.extensionUrl)[0];


    this.trackShipment('3SMYPA123778160', '9206AC', 'NL');

    this.loadConfig(window.chrome.extension.getURL('config/config.json'))
      .then(() => {
        log.warning(`config loaded at ${(new Date()).toLocaleTimeString()}`);
        this.popupUrl = `${this.popupExternalUrl}?id=${window.chrome.runtime.id}`;

        // Open popup on clicking button in toolbar
        chrome.browserAction.onClicked.addListener(() => this.openPopup());
        this.bindPopupScript();

        this.bindEvents();
        this.bindContentScript();
        this.injectScripts();
      });
  }

  injectScripts() {
    if (!this.popup || !this.isWebpage || !this.activeTab) {
      log.error('not injecting scripts');
      return;
    }
    const tab = this.activeTab.id;

    chrome.tabs.sendMessage(tab, {action: 'checkContentConnected'}, (response) => {
      if (chrome.runtime.lastError && response !== 'contentConnected') {
        log.info(`Script not found. Injecting css and js on ${new URL(this.domain).hostname}`);
        chrome.tabs.insertCSS(tab, {file: `${cssDir}/inject.css`});
        chrome.tabs.executeScript(tab, {file: `${jsDir}/inject.js`});

        this.sendToExternal({action: 'contentConnected'});
      }
    });
  }

  switchTab() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      /** Disable for development pages  */
      if (!tabs[0] || (this.activeTab && tabs[0].id === this.activeTab.id)) {
        return;
      }
      if (!this.popup || tabs[0].id !== this.popup.id) {
        this.sendToExternal({action: 'switchedTab'});
        this.activateTab(tabs[0]);
      }
    });
  }

  bindEvents() {
    window.chrome.windows.onRemoved.addListener((windowId) => {
      // check if our popup is closed
      if (this.popup && windowId === this.popup.windowId) {
        this.closePopup(windowId);
      }
    });

    window.chrome.contextMenus.onClicked.addListener((info) => this.activateContextMenu(info));
    this.createContextMenu(this.contextMenuTitle);

    chrome.tabs.onHighlighted.addListener(() => this.switchTab());
    chrome.tabs.onReplaced.addListener(() => this.switchTab());
    chrome.windows.onFocusChanged.addListener(() => this.switchTab());

    /** Monitor page navigation */
    chrome.tabs.onUpdated.addListener((id, info, tab) => {
      if (info.status === 'complete' && this.activeTab && this.activeTab.id === tab.id) {
        this.activateTab(tab);
        this.resetIcon();
      }
    });
  }

  bindContentScript() {
    chrome.runtime.onConnect.addListener((port) => {
      this.connection = port;
      log.success(`Connected to "${port.name}" content script`);
      port.postMessage({action: 'checkContentConnection'});

      port.onMessage.addListener((request) => {
        console.log(request);
        if (request.action === 'contentConnected') {
          log.success('Content connected');
          this.sendToExternal(request);
        }
        if (request.action === 'mappedField') {
          this.moveFocus(this.popup);
          this.sendToExternal(request);
        }
      });
    });
  }

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

        if (request.action === 'popupConnected') {
          this.sendToExternal({action: 'backgroundConnected'});
          this.sendToContent({action: 'checkContentConnected'});
        } else if (request.action === 'contentConnected') {
          this.sendToExternal(request);
        } else if (request.action === 'mapField') {
          this.moveFocus();
          this.sendToContent(request);
          return true;
        }
      });
    });
  }

  moveFocus(tab = this.activeTab) {
    chrome.windows.update(tab.windowId, {focused: true});
    chrome.tabs.update(tab.id, {active: true});
  }

  activateTab(tab) {
    this.checkIfWebsite(tab);

    if (this.activeTab && tab.id !== this.activeTab.id && this.editMode) {
      this.sendToContent('stopSelecting');
      this.editMode = false;
    }

    this.activeTab = tab;

    if (this.isWebpage) {
      this.domain = tab.url;
      this.injectScripts();
    }
  }

  checkIfWebsite(tab) {
    this.isWebpage = tab.url && tab.url.startsWith('http') && tab.windowId !== this.popup;
  }

  openPopup(url = null) {
    if (this.popup) {
      this.showPopup();
    } else {
      if (!url) {
        url = this.popupUrl;
        // url = `${this.popupUrl}&url=${window.encodeURI(this.extensionID)}`;
      }

      if (this.development) {
        chrome.windows.getAll({windowTypes: ['popup']}, (windows) => {
          windows.forEach((window) => {
            chrome.windows.remove(window.id);
          });
        });
      }

      chrome.windows.getCurrent((win) => {
        chrome.windows.create({
          url: url,
          type: 'popup',
          height: this.popupDimensions.height,
          width: this.popupDimensions.width,
          left: win.left + win.width, // - this.popupDimensions.width - 20,
          top: win.top,
        }, (win) => {
          this.popup = win.tabs[0];
        });
      });
    }

    this.updateIcon();
  }

  closePopup() {
    log.error('popup closed');
    this.popup = null;
    this.popupConnection = null;
    this.resetIcon();
  }

  showPopup() {
    window.chrome.windows.getCurrent((win) => {
      window.chrome.windows.update(this.popup.windowId, {
        focused: true,
        drawAttention: true,
        left: win.left + win.width - this.popupDimensions.width,
        top: win.top + 75,
        height: this.popupDimensions.height,
        width: this.popupDimensions.width,
      });
    });
  }

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

  activateContextMenu(info) {
    if (info.menuItemId === 'create-shipment') {
      this.selectContentText(info.selectionText);
    }
  }

  selectContentText(selection) {
    log.info(`selection: ${selection}`);
    this.openPopup();
    this.sendToExternal({selection: selection});
  }

  createContextMenu(title) {
    window.chrome.contextMenus.removeAll();
    window.chrome.contextMenus.create({
      id: 'create-shipment',
      title,
      contexts: ['selection'],
    });
  }

  sendToExternal(data) {
    if (this.popup && this.popupConnection) {
      this.popupConnection.postMessage(data);
    }
  }

  sendToContent(data) {
    if (this.activeTab) {
      this.connection.postMessage(data);
    }
  }

  trackShipment(barcode, postalCode, countryCode) {
    console.log('tracking shipment');
    return MyParcelAPI.get('tracktraces', null, {barcode, postalCode, countryCode}, )
      .then((response) => {
        console.log(response);
      });
  }

  resetIcon() {
    chrome.browserAction.setIcon({path: `${imgDir}/icon-128px.png`});
  }

  updateIcon() {
    chrome.browserAction.setIcon({path: `${imgDir}/icon-128px-alt.png`});
  }
};
