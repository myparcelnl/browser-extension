import { clickedElement, elementsContent } from './selection';
import actionNames from '../helpers/actionNames';
import content from '../inject';
import log from '../helpers/log';

export default {

  /**
   * Get values using previously mapped fields (if any).
   *
   * @param {Object} request - Request object.
   * * @return {Promise}.
   */
  async getContent(request) {
    const {selectors} = request;
    const values = await elementsContent(selectors);
    console.log('elements content:', { ...request, values});
    content.sendToBackground(actionNames.foundContent, { ...request, values});
  },

  /**
   * Start creating new field mapping.
   *
   * @param {Object} request - Request object.
   * @return {Promise}
   */
  async mapField(request) {
    const {url, field} = request;
    const path = await clickedElement();
    const elementContent = await elementsContent(path);

    const data = { field, url, path, content: elementContent };
    content.sendToBackground(actionNames.mappedField, data);
  },
};
