import { clickedElement, elementsContent } from './selection';
import ActionNames from '../helpers/ActionNames';
import content from '../content';

/**
 * Actions to run from the content script.
 */
export default class ContentActions {

  /**
   * Get values using previously mapped fields (if any).
   *
   * @param {Object} request - Request object.
   *
   * @return {Promise}
   */
  static async getContent(request) {
    const values = await elementsContent(request.selectors);
    content.sendToBackground(ActionNames.foundContent, {...request, values});
  }

  /**
   * Start creating new field mapping.
   *
   * @param {Object} request - Request object.
   * @return {Promise}
   */
  static async mapField(request) {
    const {field} = request;
    const path = await clickedElement();
    const elementContent = await elementsContent(path);

    const data = {field, path, content: elementContent};
    content.sendToBackground(ActionNames.mappedField, data);
  }
}
