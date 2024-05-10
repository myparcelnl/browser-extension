/* eslint-disable func-names */
import getSelector from 'unique-selector';
import Config from './Config';

/**
 * HTML elements that contain text.
 *
 * @type {string[]}
 */
export const contentTags = ['INPUT', 'SELECT', 'TEXTAREA'];

/**
 * Input tag types that contain text.
 *
 * @type {string[]}
 */
export const validInputTypes = ['text', 'number'];

/**
 * Get the unique query selector/path of the element.
 */
export function getPath(element: HTMLElement) {
  let index: string | number = '';

  if (element.classList.contains(Config.wrappedItemClass)) {
    index = 0;
    let node = element;

    /**
     * Loop through the previous siblings to create an index to use in the selector. Based on how many text elements
     * exist before the clicked element.
     */
    for (let i = 0; (node = node.previousSibling); i++) {
      if (node.classList && node.classList.contains(Config.wrappedItemClass)) {
        index++;
      }
    }

    index = `@${index}`;
    element = element.parentElement;
  }

  const options = {
    excludeRegex: RegExp(Config.classPrefix),
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

  const path = getSelector(element, options);

  return path + index;
}

/**
 * Get text parts from element.
 *
 * @param {EventTarget|HTMLElement} element - Element to retrieve content from.
 */
export function getTextParts(element: Node) {
  const childNodes = Array.from(element.childNodes);
  return childNodes.filter((node) => node.nodeName === '#text' && node.nodeValue?.trim());
}

/**
 * Check if element is a textarea or text/number input. If not, check if children of DOM element have text content.
 */
export function hasContent(element: HTMLElement): boolean {
  const {childNodes} = element;

  return isTextElement(element) || Array.from(childNodes).some((node) => !!node.nodeValue);
}

/**
 * Check if a given element is an element with text content.
 */
export function isTextElement(element: Node): boolean {
  const tag = element.tagName.toUpperCase();

  if (!contentTags.includes(tag)) {
    return false;
  }

  // Don't allow all input types.
  if (tag === 'input') {
    return validInputTypes.includes(element.type);
  }

  return true;
}
