import ActionNames from './helpers/ActionNames';
import ContentActions from './content/ContentActions';
import Logger from './helpers/Logger'; // strip-log
import { selection } from './content/selection';

const listeners = {};
let backgroundConnection;

export default class Content {

  /**
   * Set up the event listeners for the background script.
   *
   * @return {Promise}
   */
  static async boot() {
    listeners.background = (...args) => this.backgroundListener(...args);
    listeners.disconnect = () => selection.stopMapping();

    backgroundConnection = await this.establishConnection();

    backgroundConnection.onMessage.addListener(listeners.background);
    backgroundConnection.onDisconnect.addListener(listeners.disconnect);
    this.sendToBackground(ActionNames.contentConnected);
  }

  /**
   * Establish the connection to the background script.
   *
   * @return {MessagePort}
   */
  static establishConnection() {
    return new Promise((resolve) => {
      resolve(chrome.runtime.connect({name: 'MyParcelContentScript'}));
    });
  }

  /**
   * Send data to background script.
   *
   * @param {string} action - Action name.
   * @param {Object} data - Request content.
   */
  static sendToBackground(action, data = {}) {
    Logger.request('background', action);
    backgroundConnection.postMessage({url: window.location.hostname, ...data, action});
  }

  /**
   * Listener for messages from background script.
   *
   * @param {Object} request - Request object.
   */
  static async backgroundListener(request) {
    const {field, action, selectors, preset} = request;
    Logger.request('background', request, true);

    switch (action) {
      case ActionNames.switchedTab:
        this.sendToBackground(ActionNames.contentConnected);
        break;

      case ActionNames.mapField:
        await ContentActions.mapField({field});
        break;

      case ActionNames.getContent:
        await ContentActions.getContent({preset, selectors});
        break;

      case ActionNames.stopListening:
        backgroundConnection.onMessage.removeListener(listeners.background);
        backgroundConnection.disconnect();
        break;
    }
  }
};

Content.boot();
