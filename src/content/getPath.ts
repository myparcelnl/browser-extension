/* eslint-disable func-names */
import getSelector, {type GetSelectorOptions} from 'unique-selector';
import {CLASS_PREFIX, WRAPPED_ITEM_CLASS} from './constants.js';

/**
 * Get the unique query selector/path of the element.
 */
export const getPath = (element: HTMLElement): string => {
  let resolvedElement: HTMLElement | null = element;
  let index: string | number = '';

  if (resolvedElement.classList.contains(WRAPPED_ITEM_CLASS)) {
    index = 0;
    let node: HTMLElement | null = resolvedElement;

    /**
     * Loop through the previous siblings to create an index to use in the selector. Based on how many text elements
     * exist before the clicked element.
     */
    for (let i = 0; (node = node.previousSibling as HTMLElement | null); i++) {
      if (!node.classList?.contains(WRAPPED_ITEM_CLASS)) {
        continue;
      }

      index++;
    }

    index = `@${index}`;
    resolvedElement = resolvedElement.parentElement;
  }

  const options: GetSelectorOptions = {
    excludeRegex: RegExp(CLASS_PREFIX),
  };

  /*
   * Hack to avoid running mapping breaking with Magento1's id "page:main-container" on a div.
   *
   * Sets `options.selectorTypes` explicitly to generate unique selector without using ids.
   * This has to be done because unique-selector uses `document.querySelector`, which doesn't work with selectors with
   *  illegal characters without escaping.
   *
   * This hack is not needed anymore when the package supports escaping selectors that don't follow standard CSS syntax.
   * See the link below for explanation.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector#Escaping_special_characters
   */
  if (document.getElementById('page:main-container')) {
    options.selectorTypes = ['Class', 'Tag', 'NthChild'];
  }

  const path = getSelector(resolvedElement!, options);

  return path + index;
};
