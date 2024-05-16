import './scss/content.scss';
import {
  type MessageToContent,
  type MessageFromContent,
  type MapFieldMessage,
  type ContentConnectedMessage,
  type GetContentMessageToContent,
} from './types/index.js';
import {ActionNames} from './helpers/index.js';
import Logger from './helpers/Logger.js';
import Selection from './content/Selection.js';
import ContentActions from './content/ContentActions.js';
import {BACKGROUND} from './constants.js';

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
   * String identifier for the content script.
   */
  private static identifier: number | undefined;

  /**
   * Set up the event listeners for the background script.
   */
  public static boot() {
    this.listeners.background = (message: MessageToContent) => {
      if (import.meta.env.DEV) {
        // The data property is used by crx and does not need to be passed on.
        delete message.data;
      }

      return this.backgroundListener(message);
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

    this.sendToBackground({action: ActionNames.contentConnected, url: window.location.href, settings: null});
  }

  /**
   * Send data to service worker script.
   */
  public static sendToBackground(message: MessageFromContent) {
    Logger.request(BACKGROUND, message);

    this.backgroundConnection.postMessage({...message, id: this.identifier});
  }

  /**
   * Listener for messages from the service worker.
   */
  private static backgroundListener<Action extends ActionNames>(message: MessageToContent<Action>) {
    Logger.request(BACKGROUND, {...message, id: this.identifier}, true);

    const resolvedMessage = {...message, id: message.id ?? this.identifier};

    switch (message.action) {
      case ActionNames.contentConnected:
        Content.setIdentifier(resolvedMessage as ContentConnectedMessage);
        break;

      /**
       * Map an element to a field.
       */
      case ActionNames.mapField:
        void ContentActions.mapField(resolvedMessage as MapFieldMessage);
        break;

      /**
       * Find the content on the current page.
       */
      case ActionNames.getContent:
        void ContentActions.getContent(resolvedMessage as GetContentMessageToContent);
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

  private static setIdentifier(message: ContentConnectedMessage): void {
    this.identifier = message.id;
    Logger.success(`Tab ID: ${this.identifier}`);
  }
}
