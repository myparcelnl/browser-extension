import actionNames from './helpers/actions';
import actions from './inject/actions';
import log from './helpers/log';
import { selection } from './inject/selection';

const listeners = {};
const url = window.location.hostname;
let backgroundConnection = null;

const content = {

  boot() {
    log.info('Setting up content script.');

    listeners.background = (...args) => this.backgroundListener(...args);
    listeners.disconnect = () => selection.stopMapping();

    this.establishConnection().then((connection) => {
      backgroundConnection = connection;

      backgroundConnection.onMessage.addListener(listeners.background);
      backgroundConnection.onDisconnect.addListener(listeners.disconnect);
      this.sendToBackground(actionNames.contentConnected, {url});
    });
  },

  /**
   * Establish the connection with the background script
   * @returns {Promise<any>}
   */
  establishConnection() {
    return new Promise((resolve) => {
      resolve(chrome.runtime.connect({name: 'MyParcelContentScript'}));
    });
  },

  /**
   * Send data to background script
   * @param action
   * @param message
   */
  sendToBackground(action, message) {
    backgroundConnection.postMessage(Object.assign({action}, message));
  },

  /**
   * Listener for messages from background script
   * @param request
   * @returns {Promise<void>}
   */
  backgroundListener(request) {
    console.log(request);

    switch (request.action) {
      case actionNames.checkContentConnection:
        this.sendToBackground(actionNames.contentConnected, {url});
        break;

      case actionNames.mapField:
        return actions.mapField({url, field: request.field});

      case actionNames.getSelectorContent:
        return actions.getElementsContent(request.selectors);

      case actionNames.stopListening:
        backgroundConnection.onMessage.removeListener(listeners.background);
        backgroundConnection.disconnect();
        log.info('Popup closed. Content script deactivated.');
        break;
    }
  },
};

content.boot();

export default content;
