import { clickedElement, elementsContent } from './selection';
import actionNames from '../helpers/actions';
import content from '../inject';

export default {

  /**
   * Get values using previously mapped fields (if any)
   * @param selectors
   * @returns {Promise<void>}
   */
  async getElementsContent(selectors) {
    const values = await elementsContent(selectors);
    content.sendToBackground(actionNames.foundElementContent, {values});
  },

  /**
   * Start creating new field mapping
   * @param field
   * @returns {Promise<void>}
   */
  async mapField(data) {
    const path = await clickedElement();
    content.sendToBackground(actionNames.mappedField, Object.assign(data, {path}));
  },
};
