/* eslint-disable func-names */
import '../helpers/prototype';
import Config from '../helpers/Config';
import Logger from '../helpers/Logger'; // strip-log

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
 * @returns {Object|undefined}
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
   * @returns {undefined}
   */
  startMapping(resolve) {
    // remove existing listeners (if any)
    this.stopMapping();
    Logger.info('Start mapping');

    this.showTooltip();

    listeners.click = (event) => selection.handleClick(event, resolve);
    listeners.keyup = (event) => selection.handleKeyup(event, resolve);
    listeners.mouseMove = (event) => selection.handleMouseMove(event);

    document.addEventListener('click', listeners.click);
    document.addEventListener('keyup', listeners.keyup);
    document.addEventListener('mousemove', listeners.mouseMove);
  },

  /**
   * Remove event listeners for mapping field.
   */
  stopMapping() {
    Logger.info('Stop mapping');

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
   * @param {KeyboardEvent} event - Keyup event.
   * @param {Function} resolve - Resolve function.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
   */
  handleKeyup(event, resolve) {
    // Check if escape is pressed
    if (event.key === 'Escape') {
      this.stopMapping();
      resolve(null);
    }
  },

  /**
   * Click event listener that gets content and path of clicked element.
   *
   * @param {MouseEvent} event - Mouse event.
   * @param {Function} resolve - Promise resolve function.
   */
  handleClick(event, resolve) {
    event.stopPropagation();
    event.preventDefault();
    const element = event.target;
    const path = element.getPath();
    this.stopMapping();
    resolve(path);
  },

  /**
   * On mouse move.
   *
   * @param {MouseEvent} event - Mouse event.
   */
  handleMouseMove(event) {
    this.addSelectionClass(event);
    this.positionTooltip(event);
  },

  /**
   *
   * @param {MouseEvent} event - Mouse event.
   *
   * @returns {boolean}
   */
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

  /**
   *
   * @param {MouseEvent} event
   */
  positionTooltip(event) {
    const tooltip = document.getElementById(Config.tooltipID);
    if (!tooltip) {
      return;
    }

    const x = event.clientX + 10;
    const y = event.clientY;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  },

  removeTooltip() {
    if (document.getElementsByClassName(Config.tooltipID).length) {
      for (const element of document.getElementsByClassName(Config.tooltipID)) {
        element.remove();
      }
    }
  },

  /**
   *
   * @param name
   * @param text
   */
  showTooltip(name, text) {
    if (!document.getElementById(Config.tooltipID)) {
      this.createTooltip();
    }

    const tooltip = document.getElementById(Config.tooltipID);

    tooltip.style.display = 'block';
    tooltip.querySelector('span').innerHTML = text;
    tooltip.querySelector('em').innerHTML = name;
  },

  createTooltip() {
    let tooltip = document.getElementById(Config.tooltipID);
    if (tooltip) {
      tooltip.parentElement.removeChild(tooltip);
    }

    tooltip = document.createElement('div');
    tooltip.setAttribute('id', Config.tooltipID);
    tooltip.innerHTML = '<div class="arrow"></div><div class="text"><span></span><em></em>or<em class="esc">esc</em></div>';
    document.body.appendChild(tooltip);
  },

  hideToolbar() {
    const tooltip = document.getElementById(Config.tooltipID);
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
