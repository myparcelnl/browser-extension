/**
 * Action names.
 */
export default class ActionNames {

  /**
   * To popup. When the background is set up this is sent to the application to confirm the connection.
   * @type {string}
   */
  static backgroundConnected = 'backgroundConnected';

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

  static createShipment = 'createShipment';

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

  static foundElementContent = 'foundElementContent';

  static foundPreset = 'foundPreset';

  static foundSelectorsAndContent = 'foundSelectorsAndContent';

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
   * Request preset data. Requires { preset: <presetName> }
   * @type {string}
   */
  static getPreset = 'getPreset';

  /**
   * From popup. Request general settings. Extension should respond with `foundSettings`.
   * @type {string}
   */
  static getSettings = 'getSettings';

  static getSettingsForURL = 'getSettingsForURL';

  static getStorage = 'getStorage';

  /**
   * From popup. Request content. Extension should respond with `mappedField` with data: `{field, path, content}`.
   */
  static mapField = 'mapField';

  /**
   * To popup. When user has selected a field to map. Contains data: `{field, path, content}`.
   */
  static mappedField = 'mappedField';

  static newShipment = 'newShipment';

  /**
   * From popup. The popup must send this on boot.
   * @type {string}
   */
  static popupConnected = 'popupConnected';

  static saveMappedField = 'saveMappedField';

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

  static switchedTab = 'switchedTab';

  static trackShipment = 'trackShipment';
};
