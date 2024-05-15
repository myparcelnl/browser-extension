import {type MakeRequired} from '@myparcel/ts-utils';
import {type ActionNames} from '../helpers';
import {type StoredExtensionSettings} from './generic.types';

export interface BaseMessageData<Action extends ActionNames = ActionNames> {
  action: Action;
}

export interface MessageData<Action extends ActionNames = ActionNames> extends BaseMessageData<Action> {
  /**
   * Key used by crx in dev mode
   */
  data?: string;

  /**
   * Key used by crx in dev mode
   */
  type?: string;

  preset?: Record<string, string>;
  url?: string;

  [key: string]: unknown;
}

export interface MessageDataWithUrl<Action extends ActionNames = ActionNames> extends MessageData<Action> {
  url: string;
}

export interface MessageDataWithPreset<Action extends ActionNames = ActionNames> extends MessageData<Action> {
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
export interface MapFieldMessageToContent extends MakeRequired<MessageData<ActionNames.mapField>, 'url'> {
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

export type StopMappingMessage = MessageData<ActionNames.stopMapping>;

export type SavedSettingsMessage = MessageData<ActionNames.savedSettings>;

interface ToContentMessageMap {
  [ActionNames.getContent]: GetContentMessageToContent;
  [ActionNames.mapField]: MapFieldMessageToContent;
  [ActionNames.stopMapping]: StopMappingMessage;
  [ActionNames.contentConnected]: ContentConnectedMessage;
}

interface FromContentMessageMap {
  [ActionNames.mappedField]: MappedFieldMessage;
}

interface ToPopupMessageMap {
  [ActionNames.mappedField]: MappedFieldMessage;
  [ActionNames.foundSettings]: FoundSettingsMessage;
  [ActionNames.savedSettings]: SavedSettingsMessage;
  [ActionNames.getSettings]: GetSettingsMessage;
  [ActionNames.contentConnected]: ContentConnectedMessage;
}

interface FromPopupMessageMap {
  [ActionNames.deleteFields]: DeleteFieldsMessage;
  [ActionNames.getContent]: GetContentMessageFromPopup;
  [ActionNames.mapField]: MapFieldMessageToContent;
}

export type MessageToPopup<Action extends ActionNames = ActionNames> = Action extends keyof ToPopupMessageMap
  ? ToPopupMessageMap[Action]
  : MessageData<Action>;

export type MessageFromPopup<Action extends ActionNames = ActionNames> = Action extends keyof FromPopupMessageMap
  ? FromPopupMessageMap[Action]
  : MessageData<Action>;

export type MessageToContent<Action extends ActionNames = ActionNames> = Action extends keyof ToContentMessageMap
  ? ToContentMessageMap[Action]
  : MessageData<Action>;

export type MessageFromContent<Action extends ActionNames = ActionNames> = Action extends keyof FromContentMessageMap
  ? FromContentMessageMap[Action]
  : MessageData<Action>;

export type AnyMessage<Action extends ActionNames = ActionNames> =
  | MessageToPopup<Action>
  | MessageFromPopup<Action>
  | MessageToContent<Action>
  | MessageFromContent<Action>;
