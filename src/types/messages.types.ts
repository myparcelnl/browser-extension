import {type MakeRequired} from '@myparcel/ts-utils';
import {type ActionNames} from '../helpers/index.js';
import {type StoredExtensionSettings} from './generic.types.js';

export interface MessageData<Action extends ActionNames = ActionNames> {
  action: Action;

  url?: string;

  /**
   * Key used by crx in dev mode
   */
  data?: string;

  /**
   * Key used by crx in dev mode
   */
  type?: string;
}

export interface MessageDataWithUrl<Action extends ActionNames = ActionNames> extends MessageData<Action> {
  url: string;
}

export interface MessageDataWithPreset<Action extends ActionNames = ActionNames> extends MessageDataWithUrl<Action> {
  presetChosenManually?: boolean;
  presetName: string;
  resetPresetSettings?: boolean;
  selectors?: Record<string, string>;
}

export interface MessageGetContentFromPopup<Action extends ActionNames = ActionNames> extends MessageData<Action> {
  preset: Record<string, string>;
  presetChosenManually: boolean;
  presetName: string;
  resetPresetSettings: boolean;
  url: string;
}

export interface MessageDataWithPresetAndFields<Action extends ActionNames = ActionNames>
  extends MessageDataWithPreset<Action> {
  fields: string[];
}

/**
 * Popup to background: getContent
 */
export interface GetContentMessageFromPopup<Action extends ActionNames = ActionNames>
  extends MessageDataWithUrl<Action> {
  preset: Record<string, string>;
  presetChosenManually: boolean;
  presetName: string;
  resetPresetSettings: boolean;
}

/**
 * Popup to content: getContent
 */
export interface GetContentMessageToContent<Action extends ActionNames = ActionNames>
  extends GetContentMessageFromPopup<Action> {
  selectors: Record<string, string>;
}

/**
 * Background to content: mapField
 */
export interface MapFieldMessage extends MakeRequired<MessageData<ActionNames.mapField>, 'url'> {
  field: string;
  strings: Record<string, string>;
}

/**
 * Content to background: mappedField
 */
export interface MappedFieldMessage extends MakeRequired<MessageData<ActionNames.mappedField>, 'url'> {
  /**
   * Field content.
   */
  content: string | undefined;

  /**
   * Field name.
   */
  field: string;

  /**
   * CSS selector path to the element.
   */
  path: string | null;
}

export interface DeleteFieldsMessage extends MessageDataWithPresetAndFields<ActionNames.deleteFields> {
  fields: string[];
  url: string;
}

export interface FoundSettingsMessage extends MessageData<ActionNames.foundSettings> {
  settings: StoredExtensionSettings;
}

export interface GetSettingsMessage extends MessageData<ActionNames.getSettings> {
  settings: StoredExtensionSettings;
}

export interface FoundContentMessage extends GetContentMessageFromPopup<ActionNames.foundContent> {
  values: Record<string, string>;
}

export interface ContentConnectedMessage extends MessageData<ActionNames.contentConnected> {
  settings: null | StoredExtensionSettings;
}

export interface SaveSettingsMessage extends MessageData<ActionNames.saveSettings> {
  settings: StoredExtensionSettings;
}

export type SavedSettingsMessage = MessageData<ActionNames.savedSettings>;

export type StopMappingMessage = MessageData<ActionNames.stopMapping>;

export interface BootedMessageData extends MessageData<ActionNames.booted> {
  version: string;
}

export interface ShipmentFromSelectionMessageData extends MessageData<ActionNames.createShipmentFromSelection> {
  selection: string;
}

interface ToPopupMessageMap {
  [ActionNames.booted]: BootedMessageData;
  [ActionNames.createShipmentFromSelection]: ShipmentFromSelectionMessageData;
  [ActionNames.contentConnected]: ContentConnectedMessage;
  [ActionNames.foundContent]: FoundContentMessage;
  [ActionNames.foundSettings]: FoundSettingsMessage;
  [ActionNames.getSettings]: GetSettingsMessage;
  [ActionNames.mappedField]: MappedFieldMessage;
  [ActionNames.savedSettings]: SavedSettingsMessage;
  [ActionNames.switchedTab]: MessageData<ActionNames.switchedTab>;
}

export type PopupConnectedMessageData = MessageDataWithUrl<ActionNames.popupConnected>;

interface FromPopupMessageMap {
  [ActionNames.checkContentConnection]: MessageData<ActionNames.checkContentConnection>;
  [ActionNames.deleteFields]: DeleteFieldsMessage;
  [ActionNames.getContent]: GetContentMessageFromPopup;
  [ActionNames.getSettings]: MessageData<ActionNames.getSettings>;
  [ActionNames.mapField]: MapFieldMessage;
  [ActionNames.popupConnected]: PopupConnectedMessageData;
  [ActionNames.saveSettings]: SaveSettingsMessage;
  [ActionNames.stopMapping]: MessageData<ActionNames.stopMapping>;
}

interface ToContentMessageMap {
  [ActionNames.checkContentConnection]: MessageData<ActionNames.checkContentConnection>;
  [ActionNames.contentConnected]: ContentConnectedMessage;
  [ActionNames.getContent]: GetContentMessageToContent;
  [ActionNames.mapField]: MapFieldMessage;
  [ActionNames.stopListening]: MessageData<ActionNames.stopListening>;
  [ActionNames.stopMapping]: StopMappingMessage;
}

interface FromContentMessageMap {
  [ActionNames.contentConnected]: ContentConnectedMessage;
  [ActionNames.deleteFields]: MessageData<ActionNames.deleteFields>;
  [ActionNames.foundContent]: FoundContentMessage;
  [ActionNames.mappedField]: MappedFieldMessage;
}

export type MessageToPopup<Action extends ActionNames = ActionNames> = Action extends keyof ToPopupMessageMap
  ? ToPopupMessageMap[Action]
  : never;

export type MessageFromPopup<Action extends ActionNames = ActionNames> = Action extends keyof FromPopupMessageMap
  ? FromPopupMessageMap[Action]
  : never;

export type MessageToContent<Action extends ActionNames = ActionNames> = Action extends keyof ToContentMessageMap
  ? ToContentMessageMap[Action]
  : never;

export type MessageFromContent<Action extends ActionNames = ActionNames> = Action extends keyof FromContentMessageMap
  ? FromContentMessageMap[Action]
  : never;

export type AnyMessage<Action extends ActionNames = ActionNames> =
  | MessageToPopup<Action>
  | MessageFromPopup<Action>
  | MessageToContent<Action>
  | MessageFromContent<Action>;
