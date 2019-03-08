/* eslint-disable func-names */
import '../helpers/prototype';
import config from '../helpers/config';
import log from '../helpers/log';

const listeners = {};
const tooltip = null;

export const clickedElement = () => {
  return new Promise((resolve) => {
    selection.createTooltip();
    selection.startMapping(resolve);
  });
};

export const elementsContent = (config) => {
  const configData = {};
  for (const key in config) {
    configData[key] = this.getSelectorValues(config[key]);
  }

  return configData;
};

export const selection = {
  startMapping(resolve) {
    log.info('Start mapping');

    listeners.click = (event) => selection.handleClick(event, resolve);
    listeners.keyup = (event) => selection.handleKeyup(event, resolve);
    listeners.mouseMove = (event) => selection.handleMouseMove(event, resolve);

    document.addEventListener('click', listeners.click);
    document.addEventListener('keyup', listeners.keyup);
    document.addEventListener('mousemove', listeners.mouseMove);
  },

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

  handleKeyup(event, resolve) {
    // Check if escape is pressed
    if (event.keyCode === 27) {
      this.stopMapping();
      resolve(null);
    }
  },

  handleClick(event, resolve) {
    event.stopPropagation();
    event.preventDefault();
    let element = event.target;

    ['input', 'select'].forEach((tag) => {
      if (element.getElementsByTagName(tag).length > 0) {
        element = element.getElementsByTagName(tag)[0];
      }
    });

    const path = element.getPath();
    const content = element.innerText;
    this.stopMapping();
    resolve({path, content});
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

    element.classList.add(config.selectionClass);

    if (element.innerHTML !== element.nodeValue) {
      this.wrap(element.getTextParts());
    }
  },

  positionTooltip(event) {
    const tooltip = document.getElementById(config.tooltipClass);
    if (!tooltip) {
      return;
    }

    let {pageY: y, pageX: x} = event;
    const {clientY, clientX, target} = event;

    console.log(x);
    console.log(y);

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
    if (document.getElementsByClassName(config.tooltipClass).length) {
      for (const element of document.getElementsByClassName(config.tooltipClass)) {
        element.remove();
      }
    }
  },

  showToolbar(name, text) {
    if (!document.getElementById(config.tooltipClass)) {
      this.createToolbar();
    }

    const tooltip = document.getElementById(config.tooltipClass);

    tooltip.style.display = 'block';
    tooltip.querySelector('span').innerHTML = text;
    tooltip.querySelector('em').innerHTML = name;
  },

  createTooltip() {
    let tooltip = document.getElementById(config.tooltipClass);
    if (tooltip) {
      tooltip.parentElement.removeChild(tooltip);
    }

    tooltip = document.createElement('div');
    tooltip.setAttribute('id', config.tooltipClass);
    tooltip.innerHTML = '<div class="arrow"></div><div class="text"><span></span><em></em>or<em class="esc">esc</em></div>';
    document.body.appendChild(tooltip);
  },

  hideToolbar() {
    const tooltip = document.getElementById(config.tooltipClass);
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  },

  removeSelectionClass() {
    if (document.getElementsByClassName(config.selectionClass).length) {
      for (const element of document.getElementsByClassName(config.selectionClass)) {
        element.classList.remove(config.selectionClass);
      }
    }
  },

  wrap(array) {
    for (let i = 0; i < array.length; i++) {
      const e = array[i];
      if (e.parentElement.childNodes.length > 1 && e.textContent.trim() !== '') {
        const span = document.createElement('span');
        span.innerHTML = e.textContent;
        span.classList.add(config.wrappedItemClass);
        e.parentNode.insertBefore(span, e);
        e.parentNode.removeChild(e);
      }
    }
  },

  unwrap() {
    const array = document.getElementsByClassName(config.wrappedItemClass);
    if (array) {
      for (let i = array.length - 1; i >= 0; i--) {
        const e = array[i];
        const txt = document.createTextNode(e.textContent);
        e.parentNode.insertBefore(txt, e);
        e.parentNode.removeChild(e);
      }
    }
  },

  getSelectorValues(selector) {
    let value = '';
    if (selector) {
      selector = selector.split('@');
      const selectorPath = selector[0];
      const selectorIndex = selector[1];
      const path = document.querySelectorAll(selectorPath);
      if (path.length > 0) {
        const e = path[0];
        const tag = (e && e.tagName) ? e.tagName.toLowerCase() : '';

        if (e && e.value && selectorIndex && tag === 'textarea') {
          value = e.value.split(/\n/g)[selectorIndex.trim()];
        } else if (selectorIndex) {
          const element = e.getTextParts()[selectorIndex.trim()];
          if (element) {
            value = element.textContent;
          }
        } else if (e) {
          value = (['input', 'select', 'textarea'].indexOf(tag) !== -1) ? e.value : e.textContent;
        }
      }
    }
    return value.trim();
  },
};
