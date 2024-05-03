/* eslint-disable func-names */
import tooltipHTML from './tooltip.html?raw';
import {getPath, getTextParts, hasContent, isTextElement} from './helpers';
import Config from './Config';

/**
 * Selection functions.
 */
export default class Selection {
  /**
   * Listeners object.
   *
   * @type {Object.<String, Function>}
   */
  static listeners = {};

  /**
   * The variables to use in the mustache template for the mapping tooltip.
   *
   * @type {Object}
   */
  static tooltipVariables = {
    contentClass: Config.tooltipClassContent,
    textClass: Config.tooltipClassText,
    escapeClass: Config.tooltipClassEscape,
  };

  /**
   * Show tooltip and add event listeners for mapping field. Run `stopMapping` first to make sure everything is clean.
   *
   * @param {Object} strings - Object with translated strings.
   *
   * @returns {Promise}
   */
  static startMapping(strings) {
    return new Promise((resolve) => {
      this.stopMapping();

      this.showTooltip(strings);
      this.listeners.click = (event) => this.handleClick(event, resolve);
      this.listeners.keyup = (event) => this.handleKeyup(event, resolve);
      this.listeners.mouseMove = (event) => this.handleMouseMove(event);

      document.addEventListener('click', this.listeners.click);
      document.addEventListener('keyup', this.listeners.keyup);
      document.addEventListener('mousemove', this.listeners.mouseMove);
    });
  }

  /**
   * Clean up event listeners and any added HTML elements.
   */
  static stopMapping() {
    document.removeEventListener('click', this.listeners.click);
    document.removeEventListener('keyup', this.listeners.keyup);
    document.removeEventListener('mousemove', this.listeners.mouseMove);

    this.removeSelectionClass();
    this.hideTooltip();
    this.unwrap();
  }

  /**
   * Keyup event listener to check for escape button press.
   *
   * @param {KeyboardEvent} event - Keyup event.
   * @param {Function} resolve - Resolve function.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
   */
  static handleKeyup(event, resolve) {
    // Check if escape is pressed
    if (event.key === 'Escape') {
      this.stopMapping();
      resolve(null);
    }
  }

  /**
   * Click event listener that gets content and path of clicked element.
   *
   * @param {MouseEvent} event - Mouse event.
   * @param {Function} resolve - Promise resolve function.
   */
  static handleClick(event, resolve) {
    event.preventDefault();
    event.stopPropagation();

    const element = event.target;

    // Ignore nodes without text content
    if (!hasContent(element)) {
      return;
    }

    const path = getPath(element);
    this.stopMapping();

    resolve(path);
  }

  /**
   * On mouse move.
   *
   * @param {MouseEvent} event - Mouse event.
   */
  static handleMouseMove(event) {
    this.removeSelectionClass();
    this.addSelectionClass(event.target);
    this.positionTooltip(event);
  }

  /**
   * Get elements content by selector key value pairs or string path.
   *
   * @param {Object|String} selectors - Key/value pairs or one path.
   *
   * @returns {Object|undefined}
   */
  static getElementsContent(selectors) {
    if (!selectors || !Object.keys(selectors).length) {
      return;
    }

    const values = {};

    // In case of mapping fields `selectors` will be a string.
    if (typeof selectors === 'string') {
      return Selection.getSelectorContent(selectors);
    }

    Object.keys(selectors).forEach((key) => {
      values[key] = Selection.getSelectorContent(selectors[key]);
    });

    return values;
  }

  /**
   * @param {Element|EventTarget} element
   */
  static addSelectionClass(element) {
    // Don't highlight nodes without text content
    if (!hasContent(element)) {
      return;
    }

    element.classList.add(Config.selectionClass);

    // If the element has text nodes, wrap those nodes for more specific mapping.
    if (element.innerHTML !== element.nodeValue) {
      this.wrap(getTextParts(element));
    }
  }

  /**
   * Create the tooltip and add it to the DOM.
   *
   * @param {Object.<String, String>} strings - Object with translated strings.
   */
  static createTooltip(strings) {
    const tooltip = document.createElement('div');

    tooltip.classList.add(Config.tooltipClass);

    document.body.appendChild(tooltip);

    // Add the variables
    this.updateTooltipHTML({
      fieldName: strings.choose,
      cancel: strings.cancel,
    });
  }

