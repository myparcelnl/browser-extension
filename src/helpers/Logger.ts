/* eslint-disable no-console */

import {type AnyMessage} from '../types/index.js';
import {Environment, POPUP, CONTENT, BACKGROUND} from '../constants.js';

type Receiving = boolean | 'queue';

const LOG_COLORS = Object.freeze({
  [POPUP]: '#b44300',
  [CONTENT]: '#0b8cb4',
  [BACKGROUND]: '#37b60c',
});

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
      'background-color: #7842FF; color: white; border-radius: 2px 0 0 2px; padding: 1px .4em',
      'background-color: #fff; color: #222; border-radius: 0 2px 2px 0; padding: 1px .4em',
      log,
    );
  }

  /**
   * Log a request from or to a connection Port.
   *
   * @example Logger.request('background', data, true); // Creates a background-style inbound message.
   * @example Logger.request('popup', data); // Creates a popup-style outbound message.
   */
  public static request(type: 'popup' | 'content' | 'background', message: AnyMessage, receiving: Receiving = false) {
    if (Environment.Production === import.meta.env.MODE) {
      return;
    }

    const {id, action, ...logContext} = message;

    const icon = this.receiving(receiving);
    const typeText = id ? `${type} [${id}]` : type;
    const leftColor = LOG_COLORS[type];
    const rightColor = this.color(receiving);

    console.log(
      `%c${icon} ${typeText}%c${action}`,
      // eslint-disable-next-line max-len
      `border-radius: 2px 0 0 2px; background: ${leftColor}; color: white; padding: 1px .4em;`,
      `${rightColor} border-radius: 0 2px 2px 0; padding: 1px .4em;`,
      logContext,
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

    return bool ? '▼' : '▲';
  }

  /**
   * Log a message.
   */
  private static createMessage(message: string, style = '', log: unknown = '') {
    console.log(`%c${message}`, `color: white; ${style} border-radius: 2px; padding: 1px .25em;`, log);
  }
}
