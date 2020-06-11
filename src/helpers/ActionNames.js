/**
 * Action names. These are sent to or from the popup and content and are used as (arbitrary) handles to decide which
 * actions to execute on either side.
 *
 * @example
 * // Check connection to content script. Content will respond with `contentConnected`.
 * sendToContent({
 *   action: ActionNames.confirmContentConnection,
 * });
 *
 * @example
 * // Send selector content to the popup.
 * sendToPopup({
 *   action: ActionNames.foundContent,
 *   values: {...},
 * }
 */
export default class ActionNames {
  /**
   * To content. Check connection.
   *
   * @type {String}
   */
  static checkContentConnection = 'checkContentConnection';

  /**
   * To popup. To confirm content is connected. Should be the response to `confirmContentConnection`.
   *
   * @type {String}
   */
  static contentConnected = 'contentConnected';

  /**
   * To popup. To confirm the connection and pass some data to the popup.
   *
   * @type {String}
   */
  static booted = 'booted';

  /**
   * To popup. Contains selected text in `data.selection`.
   *
   * @type {String}
   */
  static createShipmentFromSelection = 'createShipmentFromSelection';

  /**
   * From popup. Delete given field from local storage. Requires data { field: <string> }.
   *
   * @type {String}
   */
  static deleteFields = 'deleteFields';

  /**
   * Received from content and passed to popup. When it has found content on the current page. Content is in
   * `data.values` key.
   *
   * @type {String}
   */
  static foundContent = 'foundContent';

  /**
   * To popup. Contains settings.
   *
   * @type {String}
   */
  static foundSettings = 'foundSettings';

  /**
   * From popup. Request content. Content will respond with `foundContent`.
   */
  static getContent = 'getContent';

  /**
   * From popup. Request general settings. Extension should respond with `foundSettings`.
   *
   * @type {String}
   */
  static getSettings = 'getSettings';

  /**
   * From popup. Request content. Extension should respond with `mappedField` with data: `{field, path, content}`.
   */
  static mapField = 'mapField';

  /**
   * To popup. When user has selected a field to map. Contains data: `{field, path, content}`.
   */
  static mappedField = 'mappedField';

  /**
   * From popup. The popup must send this on boot.
   *
   * @type {String}
   */
  static popupConnected = 'popupConnected';

  /**
   * To popup. Tells the popup the settings it sent with `saveGlobalSettings` were saved correctly.
   *
   * @type {String}
   */
  static savedSettings = 'savedSettings';

  /**
   * From popup. Contains settings.
   *
   * @type {String}
   */
  static saveSettings = 'saveSettings';

  /**
   * To content. Disable the listeners on the content script.
   *
   * @type {String}
   */
  static stopListening = 'stopListening';

  /**
   * From popup, to content. Stop mapping.
   *
   * @type {String}
   */
  static stopMapping = 'stopMapping';

  /**
   * To popup. Fired on a tab switch and contains URL of new tab in `url`.
   *
   * @type {String}
   */
  static switchedTab = 'switchedTab';
}
