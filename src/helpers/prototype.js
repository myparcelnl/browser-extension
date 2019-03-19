import config from './config';
import getSelector from 'unique-selector';

HTMLElement.prototype.getPath = function() {
  let selector = this;
  let index = '';

  if (selector.classList.contains(config.wrappedItemClass)) {
    index = 0;
    let node = selector;

    for (let i = 0; (node = node.previousSibling); i++) {
      if (!node.classList.contains(config.wrappedItemClass)) {
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
    excludeRegex: RegExp(config.classPrefix),
  });

  return path + index;
};

Element.prototype.getTextParts = function() {
  const list = [];
  for (let i = 0; i < this.childNodes.length; i++) {
    if (this.childNodes[i].nodeName === '#text' && this.childNodes[i].nodeValue.trim() !== '') {
      list.push(this.childNodes[i]);
    }
  }
  return list;
};

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

HTMLCollection.prototype.index = function(e) {
  for (let i = 0; i < this.length; i++) {
    if (this[i] === e) {
      return i;
    }
  }
};

NodeList.prototype.index = HTMLCollection.prototype.index;
