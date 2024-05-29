import './scss/content.scss';
import {
  type MessageToContent,
  type MessageFromContent,
  type MapFieldMessage,
  type ContentConnectedMessage,
  type GetContentMessageToContent,
  type FoundContentMessage,
  type MappedFieldMessage,
} from './types/index.js';
import {ActionNames} from './helpers/index.js';
import Logger from './helpers/Logger.js';
import Selection from './content/Selection.js';
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
   * String identifier for the content script.
   */
  private static identifier: number | undefined;
  /**
   * Listener object.
   */
  private static listeners: Listeners = {} as Listeners;

  /**
   * Set up the event listeners for the background script.
   */
  public static boot(): void {
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
  public static sendToBackground(message: MessageFromContent): void {
    Logger.request(BACKGROUND, message);

    this.backgroundConnection.postMessage(this.addIdentifierToMessage(message));
  }

  private static addIdentifierToMessage<
    Action extends ActionNames,
    Message extends MessageToContent<Action> | MessageFromContent<Action>,
  >(message: Message): Message {
    return {...message, id: this.identifier};
  }

  /**
   * Listener for messages from the service worker.
   */
  private static backgroundListener<Action extends ActionNames>(message: MessageToContent<Action>): void {
    const resolvedMessage = this.addIdentifierToMessage(message);

    Logger.request(BACKGROUND, resolvedMessage, true);

    switch (message.action) {
      case ActionNames.contentConnected:
        Content.setIdentifier(resolvedMessage as ContentConnectedMessage);
        break;

      /**
       * Map an element to a field.
       */
      case ActionNames.mapField:
        void this.mapField(resolvedMessage as MapFieldMessage);
        break;

      /**
       * Find the content on the current page.
       */
      case ActionNames.getContent:
        void this.getContent(resolvedMessage as GetContentMessageToContent);
        break;

      case ActionNames.stopMapping:
        Selection.stopMapping();
        break;
    }
  }

  /**
   * Get values using previously mapped fields (if any).
   */
  private static getContent(message: GetContentMessageToContent): void {
    const {selectors, action, ...requestProperties} = message;
    const values = Selection.getElementsContent(message.selectors ?? {});

    Content.sendToBackground({
      ...requestProperties,
      action: ActionNames.foundContent,
      url: window.location.href,
      values,
    } satisfies FoundContentMessage);
  }

  /**
   * Start creating new field mapping.
   */
  private static async mapField(message: MapFieldMessage): Promise<void> {
    const {field, url} = message;
    const path = await Selection.startMapping(message.strings);
    const elementContent = Selection.getSelectorContent(path);

    Content.sendToBackground({
      action: ActionNames.mappedField,
      url,
      field,
      path,
      content: elementContent,
    } satisfies MappedFieldMessage);
  }

  private static setIdentifier(message: ContentConnectedMessage): void {
    this.identifier = message.id;
    Logger.success(`Tab ID: ${this.identifier}`);
  }
}
