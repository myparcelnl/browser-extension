import {
  type MapFieldMessage,
  type MappedFieldMessage,
  type GetContentMessageToContent,
  type FoundContentMessage,
} from '../types/index.js';
import {ActionNames} from '../helpers/index.js';
import Content from '../Content.js';
import Selection from './Selection.js';

/**
 * Actions to run from the content script.
 */
export default class ContentActions {
  /**
   * Get values using previously mapped fields (if any).
   */
  static getContent(message: GetContentMessageToContent) {
    const {selectors, action, ...requestProperties} = message;
    const values = Selection.getElementsContent(message.selectors ?? {});

    Content.sendToBackground({
      ...requestProperties,
      action: ActionNames.foundContent,
      url: window.location.href,
      values,
    } satisfies FoundContentMessage);
  }

  /**
   * Start creating new field mapping.
   */
  static async mapField(message: MapFieldMessage): Promise<void> {
    const {field, url} = message;
    const path = await Selection.startMapping(message.strings);
    const elementContent = Selection.getSelectorContent(path);

    Content.sendToBackground({
      action: ActionNames.mappedField,
      url,
      field,
      path,
      content: elementContent,
    } satisfies MappedFieldMessage);
  }
}
