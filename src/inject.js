import { clickedElement, elementsContent } from './inject/selection';
import Actions from './helpers/actions';
import log from './helpers/log';

const listeners = {};

class MyParcelContentScript {

  constructor() {
    log.info('Setting up content script.');

    listeners.background = (...args) => this.backgroundListener(...args);
    listeners.disconnect = () => Selection.stopMapping();

    this.establishConnection().then(() => {
      this.connection.onMessage.addListener(listeners.background);
      this.connection.onDisconnect.addListener(listeners.disconnect);
      this.sendToBackground(Actions.contentConnected, {url: window.location.hostname});
    });
  }

  /**
   * Establish the connection with the background script
   * @returns {Promise<any>}
   */
  establishConnection() {
    return new Promise((resolve) => {
      this.connection = chrome.runtime.connect({name: 'MyParcelContentScript'});
      resolve();
    });
  }

  /**
   * Send data to background script
   * @param action
   * @param message
   */
  sendToBackground(action, message) {
    this.connection.postMessage(Object.assign({action}, message));
  }

  /**
   * Listener for messages from background script
   * @param request
   * @returns {Promise<void>}
   */
  backgroundListener(request) {
    console.log(request);

    switch (request.action) {
      case Actions.checkContentConnection:
        this.sendToBackground(Actions.contentConnected, {url: window.location.hostname});
        break;

      case Actions.mapField:
        return this.mapField(request.field);

      case Actions.getSelectorContent:
        this.getElementsContent(request.selectors);
        break;

      case Actions.stopListening:
        this.connection.onMessage.removeListener(listeners.background);
        this.connection.disconnect();
        log.info('Popup closed. Content script deactivated.');
        break;
    }
  }

  /**
   * Get values using previously mapped fields (if any)
   * @param selectors
   * @returns {Promise<void>}
   */
  async getElementsContent(selectors) {
    const values = await elementsContent(selectors);
    this.sendToBackground('foundElementContent', {values});
  }

  /**
   * Start creating new field mapping
   * @param field
   * @returns {Promise<void>}
   */
  async mapField(field) {
    const path = await clickedElement();
    this.sendToBackground('mappedField', {path, field});
  }

  // getElementContent(selector) {
  //   const text = document.querySelector(selector).innerText;
  //   this.sendToBackground('foundElementContent', {selector, text});
  // }
}

new MyParcelContentScript();
