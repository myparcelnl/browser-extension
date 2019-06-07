import ActionNames from '../helpers/ActionNames';
import Content from '../Content';
import Selection from './Selection';

/**
 * Actions to run from the content script.
 */
export default class ContentActions {

  /**
   * Get values using previously mapped fields (if any).
   *
   * @param {Object} request - Request object.
   *
   * @returns {Promise}
   */
  static async getContent(request) {
    const values = await Selection.getElementsContent(request.selectors);
    Content.sendToBackground(ActionNames.foundContent, {origin: window.location.host, values});
  }

  /**
   * Start creating new field mapping.
   *
   * @param {Object} request - Request object.
   * @param {string} request.field - Field key.
   * @param {Object} request.strings - Object with translated strings.
   * @param {string} request.url - Full URL.
   *
   * @returns {Promise}
   */
  static async mapField(request) {
    const {field, url} = request;
    const path = await Selection.startMapping(request.strings);
    const elementContent = await Selection.getElementsContent(path);

    const data = {url, field, path, content: elementContent};
    Content.sendToBackground(ActionNames.mappedField, data);
  }
}
