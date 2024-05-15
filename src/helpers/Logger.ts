/* eslint-disable no-console */

import {type AnyMessage} from '../types/index.js';
import {Environment} from '../constants.js';

type Receiving = boolean | 'queue';

/**
 * Debug logging file. This is only present in development and testing environments.
 */
export default class Logger {
  /**
   * General success message.
   */
  public static success(message: string, log: unknown = '') {
    if (Environment.Production === import.meta.env.MODE) {
      return;
    }

    this.createMessage(message, 'background-color: #23b237;', log);
  }

  /**
   * General info message.
   */
  public static info(message: string, log: unknown = '') {
    if (Environment.Production === import.meta.env.MODE) {
      return;
    }

    this.createMessage(message, 'background-color: #34b7d4;', log);
  }

  /**
   * General warning message.
   */
  public static warning(message: string, log: unknown = '') {
    if (Environment.Production === import.meta.env.MODE) {
      return;
    }

    this.createMessage(message, 'background-color: #d18800;', log);
  }

  /**
   * General error message.
   */
  public static error(message: string, log: unknown = '') {
    if (Environment.Production === import.meta.env.MODE) {
      return;
    }

    this.createMessage(message, 'background-color: #d45839;', log);
  }

  /**
   * Event message.
   */
  public static event(message: string, log: unknown = '') {
    if (Environment.Production === import.meta.env.MODE) {
      return;
    }

    console.log(
      `%cEvent%c${message}`,
      'background-color: #7842FF; color: white; border-radius: 2px 0 0 2px; padding: 0 .4em; font-size: 85%;',
      'background-color: #fff; color: #222; border-radius: 0 2px 2px 0; padding: 0 .4em; font-size: 85%;',
      log,
    );
  }

  /**
   * Log a request from or to a connection Port.
   *
   * @example Logger.request('serviceWorker', data, true); // Creates a background-style inbound message.
   * @example Logger.request('popup', data); // Creates a popup-style outbound message.
   */
  public static request(type: 'popup' | 'content' | 'background', request: AnyMessage, receiving: Receiving = false) {
    if (Environment.Production === import.meta.env.MODE) {
      return;
    }

    const {action, ...rest} = request;

    this[type](action as string, rest, receiving);
  }

  // noinspection JSUnusedLocalSymbols
  /**
   * Message to or from popup.
   */
  private static popup(message: string, log: unknown, receiving: Receiving) {
    console.log(
      `%c${this.receiving(receiving)} popup%c${message}`,
      // eslint-disable-next-line max-len
      `border-radius: 2px 0 0 2px; background: linear-gradient(to ${
        receiving ? 'top' : 'bottom'
      } left, red, #ff8c00); color: white; padding: 1px .4em;`,
      `${this.color(receiving)} border-radius: 0 2px 2px 0; padding: 1px .4em;`,
      log,
    );
  }

  // noinspection JSUnusedLocalSymbols
  /**
   * Message to or from content.
   */
  private static content(message: string, log: unknown, receiving: Receiving) {
    console.log(
      `%c${this.receiving(receiving)} content%c${message}`,
      // eslint-disable-next-line max-len
      `border-radius: 2px 0 0 2px; background: linear-gradient(to ${
        receiving ? 'top' : 'bottom'
      } left, blue, #1eb9c5); color: white; padding: 1px .4em;`,
      `${this.color(receiving)} border-radius: 0 2px 2px 0; padding: 1px .4em;`,
      log,
    );
  }

  // noinspection JSUnusedLocalSymbols
  /**
   * Message to or from background.
   */
  private static background(message: string, log: unknown, receiving: Receiving) {
    console.log(
      `%c${this.receiving(receiving)} background%c${message}`,
      `border-radius: 2px 0 0 2px; background: linear-gradient(to ${
        receiving ? 'top' : 'bottom'
      } left, yellowgreen, #1eb436); color: white; padding: 1px .4em;`,
      `${this.color(receiving)} border-radius: 0 2px 2px 0; padding: 1px .4em;`,
      log,
    );
  }

  /**
   * Set inbound, outbound or queue message color.
   */
  private static color(bool: boolean | 'queue'): string {
    if (bool === 'queue') {
      return 'background-color: #666; color: #fff;';
    }

    return bool ? 'background-color: #fff; color: #222;' : 'background-color: #333; color: #fff;';
  }

  /**
   * Whether a message is inbound or outbound. Can also be used to mark a message being queued.
   *
   */
  private static receiving(bool: boolean | 'queue'): string {
    if (bool === 'queue') {
      return 'QUEUED';
    }

    return bool ? 'from' : 'to';
  }

  /**
   * Log a message.
   */
  private static createMessage(message: string, style = '', log: unknown = '') {
    console.log(`%c${message}`, `color: white; ${style} border-radius: 2px; padding: 1px .25em;`, log);
  }
}
