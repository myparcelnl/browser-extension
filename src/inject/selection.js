/* eslint-disable func-names */
const selectionClass = 'myparcel__mapping-field';
const tooltipClass = 'myparcel__mapping-tooltip';
import getSelector from 'unique-selector';
import log from '../helpers/log';

const listeners = {};
let tooltip = null;

export const clickedElement = () => {
  return new Promise((resolve) => {
    Selection.createTooltip();

    listeners.click = (event) => Selection.handleClick(event, resolve);
    listeners.keyup = (event) => Selection.handleKeyup(event, resolve);
    listeners.mouseMove = (event) => Selection.handleMouseMove(event, resolve);

    document.addEventListener('click', listeners.click);
    document.addEventListener('keyup', listeners.keyup);
    document.addEventListener('mousemove', listeners.mouseMove);
  });
};

const Selection = {

  stopMapping() {
    document.removeEventListener('click', listeners.click);
    document.removeEventListener('keyup', listeners.keyup);
    document.removeEventListener('mousemove', listeners.mouseMove);

    this.removeSelectionClass();
    this.removeTooltip();
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
    this.stopMapping();
    resolve(path);
  },

  handleMouseMove(event) {
    event.stopPropagation();
    this.removeSelectionClass();

    tooltip.style.top = `${event.clientY}px`;
    tooltip.style.left = `${event.clientX}px`;

    if (this.validElement(event)) {
      event.target.classList.add(selectionClass);
    }
  },

  validElement(event) {
    return event.target.innerHTML !== event.target.nodeValue && event.path.length > 3;
  },

  removeTooltip() {
    if (document.getElementsByClassName(tooltipClass).length) {
      for (const element of document.getElementsByClassName(tooltipClass)) {
        element.remove();
      }
    }
  },

  createTooltip() {
    if (!tooltip) {
      tooltip = document.createElement('div', {});
      tooltip.classList.add(tooltipClass);
      tooltip.innerText = 'Selecting';
      document.body.appendChild(tooltip);
    }
  },

  removeSelectionClass() {
    if (document.getElementsByClassName(selectionClass).length) {
      for (const element of document.getElementsByClassName(selectionClass)) {
        element.classList.remove(selectionClass);
      }
    }
  },
};

HTMLElement.prototype.getPath = function() {
  return getSelector(this, {excludeRegex: RegExp(`.${selectionClass}`)});
};
