/* eslint-disable func-names */
import Config from '../content/Config';
import getSelector from 'unique-selector';

/**
 * Get the unique query selector/path of the element.
 *
 * @returns {string}
 */
EventTarget.prototype.getPath = function() {
  let selector = this;
  let index = '';

  if (selector.classList.contains(Config.wrappedItemClass)) {
    index = 0;
    let node = selector;

    for (let i = 0; (node = node.previousSibling); i++) {
      if (!node.classList.contains(Config.wrappedItemClass)) {
        index++;
      }
    }

    index = `@${index}`;
    selector = this.parentElement;
  }

  const path = getSelector(selector, {
    selectorTypes: ['Class', 'Tag', 'NthChild'],
    excludeRegex: RegExp(Config.classPrefix),
  });

  return path + index;
};

/**
 * Get text parts from element.
 *
 * @returns {Array}
 */
Element.prototype.getTextParts = function() {
  const list = [];

  this.childNodes.forEach((node) => {
    if (node.nodeName === '#text' && node.nodeValue.trim() !== '') {
      list.push(node);
    }
  });

  return list;
};

/**
 * Check "depth" of DOM element.
 *
 * @param {number} depth - Depth to check for.
 *
 * @returns {boolean}
 */
EventTarget.prototype.hasDepth = function(depth) {
  if (depth < 1) {
    return true;
  }

  this.childNodes.forEach((node) => {
    if (node.childNodes.length > 0 && node.hasDepth(depth - 1)) {
      return true;
    }
  });

  return false;
};
