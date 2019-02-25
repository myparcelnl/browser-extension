/* eslint-disable no-magic-numbers */
import log from './log';
log.warning('background.js');

window.MyParcelExtensionBackground = new class MyParcelBackgroundView {
  constructor() {
    const {runtime, extension} = window.chrome;
    this.extensionUrl = extension.getURL('');

    this.loadConfig(extension.getURL('config/config.json')).then(() => {
      chrome.tabs.executeScript({file: 'dist/js/inject.js'});
      this.popupUrl = `${this.popupExternalUrl}?id=${runtime.id}`;
      log.info(`config loaded at ${(new Date()).toLocaleTimeString()}`);
      this.boot();
    });

    // Open popup on clicking button in toolbar
    chrome.browserAction.onClicked.addListener(() => this.openPopup());
  }

  boot() {
    this.bindEvents();
  }

  bindEvents() {
    chrome.runtime.onMessage.addListener(() => log.info('chrome.runtime.onMessage'));
    chrome.webNavigation.onCompleted.addListener(() => log.info('chrome.webNavigation.onCompleted'));
    chrome.webNavigation.onBeforeNavigate.addListener(() => log.info('chrome.webNavigation.onBeforeNavigate'));
  }

  // mapInputs() {
  //   chrome.runtime.onMessage.addListener(() => console.log('chrome.runtime.onMessage'));
  //   chrome.webNavigation.onCompleted.addListener(() => console.log('chrome.webNavigation.onCompleted'));
  //   chrome.webNavigation.onBeforeNavigate.addListener(() => console.log('chrome.webNavigation.onBeforeNavigate'));
  //
  //   chrome.browserAction.setIcon({path: './images/icon-green.png'});
  //   chrome.browserAction.setBadgeText({text: this.badgeState});
  //   chrome.browserAction.setBadgeBackgroundColor({color: '#f00'});
  // }

  openPopup(url = null) {
    log.info('openPopup');
    if (this.popup) {
      this.showPopup();
    } else {
      if (!url) {
        url = `${this.popupUrl}&url=${window.encodeURI(this.domain)}`;
      }
      this.getWindows().getCurrent((win) => {
        this.getWindows().create({
          url: url,
          type: 'popup',
          height: this.popupDimensions.height,
          width: this.popupDimensions.width,
          left: win.left + win.width - this.popupDimensions.width,
          top: win.top + 75,
        }, (win) => {
          /** For firefox we need to use the return promise */
          this.popup = win.tabs[0];

          /** Make sure content script is loaded */
          // this.loadTabScript();
        });
      });
    }
  }

  showPopup() {
    this.getWindows().getCurrent((win) => {
      this.getWindows().update(this.popup.windowId, {
        focused: true,
        drawAttention: true,
        left: win.left + win.width - this.popupDimensions.width,
        top: win.top + 75,
        height: this.popupDimensions.height,
        width: this.popupDimensions.width,
      });
    });
  }

  getWindows() {
    return window.chrome.windows;
  }

  /**
   * Load the config file from the url.
   *
   * @param url
   */
  loadConfig(url) {
    return fetch(url)
      .then((response) => response.json())
      .then((json) => this.setServerConfig(json));
  }

  /**
   * @param config
   */
  setServerConfig(config) {
    this.popupExternalUrl = config.app;
    this.contextMenuTitle = config.contextMenuTitle;
    this.popupDimensions = config.popupDimensions;
    this.development = config.development;
  }

};

