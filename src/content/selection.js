/* eslint-disable func-names */
import '../helpers/prototype';
import Config from '../helpers/Config';
import log from '../helpers/log';

const listeners = {};

export const clickedElement = () => {
  return new Promise((resolve) => {
    selection.createTooltip();
    selection.startMapping(resolve);
  });
};

/**
 * Get elements content by selector key value pairs.
 *
 * @param {Object} selectors - Selectors.
 *
 * @return {Object|undefined}
 */
export const elementsContent = (selectors) => {
  if (!selectors) {
    return;
  }

  const values = {};

  if (typeof selectors === 'string') {
    return selection.getSelectorValue(selectors);
  }

  for (const key in selectors) {
    if (selectors.hasOwnProperty(key)) {
      values[key] = selection.getSelectorValue(selectors[key]);
    }
  }

  return values;
};

export const selection = {

  /**
   * Add event listeners for mapping field.
   *
   * @param {Function} resolve - Resolve function.
   *
   * @return {undefined}
   */
  startMapping(resolve) {
    // remove existing listeners (if any)
    this.stopMapping();
    log.info('Start mapping');

    listeners.click = (event) => selection.handleClick(event, resolve);
    listeners.keyup = (event) => selection.handleKeyup(event, resolve);
    listeners.mouseMove = (event) => selection.handleMouseMove(event, resolve);

    document.addEventListener('click', listeners.click);
    document.addEventListener('keyup', listeners.keyup);
    document.addEventListener('mousemove', listeners.mouseMove);
  },

  /**
   * Remove event listeners for mapping field.
   */
  stopMapping() {
    log.info('Stop mapping');

    document.removeEventListener('click', listeners.click);
    document.removeEventListener('keyup', listeners.keyup);
    document.removeEventListener('mousemove', listeners.mouseMove);

    this.removeSelectionClass();
    // this.removeTooltip();
    this.hideToolbar();
    this.unwrap();
  },

  /**
   * Keyup event listener to check for escape button press.
   *
   * @param {event} event - Keyup event.
   * @param {Function} resolve - Resolve function.
   */
  handleKeyup(event, resolve) {
    // Check if escape is pressed
    if (event.keyCode === 27) {
      this.stopMapping();
      resolve(null);
    }
  },

  /**
   * Click event listener that gets content and path of clicked element.
   *
   * @param event
   * @param resolve
   */
  handleClick(event, resolve) {
    event.stopPropagation();
    event.preventDefault();
    const element = event.target;
    const path = element.getPath();
    this.stopMapping();
    resolve(path);
  },

  handleMouseMove(event) {
    this.addSelectionClass(event);
    this.positionTooltip(event);
  },

  addSelectionClass(event) {
    if (event.target.hasDepth(3)) {
      return false;
    }
    event.stopPropagation();
    const element = event.target;

    this.removeSelectionClass();

    element.classList.add(Config.selectionClass);

    if (element.innerHTML !== element.nodeValue) {
      this.wrap(element.getTextParts());
    }
  },

  positionTooltip(event) {
    const tooltip = document.getElementById(Config.tooltipClass);
    if (!tooltip) {
      return;
    }

    let {pageY: y, pageX: x} = event;
    const {clientY, clientX, target} = event;

    if (x === null && clientX !== null) {
      const document = (target && target.ownerDocument) || document;
      const doc = document.documentElement;
      const {body} = document;

      x = clientX + ((doc && doc.scrollLeft) || (body && body.scrollLeft) || 0) - ((doc && doc.clientLeft) || (body && body.clientLeft) || 0);
      y = clientY + ((doc && doc.scrollTop) || (body && body.scrollTop) || 0) - ((doc && doc.clientTop) || (body && body.clientTop) || 0);
    }

    x = x + 10;

    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;
  },

  removeTooltip() {
    if (document.getElementsByClassName(Config.tooltipClass).length) {
      for (const element of document.getElementsByClassName(Config.tooltipClass)) {
        element.remove();
      }
    }
  },

  showToolbar(name, text) {
    if (!document.getElementById(Config.tooltipClass)) {
      this.createToolbar();
    }

    const tooltip = document.getElementById(Config.tooltipClass);

    tooltip.style.display = 'block';
    tooltip.querySelector('span').innerHTML = text;
    tooltip.querySelector('em').innerHTML = name;
  },

  createTooltip() {
    let tooltip = document.getElementById(Config.tooltipClass);
    if (tooltip) {
      tooltip.parentElement.removeChild(tooltip);
    }

    tooltip = document.createElement('div');
    tooltip.setAttribute('id', Config.tooltipClass);
    tooltip.innerHTML = '<div class="arrow"></div><div class="text"><span></span><em></em>or<em class="esc">esc</em></div>';
    document.body.appendChild(tooltip);
  },

  hideToolbar() {
    const tooltip = document.getElementById(Config.tooltipClass);
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  },

  removeSelectionClass() {
    if (document.getElementsByClassName(Config.selectionClass).length) {
      for (const element of document.getElementsByClassName(Config.selectionClass)) {
        element.classList.remove(Config.selectionClass);
      }
    }
  },

  wrap(array) {
    for (let i = 0; i < array.length; i++) {
      const e = array[i];
      if (e.parentElement.childNodes.length > 1 && e.textContent.trim() !== '') {
        const span = document.createElement('span');
        span.innerHTML = e.textContent;
        span.classList.add(Config.wrappedItemClass);
        e.parentNode.insertBefore(span, e);
        e.parentNode.removeChild(e);
      }
    }
  },

  unwrap() {
    const array = document.getElementsByClassName(Config.wrappedItemClass);
    if (array) {
      for (let i = array.length - 1; i >= 0; i--) {
        const e = array[i];
        const txt = document.createTextNode(e.textContent);
        e.parentNode.insertBefore(txt, e);
        e.parentNode.removeChild(e);
      }
    }
  },

  getSelectorValue(selector) {
    if (!selector) {
      return;
    }

    let value = '';
    const parts = selector.split('@');
    const selectorPath = parts[0];
    const selectorIndex = parts[1];
    const path = document.querySelectorAll(selectorPath);

    if (path.length) {
      const el = path[0];

      const tag = (el && el.tagName) ? el.tagName.toLowerCase() : '';

      if (el && el.value && selectorIndex && tag === 'textarea') {
        value = el.value.split(/\n/g)[selectorIndex.trim()];
      } else if (selectorIndex) {
        const element = el.getTextParts()[selectorIndex.trim()];
        if (element) {
          value = element.textContent;
        }
      } else if (el) {
        value = (['input', 'select', 'textarea'].indexOf(tag) !== -1) ? el.value : el.textContent;
      }
    }
    return value.trim();
  },
};
