/* eslint-disable no-console */

/**
 * Debug logging file. This is only imported on development.
 */
export default class Logger {

  /**
   * General success message.
   *
   * @param {string} message - Message to output.
   * @param {*} log - Extra data to output.
   */
  static success(message, log = '') {
    this.createMessage(message, 'background-color: #23b237;', log);
  }

  /**
   * General info message.
   *
   * @param {string} message - Message to output.
   * @param {*} log - Extra data to output.
   */
  static info(message, log = '') {
    this.createMessage(message, 'background-color: #34b7d4;', log);
  }

  /**
   * General warning message.
   *
   * @param {string} message - Message to output.
   * @param {*} log - Extra data to output.
   */
  static warning(message, log = '') {
    this.createMessage(message, 'background-color: #d18800;', log);
  }

  /**
   * General error message.
   *
   * @param {string} message - Message to output.
   * @param {*} log - Extra data to output.
   */
  static error(message, log = '') {
    this.createMessage(message, 'background-color: #d45839;', log);
  }

  /**
   * Event message.
   *
   * @param {string} message - Message to output.
   * @param {*} log - Extra data to output.
   */
  static event(message, log = '') {
    console.log(
      `%cEvent%c${message}`,
      'background-color: #7842FF; color: white; border-radius: 2px 0 0 2px; padding: 0 .4em; font-size: 85%;',
      'background-color: #fff; color: #222; border-radius: 0 2px 2px 0; padding: 0 .4em; font-size: 85%;',
      log
    );
  }

  /**
   * Message to or from popup.
   *
   * @param {string} message - Message to output.
   * @param {*} log - Extra data to output.
   * @param {boolean|string} receiving - Whether the message is inbound or outbound or `queue` if it's a queue item.
   */
  static popup(message, log = '', receiving = false) {
    console.log(
      `%c${this.receiving(receiving)}%cPopup%c${message}`,
      `${this.color(receiving)} border-radius: 2px 0 0 2px; padding: 1px .4em;`,
      // eslint-disable-next-line max-len
      `background: linear-gradient(to ${receiving ? 'top' : 'bottom'} left, red, #ff8c00); color: white; padding: 1px .4em;`,
      `${this.color(receiving)} border-radius: 0 2px 2px 0; padding: 1px .4em;`,
      log,
    );
  }

  /**
   * Message to or from content.
   *
   * @param {string} message - Message to output.
   * @param {*} log - Extra data to output.
   * @param {boolean|string} receiving - Whether the message is inbound or outbound or `queue` if it's a queue item.
   */
  static content(message, log = '', receiving = false) {
    console.log(
      `%c${this.receiving(receiving)}%cContent%c${message}`,
      `${this.color(receiving)} border-radius: 2px 0 0 2px; padding: 1px .4em;`,
      // eslint-disable-next-line max-len
      `background: linear-gradient(to ${receiving ? 'top' : 'bottom'} left, blue, #1eb9c5); color: white; padding: 1px .4em;`,
      `${this.color(receiving)} border-radius: 0 2px 2px 0; padding: 1px .4em;`,
      log
    );
  }

  /**
   * Message to or from background.
   *
   * @param {string} message - Message to output.
   * @param {*} log - Extra data to output.
   * @param {boolean|string} receiving - Whether the message is inbound or outbound or `queue` if it's a queue item.
   */
  static background(message, log = '', receiving = false) {
    console.log(
      `%c${this.receiving(receiving)}%cBackground%c${message}`,
      `${this.color(receiving)} border-radius: 2px 0 0 2px; padding: 1px .4em;`,
      // eslint-disable-next-line max-len
      `background: linear-gradient(to ${receiving ? 'top' : 'bottom'} left, yellowgreen, #1eb436); color: white; padding: 1px .4em;`,
      `${this.color(receiving)} border-radius: 0 2px 2px 0; padding: 1px .4em;`,
      log
    );
  }

  /**
   * Log a request from or to a connection Port.
   *
   * @param {string} type - Corresponds to function name.
   * @param {Object} request - Request object.
   * @param {boolean|string} receiving - Whether the message is inbound or outbound or `queue` if it's a queue item.
   *
   * @example Logger.request('background', data, true); // Creates a background-style inbound message.
   * @example Logger.request('popup', data); // Creates a popup-style outbound message.
   */
  static request(type, request, receiving = false) {
    const {action, ...rest} = request;
    this[type](action, rest, receiving);
  }

  /**
   * Set inbound, outbound or queue message color.
   *
   * @param {boolean|string} bool - Boolean or `queue`.
   * @returns {string} - CSS.
   */
  static color(bool) {
    if (bool === 'queue') {
      return 'background-color: #666; color: #fff;';
    }
    return bool ? 'background-color: #fff; color: #222;' : 'background-color: #333; color: #fff;';
  }

  /**
   * Whether a message is inbound or outbound. Can also be used to mark a message being queued.
   *
   * @param {boolean|string} bool - Boolean or 'queue'.
   *
   * @returns {string}
   */
  static receiving(bool) {
    if (bool === 'queue') {
      return 'QUEUED';
    }
    return bool ? '▼' : '▲';
  }

  /**
   * Log a message.
   *
   * @param {string} message - Message.
   * @param {string} style - CSS to append to the default.
   * @param {*} log - Extra data to output.
   */
  static createMessage(message, style = '', log = '') {
    console.log(`%c${message}`, `color: white; ${style} border-radius: 2px; padding: 1px .25em;`, log);
  }
}
