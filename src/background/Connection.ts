import {
  type MessageDataWithUrl,
  type MessageToPopup,
  type MessageToContent,
  type AnyMessage,
  type MessageQueue,
  type AnyFn,
  type ConnectionType,
} from '../types';
import Logger from '../helpers/Logger';
import {ActionNames} from '../helpers';
import {CONTENT, POPUP} from '../constants';
import Background from '../Background';

export default class Connection {
  /**
   * Connection with the popup script.
   */
  public static popup: undefined | chrome.runtime.Port;

  private static popupQueue: MessageQueue = new Set();

  private static contentQueue: MessageQueue = new Set();

  /**
   * Actions to skip when trying to add a request to a queue.
   */
  private static queueFilters: Record<ConnectionType, ActionNames[]> = {
    [POPUP]: [ActionNames.contentConnected, ActionNames.switchedTab],
    [CONTENT]: [],
  };

  private static contentPorts: Map<number, chrome.runtime.Port> = new Map();

  public static savePort(port: chrome.runtime.Port) {
    if (!port.sender?.tab?.id) {
      throw new Error('Tab ID is missing.');
    }

    this.contentPorts.set(port.sender.tab.id, port);
  }

  /**
   * Set popupConnected, flush the popup queue and tell the popup the background is ready.
   */
  static onPopupConnect(request: {url?: string}) {
    void Background.confirmContentConnection(request).then(() => {
      this.flushQueue(POPUP);
    });
  }

  /**
   * Process queue and empty it afterward.
   */
  static flushQueue(type: ConnectionType): MessageQueue {
    const queue = this.getQueue(type);

    if (queue.size > 0) {
      const sendFunction = this.getSendFunction(type).bind(this);

      Logger.info(`Flushing ${type} queue:`);
      queue.forEach((message: string) => sendFunction(JSON.parse(message)));
      queue.clear();
      Logger.success(`Flushed ${type} queue`);
    }

    return queue;
  }

  /**
   * Send data to popup.
   */
  public static sendToPopup<Action extends ActionNames>(message: MessageToPopup<Action>) {
    const resolvedMessage: MessageToPopup<Action> = {
      ...message,
      url: Background.getUrl(),
    };

    if (!this.popup) {
      this.addToQueue(POPUP, resolvedMessage);
      return;
    }

    try {
      this.popup?.postMessage(resolvedMessage);
      Logger.request(POPUP, resolvedMessage);
    } catch (e) {
      Logger.error('sendToPopup', e);
      this.addToQueue(POPUP, resolvedMessage);
      this.popup = undefined;
    }
  }

  /**
   * Send data to injected content script.
   */
  public static sendToContent<Action extends ActionNames>(message: MessageToContent<Action>): void {
    const port = this.getContentPort();

    if (!port) {
      this.addToQueue(CONTENT, message);
      return;
    }

    try {
      port.postMessage({
        ...(import.meta.env.DEV
          ? {
              // CRX throws an error when data is not valid JSON.
              data: '{}',
            }
          : {}),
        ...message,
      });
      Logger.request(CONTENT, message);
    } catch (e) {
      Logger.error('sendToContent', e);
      this.addToQueue(CONTENT, message);

      const activeTabId = Background.activeTab?.id;

      if (activeTabId) {
        this.contentPorts.delete(activeTabId);
      }
    }
  }

  /**
   * Set contentConnected, flush the content queue and tell the popup the content script is ready.
   */
  static onContentConnect(message: MessageDataWithUrl) {
    this.contentQueue = this.flushQueue(CONTENT);

    void Background.confirmContentConnection(message);
  }

  /**
   * Get the message queue for the given type.
   */
  private static getQueue(type: ConnectionType): MessageQueue {
    switch (type) {
      case POPUP:
        return this.popupQueue;

      case CONTENT:
        return this.contentQueue;
    }
  }

  /**
   * Get the send function for the given type.
   */
  private static getSendFunction(type: ConnectionType): AnyFn {
    switch (type) {
      case POPUP:
        return this.sendToPopup;

      case CONTENT:
        return this.sendToContent;
    }
  }

  private static addToQueue(type: ConnectionType, message: AnyMessage) {
    const queueFilters = this.queueFilters[type];

    if (queueFilters.includes(message.action)) {
      return;
    }

    Logger.request(type, message, 'queue');

    const queue = this.getQueue(type);

    queue.add(JSON.stringify(message));
  }

  private static getContentPort(): chrome.runtime.Port | undefined {
    const tab = Background.activeTab;

    if (!tab?.id) {
      return undefined;
    }

    return this.contentPorts.get(tab.id);
  }
}
