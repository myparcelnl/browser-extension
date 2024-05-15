import './scss/content.scss';
import {type MessageToContent, type MessageFromContent, type MapFieldMessageToContent} from './types';
import Logger from './helpers/Logger';
import {ActionNames} from './helpers';
import Selection from './content/Selection';
import ContentActions from './content/ContentActions';

interface Listeners {
  background(data: MessageToContent): void;

  disconnect(): void;
}

export default class Content {
  /**
   * The connection to the background script.
   */
  private static backgroundConnection: chrome.runtime.Port;

  /**
   * Listener object.
   */
  private static listeners: Listeners = {} as Listeners;

  /**
   * Set up the event listeners for the background script.
   */
  public static boot() {
    this.listeners.background = (message: MessageToContent) => {
      if (import.meta.env.DEV) {
        // The data property is used by crx and does not need to be passed on.
        delete message.data;
      }

      this.backgroundListener(message);
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

    this.sendConnectedToBackground();
  }

  /**
   * Send data to background script.
   */
  public static sendToBackground(message: MessageFromContent) {
    Logger.request('background', message);

    this.backgroundConnection.postMessage(message);
  }

  private static sendConnectedToBackground() {
    this.sendToBackground({action: ActionNames.contentConnected, url: window.location.href});
  }

  /**
   * Listener for messages from background script.
   */
  private static backgroundListener<Action extends ActionNames>(message: MessageToContent<Action>) {
    Logger.request('background', message, true);

    switch (message.action) {
      case ActionNames.checkContentConnection:
        this.sendConnectedToBackground();
        break;

      /**
       * Map an element to a field.
       */
      case ActionNames.mapField:
        void ContentActions.mapField(message as MapFieldMessageToContent);
        break;

      /**
       * Find the content on the current page.
       */
      case ActionNames.getContent:
        void ContentActions.getContent(message);
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
