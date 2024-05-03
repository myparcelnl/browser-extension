import './scss/content.scss';
import Logger from './helpers/Logger';
import ActionNames from './helpers/ActionNames';
import Selection from './content/Selection';
import ContentActions from './content/ContentActions';

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
      Selection.stopMapping();
      Selection.removeTooltip();
    };

    // Establish the connection to the background script
    this.backgroundConnection = chrome.runtime.connect({
      name: `${chrome.runtime.getManifest().short_name}ContentScript`,
    });

    this.backgroundConnection.onMessage.addListener(this.listeners.background);
    this.backgroundConnection.onDisconnect.addListener(this.listeners.disconnect);

    Content.sendConnectedToBackground();
  }

  static sendConnectedToBackground() {
    this.sendToBackground(ActionNames.contentConnected, {url: window.location.href});
  }

  /**
   * Send data to background script.
   *
   * @param {string} action - Action name.
   * @param {Object} data - Request content.
   */
  static sendToBackground(action, data = {}) {
    const request = {...data, action};
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
      case ActionNames.checkContentConnection:
        this.sendConnectedToBackground();
        break;

      /**
       * Map an element to a field.
       */
      case ActionNames.mapField:
        void ContentActions.mapField(request);
        break;

      /**
       * Find the content on the current page.
       */
      case ActionNames.getContent:
        void ContentActions.getContent(request);
        break;

      /**
       * Remove listener and connection to extension.
       */
      case ActionNames.stopListening:
        this.backgroundConnection.onMessage.removeListener(this.listeners.background);
        this.backgroundConnection.disconnect();
        break;

      /**
       * Remove listener and connection to extension.
       */
      case ActionNames.stopMapping:
        Selection.stopMapping();
        break;
    }
  }
}

Content.boot();
