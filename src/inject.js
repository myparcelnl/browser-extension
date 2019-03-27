import actionNames from './helpers/actionNames';
import actions from './inject/actions';
import log from './helpers/log';
import { selection } from './inject/selection';

const listeners = {};
const url = window.location.hostname;
let backgroundConnection = null;

const content = {

  /**
   * Set up the event listeners for the background script.
   *
   * @return {Promise}
   */
  async boot() {
    listeners.background = (...args) => this.backgroundListener(...args);
    listeners.disconnect = () => selection.stopMapping();

    backgroundConnection = await this.establishConnection();

    backgroundConnection.onMessage.addListener(listeners.background);
    backgroundConnection.onDisconnect.addListener(listeners.disconnect);
    this.sendToBackground(actionNames.contentConnected, {url});
  },

  /**
   * Establish the connection to the background script.
   *
   * @return {Promise<Object>}
   */
  establishConnection() {
    return new Promise((resolve) => {
      resolve(chrome.runtime.connect({name: 'MyParcelContentScript'}));
    });
  },

  /**
   * Send data to background script.
   *
   * @param {string} action - Action name.
   * @param {Object} data - Request content.
   */
  sendToBackground(action, data) {
    log.background(action);
    backgroundConnection.postMessage({...data, action});
  },

  /**
   * Listener for messages from background script.
   *
   * @param {Object} request - Request object.
   */
  backgroundListener(request) {
    log.background(request.action, true);
    console.log(request);

    switch (request.action) {
      case actionNames.switchedTab:
        this.sendToBackground(actionNames.contentConnected, {url});
        break;

      case actionNames.mapField:
        actions.mapField({url, field: request.field});
        break;

      case actionNames.getContent:
        actions.getContent(request);
        break;

        // case actionNames.getContent:
        //   return actions.getContent(request);

      case actionNames.stopListening:
        backgroundConnection.onMessage.removeListener(listeners.background);
        backgroundConnection.disconnect();
        break;
    }
  },
};

content.boot();

export default content;
