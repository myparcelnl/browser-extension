import { clickedElement, elementsContent } from './selection';
import actionNames from '../helpers/actions';
import content from '../inject';
import log from '../helpers/log';

export default {

  /**
   * Get values using previously mapped fields (if any)
   * @param selectors
   * @returns {Promise<void>}
   */
  async getElementsContent(selectors) {
    const values = await elementsContent(selectors);

    if (values === {}) {
      log.error('no data found');
    } else {
      log.success('got data:');
      console.log(values);
    }

    // content.sendToBackground(actionNames.foundElementContent, {values});
  },

  /**
   * Start creating new field mapping
   * @param field
   * @returns {Promise<void>}
   */
  async mapField(data) {
    const element = await clickedElement();
    console.log(data);
    console.log(element);
    content.sendToBackground(actionNames.mappedField, Object.assign(data, element));
  },
};