//
// /* eslint-disable no-magic-numbers */
// new class BackgroundView {
//
//   constructor() {
//     console.log(window);
//     console.log(window);
//     this.browser = window.chrome || browser;
//     console.log(this.browser);
//     const {runtime, extension, browserAction} = this.browser;
//     this.extensionUrl = extension.getURL('');
//     this.extensionButton = browserAction;
//
//     this.loadConfig(extension.getURL('config/config.json')).then(() => {
//       this.popupUrl = `${this.popupExternalUrl}?id=${runtime.id}`;
//
//       this.domain = null;
//       this.activeTab = null;
//       this.popup = null;
//       this.externalConnection = null;
//       this.externalResponseConnection = null;
//       this.editMode = false;
//       this.isWebpage = false;
//
//       this.popupDimensions = {
//         width: this.popupDimensions.width + (this.detectOs('win') ? 15 : 0),
//         height: this.popupDimensions.height + (this.detectOs('win') ? 15 : 0),
//       };
//
//       /** On close popup tab reset icon and empty this.popup */
//       this.getWindows().onRemoved.addListener((winId) => {
//         if (this.popup && winId === this.popup.windowId) {
//           this.popup = null;
//           this.externalConnection = null;
//           this.setIcon();
//         }
//       });
//
//       this.extensionButton.onClicked.addListener(() => this.openPopup());
//       this.contextMenus().onClicked.addListener((info) => this.activateContextMenu(info));
//
//       this.createContextMenu(this.contextMenuTitle);
//
//       /** Monitor tab focus */
//       this.getTabs().onHighlighted.addListener(() => this.switchTab());
//       this.getTabs().onReplaced.addListener(() => this.switchTab());
//       this.getWindows().onFocusChanged.addListener(() => this.switchTab());
//
//       /** Monitor page navigation */
//       this.getTabs().onUpdated.addListener((id, info, tab) => {
//         if (info.status === 'complete' && this.activeTab && this.activeTab.id === tab.id) {
//           this.activateTab(tab);
//           this.setIcon();
//         }
//       });
//
//       /** Monitor for content calls */
//       this.extension.onConnect.addListener((port) => {
//         log.info(`[connected] ${port.name} - ${this.domain}`);
//
//         port.onMessage.addListener((data, port) => {
//           if (data.action !== 'debug' && data.action !== 'log') {
//             log.info(`[action] > ${data.action}`, port.name);
//           }
//
//           const {action} = data;
//           delete data['action'];
//           if (action === 'chooseElement') {
//             this.doneSelecting(data);
//           }
//           if (action === 'cancelElement') {
//             this.contentDoneSelecting(data);
//           }
//           if (action === 'contentUpdated') {
//             this.contentPageUpdated(data);
//           }
//         });
//       });
//
//       /** Monitor for popup calls from the external website */
//       runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
//
//         if (request.action === 'connect') {
//           // Save connection to the popup site
//           this.externalConnection = sendResponse;
//           return true;
//         }
//
//         this.externalResponseConnection = sendResponse;
//
//         if (request.action === 'getUrl') {
//           sendResponse({url: this.activeTab.url});
//         }
//
//         if (request.action === 'getPath' && request.item) {
//           this.sendToContent('startSelecting', {
//             text: 'select',
//             id: request.item,
//             name: request.name,
//           });
//           this.getWindows().update(this.activeTab.windowId, {
//             focused: true,
//           });
//
//           return true;
//         }
//
//         if (request.action === 'getData') {
//           this.sendToContent('getSelectorValues', {
//             selectors: request.selectors,
//           });
//           return true;
//         }
//       });
//     });
//   }
//
//   /**
//    * Load the config file from the url.
//    *
//    * @param url
//    */
//   loadConfig(url) {
//     return fetch(url)
//       .then((response) => response.json())
//       .then((json) => this.setServerConfig(json));
//   }
//
//   /**
//    * @param config
//    */
//   setServerConfig(config) {
//     this.popupExternalUrl = config.app;
//     this.contextMenuTitle = config.contextMenuTitle;
//     this.popupDimensions = config.popupDimensions;
//     this.development = config.development;
//   }
//
//   /**
//    * Get the browser tabs.
//    */
//   getTabs() {
//     return this.browser.tabs;
//   }
//
//   /**
//    * Get the browser windows.
//    */
//   getWindows() {
//     return this.browser.windows;
//   }
//
//   /**
//    * Get the browser context menu.
//    */
//   contextMenus() {
//     return this.browser.contextMenus;
//   }
//
//   /**
//    * Callback from the content script when it is done selecting a css path.
//    *
//    * @param {Object} data
//    */
//   doneSelecting(data) {
//     if (!(data instanceof Object)) {
//       data = {};
//     }
//
//     const path = (data.path !== undefined) ? String(data.path) : undefined;
//     const value = (data.value !== undefined) ? String(data.value) : undefined;
//
//     this.externalResponseConnection({url: this.activeTab.url, path: path, value: value});
//
//     this.iconDoneSelecting();
//     this.sendToContent('stopSelecting');
//     this.getWindows().update(this.popup.windowId, {focused: true});
//   }
//
//   /**
//    * Callback from the content script
//    */
//   contentDoneSelecting() {
//     this.getWindows().update(this.popup.windowId, {focused: true});
//   }
//
//   /**
//    * Callback from the content script
//    */
//   contentPageUpdated() {
//     this.sendToExternal({url: this.activeTab.url});
//   }
//
//   /**
//    * @param selection
//    */
//   selectContentText(selection) {
//     log.info(`selection: ${selection}`);
//     this.openPopup();
//     this.sendToExternal({selection: selection});
//   }
//
//   /**
//    * Callback from the content script
//    * if we don't have a externalConnection yet we wait for it to be established
//    */
//   sendToExternal(data, attempt = 0) {
//
//     if (this.externalConnection) {
//       if (this.popup) {
//         this.externalConnection(data);
//         this.externalConnection = null;
//       }
//       return;
//     }
//
//     // After 11 attempts we give up
//     if (attempt > 10) {
//       return;
//     }
//
//     if (!this.externalConnection) {
//       setTimeout(() => {
//         this.sendToExternal(data, attempt + 1);
//       }, 300);
//     }
//   }
//
//   /**
//    * @param {Object} info
//    */
//   activateContextMenu(info) {
//     if (info.menuItemId === 'print-label') {
//       this.selectContentText(info.selectionText);
//     }
//   }
//
//   /**
//    * Callback from the content script
//    *
//    * @param {object} data
//    */
//   contentResponseHandler(data) {
//     if (data && data.address) {
//       if (this.externalResponseConnection) {
//         this.externalResponseConnection(data.address);
//       }
//     }
//   }
//
//   /**
//    * Create the right-click menu item for the active page.
//    */
//   createContextMenu(title) {
//     /** remove if it already exists */
//     this.contextMenus().removeAll();
//     this.contextMenus().create({
//       id: 'print-label',
//       title: title,
//       contexts: ['selection'],
//     });
//   }
//
//   /**
//    * Set the new activeTab when switching tabs.
//    */
//   switchTab() {
//     this.getTabs().query({active: true, currentWindow: true}, (tabs) => {
//       /** Disable for development pages  */
//       if (!tabs[0] || (this.activeTab && tabs[0].id === this.activeTab.id)) {
//         return;
//       }
//       if (!this.popup || tabs[0].id !== this.popup.id) {
//         this.activateTab(tabs[0]);
//       }
//     });
//   }
//
//   /**
//    * @param tab
//    */
//   activateTab(tab) {
//     this.disableForNoneWebsites(tab);
//     /** Changing the active tab your are not editing anymore  */
//     if (this.activeTab && tab.id !== this.activeTab.id && this.editMode) {
//       this.sendToContent('stopSelecting');
//       this.editMode = false;
//     }
//
//     this.activeTab = tab;
//
//     if (this.isWebpage) {
//       this.domain = this.urlToId(tab.url);
//       this.loadTabScript();
//       this.contentPageUpdated();
//     }
//   }
//
//   /**
//    * Load the content script and style on the website.
//    */
//   loadTabScript() {
//     if (this.popup && this.isWebpage && this.activeTab) {
//       this.getTabs().sendMessage(this.activeTab.id, {action: 'ping'}, (response) => {
//         if (response !== 'pong') {
//           this.getTabs().insertCSS(this.activeTab.id, {file: 'dist/css/inject.css'}, () => {
//             log.info(`[loaded] inject.css on: ${this.domain}`);
//           });
//           this.getTabs().executeScript(this.activeTab.id, {file: 'dist/js/inject.js'}, () => {
//             log.info(`[loaded] inject.js on: ${this.domain}`);
//           });
//         }
//       });
//     }
//   }
//
//   /**
//    * If you are not on a valid website the extension does not have to get content.
//    *
//    * @param {Object} tab
//    */
//   disableForNoneWebsites(tab) {
//     if (!tab.url || tab.url.substring(0, 4) !== 'http') {
//       log.info('[ignore] not a website');
//       this.isWebpage = false;
//     } else {
//       log.info(`[focus] ${this.urlToId(tab.url)}`);
//       this.isWebpage = true;
//     }
//   }
//
//   /**
//    * Show already created popup
//    */
//   showPopup() {
//     this.getWindows().getCurrent((win) => {
//       this.getWindows().update(this.popup.windowId, {
//         focused: true,
//         drawAttention: true,
//         left: win.left + win.width - this.popupDimensions.width,
//         top: win.top + 75,
//         height: this.popupDimensions.height,
//         width: this.popupDimensions.width,
//       });
//     });
//   }
//
//   /**
//    * @param {null|string} url
//    */
//   openPopup(url = null) {
//     log.info('openPopup');
//     if (this.popup) {
//       this.showPopup();
//     } else {
//       if (!url) {
//         url = `${this.popupUrl}&url=${window.encodeURI(this.domain)}`;
//       }
//       this.getWindows().getCurrent((win) => {
//         this.getWindows().create({
//           url: url,
//           type: 'popup',
//           height: this.popupDimensions.height,
//           width: this.popupDimensions.width,
//           left: win.left + win.width - this.popupDimensions.width,
//           top: win.top + 75,
//         }, (win) => {
//           /** For firefox we need to use the return promise */
//           this.popup = win.tabs[0];
//
//           /** Make sure content script is loaded */
//           this.loadTabScript();
//         });
//       });
//     }
//   }
//
//   /**
//    * @param {boolean} check
//    * @returns {*}
//    */
//   detectOs(check) {
//     let OSName = 'Unknown OS';
//     if (navigator.appVersion.indexOf('Win') !== -1) {
//       OSName = 'win';
//     }
//     if (navigator.appVersion.indexOf('Mac') !== -1) {
//       OSName = 'mac';
//     }
//     if (navigator.appVersion.indexOf('X11') !== -1) {
//       OSName = 'unix';
//     }
//     if (navigator.appVersion.indexOf('Linux') !== -1) {
//       OSName = 'linux';
//     }
//
//     return (check) ? (check === OSName) : OSName;
//   }
//
//   /**
//    * @param {string} url
//    * @returns {string}
//    */
//   urlToId(url) {
// const id = (url.indexOf('://') > -1) ? url.split('/')[2] : url.split('/')[0]; // replace dots and remove port
// number;
// const uri = id.replace(/\./g, '_').split(':')[0];
// return String(uri).replace('www_', '');
// }
// /** * Set
//  extension icon to done status. */ iconDoneSelecting();
// {
//   this.animateIcon('#000', '!');
// }
// /** * @param {string}
//   color * @param {string} text * @param {int} at */ animateIcon(color = '', text = '', at = 0);
// {
//   if (at < 7) {
//     setTimeout(() => {
//       this.animateIcon(color, text, at + 1);
//     }, 250);
//     this.setIcon({
//       color: color, text: String(at % 2
//       === 0 ? '' : text),
//     });
//   } else {
//     if (this.iconFail) {
//       this.setIcon({color: '#ac2323', text: 'X'});
//     } else {
//       this.setIcon({color: '#23ac86', text: 'V'});
//     }
//     setTimeout(() => this.setIcon(), 3000);
//     this.iconFail = false;
//   }
// }
// /** * @param data */ setIcon(data);
// {
//   if (!data) {
//     data = {};
//   }
//   if (data.color) {
//     this.extensionButton.setBadgeBackgroundColor({color: data.color});
//   }
//   if (data.text) {
//     this.extensionButton.setBadgeText({text: data.text});
//   } else {
//     this.extensionButton.setBadgeText({text: ''});
//   }
//   if
//   (data.title) {
//     this.extensionButton.setTitle({title: data.title});
//   } else {
//     this.extensionButton.setTitle({
//       title:
//         'MyParcel.com',
//     });
//   }
// }
// /** * @param {string} action * @param {Object} data */ sendToContent(action, data = {});
// {
//   if
//   (!(data instanceof Object)) {
//     data = {data: data};
//   }
//   data['action'] = action;
//   data['root'] = this.extensionUrl;
//   if
//   (this.activeTab) {
//     this.getTabs().sendMessage(this.activeTab.id, data, (response) => {
//       this.contentResponseHandler(response);
//     });
//   }
// }
// }
