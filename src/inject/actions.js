import { clickedElement, elementsContent } from './selection';
import actionNames from '../helpers/actions';
import content from '../inject';
import log from '../helpers/log';

export default {

  /**
   * Get values using previously mapped fields (if any)
   * @param request
   * @returns {Promise<void>}
   */
  async getElementsContent(request) {
    const {selectors} = request;
    log.info('inject: getElementsContent');
    const values = await elementsContent(selectors);
    content.sendToBackground(actionNames.foundContent, { ...request, values});
  },

  /**
   * Start creating new field mapping
   * @param request
   * @returns {Promise<void>}
   */
  async mapField(request) {
    const {url, field} = request;
    const path = await clickedElement();
    const elementContent = await elementsContent(path);

    const data = { field, url, path, content: elementContent };
    content.sendToBackground(actionNames.mappedField, data);
  },
};
