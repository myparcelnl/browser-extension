import Logger from '../helpers/Logger';
import ActionNames from '../helpers/ActionNames';
import Background from '../Background';

export default class Connection {
  static POPUP = 'popup';
  static CONTENT = 'content';

  /**
   * Connection with the popup script.
   *
   * @type {chrome.runtime.Port}
   */
  static popup;

  /**
   * Connection with the injected content script.
   *
   * @type {chrome.runtime.Port}
   */
  static content;

  /**
   * @type {Boolean|Number}
   */
  static popupConnected = false;

  /**
   * @type {Boolean|Object}
   */
  static contentConnected = false;

  /**
   * @type {Array}
   */
  static popupQueue = [];

  /**
   * @type {Array}
   */
  static contentQueue = [];

  /**
   * Actions to skip when trying to add a request to a queue.
   *
   * @type {{popup: String[], content: String[]}}
   */
  static queueFilters = {
    popup: [ActionNames.contentConnected],
    content: [],
  };

  /**
   * Set popupConnected, flush the popup queue and tell the popup the background is ready.
   */
  static onPopupConnect(request) {
    this.popupConnected = true;

    Background.confirmContentConnection(request).then(() => {
      this.flushQueue(this.POPUP);
    });
  }

  /**
   * Process queue and empty it afterwards.
   *
   * @param {String} type - Can be 'content' or 'popup'. Decides which queue and sendFunction to use.
   *
   * @returns {Array}
   */
  static flushQueue(type) {
    let queue = this.getQueue(type);
    const sendFunction = this.getSendFunction(type).bind(this);

    if (queue && Object.keys(queue).length) {
      // Dedupe queue
      const unique = new Set(queue.map((obj) => JSON.stringify(obj)));
      queue = Array.from(unique).map((obj) => JSON.parse(obj));

      Logger.info(`Sending ${type} queue`);
      queue.forEach((message) => {
        sendFunction(message);
      });

      queue = [];
    }

    return queue;
  }

  /**
   * Send data to popup.
   *
   * @param {Object} data - Request object.
   */
  static sendToPopup(data) {
    if (this.popupConnected) {
      try {
        data.url = Background.getURL();

        this.popup.postMessage(data);
        Logger.request(this.POPUP, data);
      } catch (e) {
        Logger.error('sendToPopup', e);
        this.addToPopupQueue(data);
      }
    } else {
      this.addToPopupQueue(data);
    }
  }

  /**
   * Send data to injected content script.
   *
   * @param {Object} data - Request object.
   */
  static sendToContent(data) {
    if (this.contentConnected) {
      try {
        this.content.postMessage(data);
        Logger.request(this.CONTENT, data);
      } catch (e) {
        Logger.error('sendToContent', e);
        this.addToContentQueue(data);
      }
    } else {
      this.addToContentQueue(data);
    }
  }

  /**
   * Set contentConnected, flush the content queue and tell the popup the content script is ready.
   *
   * @param {Object} request - Request object.
   */
  static onContentConnect(request) {
    this.contentConnected = Boolean(this.content.sender.url);
    this.contentQueue = this.flushQueue(this.CONTENT);

    void Background.confirmContentConnection(request);
  }

  /**
   * Get the message queue for the given type.
   *
   * @param {String} type - `popup` or `queue`.
   * @returns {Array|undefined}
   */
  static getQueue(type) {
    if (type === this.POPUP) {
      return this.popupQueue;
    } else if (type === this.CONTENT) {
      return this.contentQueue;
    }
  }

  /**
   * Get the send function for the given type.
   *
   * @param {String} type - `popup` or `queue`.
   *
   * @returns {Function|undefined}
   */
  static getSendFunction(type) {
    if (type === this.POPUP) {
      return this.sendToPopup;
    } else if (type === this.CONTENT) {
      return this.sendToContent;
    }
  }

  /**
   * Helper to add message to content queue.
   *
   * @param {Object} data - Data to add to the queue.
   */
  static addToContentQueue(data) {
    if (this.queueFilters.content.includes(data.action)) {
      return;
    }

    Logger.request(this.CONTENT, data, 'queue');
    this.contentQueue.push(data);
  }

  /**
   * Helper to add message to popup queue.
   *
   * @param {Object} data - Data to add to the queue.
   */
  static addToPopupQueue(data) {
    if (this.queueFilters.popup.includes(data.action)) {
      return;
    }

    Logger.request(this.POPUP, data, 'queue');
    this.popupQueue.push(data);
  }
}
