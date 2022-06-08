import ActionNames from '../helpers/ActionNames';
import Selection from './Selection';

/**
 * Actions to run from the content script.
 */
export default class ContentActions {
  /**
   * Get values using previously mapped fields (if any).
   *
   * @param Content
   * @param {Object} request - Request object.
   * @returns {Promise<*>}
   */
  static async getContent(request) {
    // import here to prevent circular references
    const Content = import('../Content').then((module) => module.default);
    const {selectors, action, ...requestProperties} = request;
    const values = await Selection.getElementsContent(request.selectors);

    Content.sendToBackground(ActionNames.foundContent, {
      ...requestProperties,
      origin: window.location.host,
      values,
    });
  }

  /**
   * Start creating new field mapping.
   *
   * @param {Object} request - Request object.
   * @param {string} request.field - Field key.
   * @param {Object} request.strings - Object with translated strings.
   * @param Content
   * @param {string} request.url - Full URL.
   * @returns {Promise<*>}
   */
  static async mapField(request) {
    // import here to prevent circular references
    const Content = import('../Content').then((module) => module.default);
    const {field, url} = request;
    const path = await Selection.startMapping(request.strings);
    const elementContent = await Selection.getElementsContent(path);

    const data = {url, field, path, content: elementContent};
    Content.sendToBackground(ActionNames.mappedField, data);
  }
}