  /**
   * Show the tooltip. It's created if it doesn't exist yet.
   *
   * @param {Object} strings - Object with translated strings.
   */
  static showTooltip(strings) {
    let tooltip = this.getTooltip();

    if (tooltip) {
      this.updateTooltipHTML({
        fieldName: strings.choose,
      });
    } else {
      this.createTooltip(strings);
      tooltip = this.getTooltip();
    }

    // To reset its position so it doesn't show until the cursor enters the viewport.
    tooltip.style.visibility = '-100%';
    tooltip.style.left = '-100%';

    tooltip.classList.add(Config.tooltipClassVisible);
  }

  /**
   * Update the tooltip template with new variables.
   *
   * @param {Object} variables - Variables to add to existing ones.
   */
  static updateTooltipHTML(variables) {
    const allVariables = {
      ...this.tooltipVariables,
      ...variables,
    };

    this.getTooltip().innerHTML = Object.entries(allVariables).reduce((acc, [key, value]) => {
      return acc.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }, tooltipHTML);
  }

  /**
   * Position the tooltip so it floats next to the user's cursor.
   *
   * @param {MouseEvent} event - Mouse event.
   */
  static positionTooltip(event) {
    const tooltip = this.getTooltip();

    if (!tooltip) {
      return;
    }

    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

  /**
   * Hide the tooltip.
   */
  static hideTooltip() {
    const tooltip = this.getTooltip();

    if (tooltip) {
      tooltip.classList.remove(Config.tooltipClassVisible);
    }
  }

  /**
   * Fetch the tooltip.
   *
   * @returns {HTMLElement}
   */
  static getTooltip() {
    return document.querySelector(`.${Config.tooltipClass}`);
  }

  /**
   * Remove the tooltip from the DOM.
   */
  static removeTooltip() {
    const tooltip = this.getTooltip();

    if (tooltip) {
      tooltip.remove();
    }
  }

  /**
   * Remove the added classes.
   */
  static removeSelectionClass() {
    const elements = document.querySelectorAll(`.${Config.selectionClass}`);

    elements.forEach((element) => {
      element.classList.remove(Config.selectionClass);
    });
  }

  /**
   * Get the content of a selector. A selector is a query string with an optional index added in the following format:
   * `<selector>@<index>`. This index is used to separate text nodes inside a single element. For example a `p` element
   * can contain multiple lines of text (= text nodes). If we did not define an index this function would return the
   * entire element's content instead of the specific line or node we want.
   *
   * @example
   * // Given the following element:
   * <p class="address">
   *   Name
   *   Address
   *   City
   * </p>
   *
   * getSelectorContent('.address'); // Returns: "Name Address City"
   * getSelectorContent('.address@2'); // Returns "City"
   *
   * @param {String} selector - Selector string.
   *
   * @returns {String|undefined}
   */
  static getSelectorContent(selector) {
    if (!selector) {
      return;
    }

    let elementContent = '';

    // Get the index, if any
    const selectorParts = selector.split('@');
    const [selectorPath, selectorIndex] = selectorParts;

    const element = document.querySelector(selectorPath);

    if (!element) {
      return;
    }

    const tag = element.tagName ? element.tagName.toLowerCase() : '';

    if (element.value && selectorIndex && tag === 'textarea') {
      elementContent = element.value.split(/\n/g)[selectorIndex];
    } else if (selectorIndex) {
      const elementTextPart = getTextParts(element)[selectorIndex];

      if (elementTextPart) {
        elementContent = elementTextPart.textContent;
      }
    } else {
      elementContent = isTextElement(element) ? element.value : element.textContent;
    }

    return elementContent.trim();
  }

  /**
   * Wrap given elements in a span.
   *
   * @param {Array} array - Array of nodes.
   */
  static wrap(array) {
    array.forEach((el) => {
      if (el.parentElement.childNodes.length > 1 && el.textContent.trim() !== '') {
        const span = document.createElement('span');
        span.innerHTML = el.textContent;
        span.classList.add(Config.wrappedItemClass);

        el.parentNode.insertBefore(span, el);
        el.parentNode.removeChild(el);
      }
    });
  }

  /**
   * Restore original element after wrapping with `wrap()`.
   */
  static unwrap() {
    const nodes = document.querySelectorAll(`.${Config.wrappedItemClass}`);

    if (!nodes.length) {
      return;
    }

    for (let i = nodes.length - 1; i >= 0; i--) {
      const el = nodes[i];
      const txt = document.createTextNode(el.textContent);

      el.parentNode.insertBefore(txt, el);
      el.parentNode.removeChild(el);
    }
  }
}
