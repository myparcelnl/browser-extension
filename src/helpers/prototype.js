/* eslint-disable func-names */
import Config from './Config';
import getSelector from 'unique-selector';

/**
 * Get the unique query selector/path of the element.
 *
 * @return {string}
 */
HTMLElement.prototype.getPath = function() {
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

    // let node2 = selector;
    // while ((node2 = node2.previousSibling) != null) {
    //   console.log(node2);
    //   index++;
    // }
    index = `@${index}`;
    selector = this.parentElement;
  }

  const path = getSelector(selector, {
    excludeRegex: RegExp(Config.classPrefix),
  });

  return path + index;
};

/**
 * Get text parts from element.
 *
 * @return {Array}
 */
Element.prototype.getTextParts = function() {
  const list = [];
  for (let i = 0; i < this.childNodes.length; i++) {
    if (this.childNodes[i].nodeName === '#text' && this.childNodes[i].nodeValue.trim() !== '') {
      list.push(this.childNodes[i]);
    }
  }
  return list;
};

/**
 * Check "depth" of DOM element.
 *
 * @param {number} i - Depth to check for.
 *
 * @return {boolean}
 */
Element.prototype.hasDepth = function(i) {
  if (i < 1) {
    return true;
  }
  for (let i = 0; i < this.childNodes.length; i++) {
    if (this.childNodes[i].childNodes.length > 0 && this.childNodes[i].hasDepth(i - 1)) {
      return true;
    }
  }
  return false;
};

/**
 * Get index of element.
 *
 * @param {Object} e - Event.
 *
 * @return {number}
 */
HTMLCollection.prototype.index = function(e) {
  for (let i = 0; i < this.length; i++) {
    if (this[i] === e) {
      return i;
    }
  }
};

NodeList.prototype.index = HTMLCollection.prototype.index;
