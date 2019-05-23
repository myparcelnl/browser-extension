/* eslint-disable func-names */
import Config from '../content/Config';
import getSelector from 'unique-selector';

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
  const list = [];

  element.childNodes.forEach((node) => {
    if (node.nodeName === '#text' && node.nodeValue.trim() !== '') {
      list.push(node);
    }
  });

  return list;
}

/**
 * Check if children of DOM element have text content.
 *
 * @param {EventTarget|HTMLElement} element - Element to check.
 *
 * @returns {boolean} - If a childNode of the element has text content.
 */
export function hasContent(element) {
  for (let i = 0; i < element.childNodes.length; i++) {
    if (element.childNodes[i].nodeValue) {
      return true;
    }
  }
}
