/**
 * Action names. These are sent to or from the popup and content and are used as (arbitrary) handles to decide which
 * actions to execute on either side.
 *
 * @example
 * // Check connection to content script. Content will respond with `contentConnected`.
 * sendToContent({
 *   action: ActionNames.checkContentConnection,
 * });
 *
 * @example
 * // Send selector content to the popup.
 * sendToPopup({
 *   action: ActionNames.foundContent,
 *   values: {...},
 *   preset: {...},
 * }
 */
export default class ActionNames {

  /**
   * To content. Check connection.
   * @type {string}
   */
  static checkContentConnection = 'checkContentConnection';

  /**
   * From content. To confirm content is connected. Should be the response to `checkContentConnection`.
   * @type {string}
   */
  static contentConnected = 'contentConnected';

  /**
   * To popup. Contains selected text in `data.selection`.
   * @type {string}
   */
  static createShipmentFromSelection = 'createShipmentFromSelection';

  /**
   * From popup. Delete given field from local storage. Requires data { field: <string> }
   * @type {string}
   */
  static deleteFields = 'deleteFields';

  /**
   * Received from content and passed to popup. When it has found content on the current page. Content is in
   * `data.values` key.
   * @type {string}
   */
  static foundContent = 'foundContent';

  /**
   * To popup. Contains settings.
   * @type {string}
   */
  static foundSettings = 'foundSettings';

  /**
   * From popup. Request content. Content will respond with `foundContent`.
   */
  static getContent = 'getContent';

  /**
   * From popup. Request general settings. Extension should respond with `foundSettings`.
   * @type {string}
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
   * @type {string}
   */
  static popupConnected = 'popupConnected';

  /**
   * To popup. Tells the popup the settings it sent with `saveSettings` were saved correctly.
   * @type {string}
   */
  static savedSettings = 'savedSettings';

  /**
   * From popup. Contains settings.
   * @type {string}
   */
  static saveSettings = 'saveSettings';

  /**
   * To content. Disable the listeners on the content script.
   * @type {string}
   */
  static stopListening = 'stopListening';

  /**
   * To popup. Fired on a tab switch and contains URL of new tab in `url`.
   * @type {string}
   */
  static switchedTab = 'switchedTab';
};
