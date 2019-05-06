import ActionNames from './helpers/ActionNames';
import ContentActions from './content/ContentActions';
import Logger from './helpers/Logger'; // strip-log
import {selection} from './content/selection';

export default class Content {

  /**
   * The connection to the background script.
   *
   * @type chrome.runtime.Port
   */
  static backgroundConnection;

  /**
   * Listener object.
   *
   * @type {Object}
   */
  static listeners = {};

  /**
   * Set up the event listeners for the background script.
   */
  static boot() {
    this.listeners.background = (...args) => {
      this.backgroundListener(...args);
    };

    this.listeners.disconnect = () => {
      selection.stopMapping();
    };

    // Establish the connection to the background script
    this.backgroundConnection = chrome.runtime.connect({name: 'MyParcelContentScript'});

    this.backgroundConnection.onMessage.addListener(this.listeners.background);
    this.backgroundConnection.onDisconnect.addListener(this.listeners.disconnect);

    this.sendToBackground(ActionNames.contentConnected);
  }

  /**
   * Send data to background script.
   *
   * @param {string} action - Action name.
   * @param {Object} data - Request content.
   */
  static sendToBackground(action, data = {}) {
    const request = {url: window.location.hostname, ...data, action};
    Logger.request('background', request);
    this.backgroundConnection.postMessage(request);
  }

  /**
   * Listener for messages from background script.
   *
   * @param {Object} request - Request object.
   */
  static backgroundListener(request) {
    Logger.request('background', request, true);

    switch (request.action) {

      /**
       * Map an element to a field.
       */
      case ActionNames.mapField:
        ContentActions.mapField(request);
        break;

      /**
       * Find the content on the current page.
       */
      case ActionNames.getContent:
        ContentActions.getContent(request);
        break;

      /**
       * Remove listener and connection to extension.
       */
      case ActionNames.stopListening:
        this.backgroundConnection.onMessage.removeListener(this.listeners.background);
        this.backgroundConnection.disconnect();
        break;
    }
  }
};

Content.boot();
