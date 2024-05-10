/* eslint-disable @typescript-eslint/naming-convention */
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
export enum ActionNames {
  /**
   * To content. Check connection.
   */
  checkContentConnection = 'checkContentConnection',

  /**
   * To popup. To confirm content is connected. Should be the response to `confirmContentConnection`.
   */
  contentConnected = 'contentConnected',

  /**
   * To popup. To confirm the connection and pass some data to the popup.
   */
  booted = 'booted',

  /**
   * To popup. Contains selected text in `data.selection`.
   */
  createShipmentFromSelection = 'createShipmentFromSelection',

  /**
   * From popup. Delete given field from local storage. Requires data { field: <string> }.
   */
  deleteFields = 'deleteFields',

  /**
   * Received from content and passed to popup. When it has found content on the current page. Content is in
   * `data.values` key.
   */
  foundContent = 'foundContent',

  /**
   * To popup. Contains settings.
   */
  foundSettings = 'foundSettings',

  /**
   * From popup. Request content. Content will respond with `foundContent`.
   */
  getContent = 'getContent',

  /**
   * From popup. Request general settings. Extension should respond with `foundSettings`.
   */
  getSettings = 'getSettings',

  /**
   * From popup. Request content. Extension should respond with `mappedField` with data: `{field, path, content}`.
   */
  mapField = 'mapField',

  /**
   * To popup. When user has selected a field to map. Contains data: `{field, path, content}`.
   */
  mappedField = 'mappedField',

  /**
   * From popup. The popup must send this on boot.
   */
  popupConnected = 'popupConnected',

  /**
   * To popup. Tells the popup the settings it sent with `saveGlobalSettings` were saved correctly.
   */
  savedSettings = 'savedSettings',

  /**
   * From popup. Contains settings.
   */
  saveSettings = 'saveSettings',

  /**
   * To content. Disable the listeners on the content script.
   */
  stopListening = 'stopListening',

  /**
   * From popup, to content. Stop mapping.
   */
  stopMapping = 'stopMapping',

  /**
   * To popup. Fired on a tab switch and contains URL of new tab in `url`.
   */
  switchedTab = 'switchedTab',
}
