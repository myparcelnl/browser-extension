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
    // console.log(selectors);
    // const newArr = {};
    const values = await elementsContent(selectors);

    // let a = {
    //   street: ':nth-child(3) > tbody > :nth-child(1) > :nth-child(2)',
    //   number: ':nth-child(3) > tbody > :nth-child(1) > :nth-child(2)',
    //   company: ':nth-child(3) > tbody > :nth-child(1) > :nth-child(2)',
    //   name: ':nth-child(3) > tbody > :nth-child(1) > :nth-child(2)',
    // };
    // let b = {
    //   street: 'Siriusdreef 66-68, 2132 WT Hoofddorp',
    //   number: 'Siriusdreef 66-68, 2132 WT Hoofddorp',
    //   company: 'Siriusdreef 66-68, 2132 WT Hoofddorp',
    //   name: 'Siriusdreef 66-68, 2132 WT Hoofddorp',
    // };
    //
    // const aifohahfhais = {
    //   street: {
    //     selector: ':nth-child(3) > tbody > :nth-child(1) > :nth-child(2)',
    //     value: 'Siriusdreef 66-68, 2132 WT Hoofddorp'
    //   }
    // }

    // Object.keys(request);
    //
    // for (const selector in request) {
    //   newArr[selector] = {
    //     selector: request[selector],
    //     value: values[selector],
    //   };
    // }
    //
    // const arr = {
    //   ...request,
    //   ...values,
    // };
    // console.log(arr);
    // console.log(values);

    // content.sendToBackground(actionNames.foundSelectorsAndContent, {values});
    content.sendToBackground(actionNames.foundContent, { ...request, values});
  },

  /**
   * Start creating new field mapping
   * @param field
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
