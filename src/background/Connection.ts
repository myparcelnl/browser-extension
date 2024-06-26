import {
  type MessageToPopup,
  type MessageToContent,
  type AnyMessage,
  type MessageQueue,
  type AnyFn,
  type ConnectionType,
} from '../types/index.js';
import {ActionNames} from '../helpers/index.js';
import Logger from '../helpers/Logger.js';
import {CONTENT, POPUP} from '../constants.js';
import Background from '../Background.js';

export default class Connection {
  /**
   * Connection with the popup script.
   */
  public static popup: undefined | chrome.runtime.Port;
  private static contentPorts: Map<number, chrome.runtime.Port> = new Map();
  /**
   * Queue for messages to the content script.
   */
  private static contentQueue: Map<number, MessageQueue> = new Map();
  /**
   * Queue for messages to the popup.
   */
  private static popupQueue: MessageQueue = new Set();
  /**
   * Actions to skip when trying to add a request to a queue.
   */
  private static queueFilters: Record<'popup' | 'content', ActionNames[]> = {
    [POPUP]: [ActionNames.contentConnected],
    [CONTENT]: [],
  };

  /**
   * Send queue messages and empty it afterward.
   */
  public static flushQueue(type: ConnectionType): void {
    const queue = this.getQueue(type);

    if (queue.size <= 0) {
      return;
    }

    const sendFunction = this.getSendFunction(type).bind(this);

    const typeText = type.id ? `${type.type} ${type.id}` : `${type.type}`;

    Logger.info(`Flushing ${typeText} queue:`);

    queue.forEach((message: string) => sendFunction(JSON.parse(message)));
    queue.clear();

    Logger.success(`Flushed ${typeText} queue`);
  }

  public static savePort(port: chrome.runtime.Port): void {
    const tabId = port.sender?.tab?.id;

    if (!tabId) {
      throw new Error('Tab ID is missing.');
    }

    this.contentPorts.set(tabId, port);
    this.contentQueue.set(tabId, new Set());
  }

  /**
   * Send data to injected content script.
   */
  public static sendToContent<Action extends ActionNames>(message: MessageToContent<Action>): void {
    const resolvedMessage = Background.addActiveTabToMessage(message);
    const activeTabId = resolvedMessage.id;
    const connectionType = {type: CONTENT, id: activeTabId} satisfies ConnectionType;

    try {
      const port = this.getContentPort(activeTabId);

      port.postMessage({
        ...resolvedMessage,
        ...(import.meta.env.DEV
          ? {
              // CRX throws an error when data is not valid JSON.
              data: '{}',
            }
          : {}),
      });
      Logger.request(CONTENT, resolvedMessage);
    } catch (e) {
      Logger.error('sendToContent', e);
      this.addToQueue(connectionType, resolvedMessage);

      if (!activeTabId) {
        return;
      }

      this.contentPorts.delete(activeTabId);
    }
  }

  /**
   * Send data to popup.
   */
  public static sendToPopup<Action extends ActionNames>(message: MessageToPopup<Action>): void {
    const resolvedMessage = Background.addActiveTabToMessage<Action>(message);

    if (!this.popup) {
      this.addToQueue({type: POPUP}, resolvedMessage);
      return;
    }

    try {
      this.popup?.postMessage(resolvedMessage);
      Logger.request(POPUP, resolvedMessage);
    } catch (e) {
      Logger.error('sendToPopup', e);
      this.addToQueue({type: POPUP}, resolvedMessage);
      this.popup = undefined;
    }
  }

  private static addToQueue(type: ConnectionType, message: AnyMessage) {
    const queueFilters = this.queueFilters[type.type];

    if (queueFilters.includes(message.action)) {
      return;
    }

    Logger.request(type.type, message, 'queue');

    const queue = this.getQueue(type);

    queue.add(JSON.stringify(message));
  }

  private static getContentPort(tabId?: number): chrome.runtime.Port {
    const activeTab = Background.getActiveTab();
    const resolvedTabId = tabId ?? activeTab?.id;

    if (!resolvedTabId || !this.contentPorts.has(resolvedTabId)) {
      throw new Error('No content port found.');
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.contentPorts.get(resolvedTabId)!;
  }

  /**
   * Get the message queue for the given type.
   */
  private static getQueue(type: ConnectionType): MessageQueue {
    if (type.type === POPUP) {
      return this.popupQueue;
    }

    if (!type.id) {
      throw new Error('Tab ID is missing.');
    }

    if (!this.contentQueue.has(type.id)) {
      this.contentQueue.set(type.id, new Set());
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.contentQueue.get(type.id)!;
  }

  /**
   * Get the send function for the given type.
   */
  private static getSendFunction(type: ConnectionType): AnyFn {
    switch (type.type) {
      case POPUP:
        return this.sendToPopup;

      case CONTENT:
        return this.sendToContent;
    }
  }
}
