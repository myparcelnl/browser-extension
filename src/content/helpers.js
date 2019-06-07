/* eslint-disable func-names */
import Config from '../content/Config';
import getSelector from 'unique-selector';

/**
 * HTML elements that contain text.
 *
 * @type {string[]}
 */
export const contentTags = [
  'INPUT',
  'SELECT',
  'TEXTAREA',
];

/**
 * Input tag types that contain text.
 *
 * @type {string[]}
 */
export const validInputTypes = [
  'text',
  'number',
];

/**
 * Get the unique query selector/path of the element.
 *
 * @param {EventTarget|HTMLElement} element - Element to get path for.
 *
 * @returns {string}
 */
export function getPath(element) {
  let index = '';

  if (element.classList.contains(Config.wrappedItemClass)) {
    index = 0;
    let node = element;

    for (let i = 0; (node = node.previousSibling); i++) {
      if (!node.classList.contains(Config.wrappedItemClass)) {
        index++;
      }
    }

    index = `@${index}`;
    element = element.parentElement;
  }

  const path = getSelector(element, {
    selectorTypes: ['Class', 'Tag', 'NthChild'],
    excludeRegex: RegExp(Config.classPrefix),
  });

  return path + index;
}

/**
 * Get text parts from element.
 *
 * @param {EventTarget|HTMLElement} element - Element retrieve content from.
 *
 * @returns {Array}
 */
export function getTextParts(element) {
  const childNodes = Array.from(element.childNodes);
  return childNodes.filter((node) => node.nodeName === '#text' && node.nodeValue.trim() !== '');
}

/**
 * Check if element is a textarea or text/number input. If not, check if children of DOM element have text content.
 *
 * @param {EventTarget|HTMLElement|HTMLInputElement|HTMLTextAreaElement} element - Element to check.
 *
 * @returns {boolean} - If the element has text content.
 */
export function hasContent(element) {
  const {childNodes} = element;

  return isTextElement(element) || Array.from(childNodes).some((node) => !!node.nodeValue);
}

/**
 * Check if a given element is an element with text content.
 *
 * @param {EventTarget|HTMLElement|HTMLInputElement|HTMLTextAreaElement} element - Element.
 *
 * @returns {boolean}
 */
export function isTextElement(element) {
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
