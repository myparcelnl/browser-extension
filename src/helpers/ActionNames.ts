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
/**
 * @see FromPopupMessageMap
 * @see ToPopupMessageMap
 * @see FromContentMessageMap
 * @see ToContentMessageMap
 */
export enum ActionNames {
  booted = 'booted',
  contentConnected = 'contentConnected',
  createShipmentFromSelection = 'createShipmentFromSelection',
  deleteFields = 'deleteFields',
  foundContent = 'foundContent',
  foundSettings = 'foundSettings',
  getContent = 'getContent',
  getSettings = 'getSettings',
  mapField = 'mapField',
  mappedField = 'mappedField',
  popupConnected = 'popupConnected',
  saveSettings = 'saveSettings',
  savedSettings = 'savedSettings',
  stopListening = 'stopListening',
  stopMapping = 'stopMapping',
}
