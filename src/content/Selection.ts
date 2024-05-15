/* eslint-disable func-names */
import {isOfType} from '@myparcel/ts-utils';
import {type AnyFn} from '../types/index.js';
import tooltipHTML from './tooltip.html?raw';
import {isTextElement} from './isTextElement.js';
import {hasContent} from './hasContent.js';
import {getTextParts} from './getTextParts.js';
import {getPath} from './getPath.js';
import Config from './Config.js';

type StringsObject = Record<string, string>;

interface Listeners {
  click(event: MouseEvent): void;

  keyup(event: KeyboardEvent): void;

  mouseMove(event: MouseEvent): void;
}

/**
 * Selection functions.
 */
export default class Selection {
  private static listeners: Listeners = {} as Listeners;

  /**
   * Show tooltip and add event listeners for mapping field. Run `stopMapping` first to make sure everything is clean.
   */
  static startMapping(strings: Record<string, string>): Promise<string | null> {
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
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
   */
  static handleKeyup(event: KeyboardEvent, resolve: AnyFn) {
    // Check if escape is pressed
    if (event.key === 'Escape') {
      this.stopMapping();
      resolve(null);
    }
  }

  /**
   * Click event listener that gets content and path of clicked element.
   */
  static handleClick(event: MouseEvent, resolve: AnyFn) {
    event.preventDefault();
    event.stopPropagation();

    const element = event.target as HTMLElement;

    // Ignore nodes without text content
    if (!element || !hasContent(element)) {
      return;
    }

    const path = getPath(element);
    this.stopMapping();

    resolve(path);
  }

  static handleMouseMove(event: MouseEvent) {
    this.removeSelectionClass();
    this.addSelectionClass(event.target as HTMLElement);
    this.positionTooltip(event);
  }

  /**
   * Get elements content by selector key value pairs.
   */
  static getElementsContent(selectors: Record<string, string>): Record<string, string> {
    const values = {};

    Object.keys(selectors).forEach((key) => {
      values[key] = Selection.getSelectorContent(selectors[key]);
    });

    return values;
  }

  static addSelectionClass(element: HTMLElement) {
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
   */
  static createTooltip(strings: StringsObject) {
    const tooltip = document.createElement('div');

    tooltip.classList.add(Config.tooltipClass);

    document.body.appendChild(tooltip);

    // Add the variables
    this.updateTooltipHtml({
      fieldName: strings.choose,
      cancelText: strings.cancel,
    });
  }

  /**
   * Show the tooltip. It's created if it doesn't exist yet.
   */
  static showTooltip(strings: StringsObject) {
    let tooltip = this.getTooltip();

    if (tooltip) {
      this.updateTooltipHtml({
        fieldName: strings.choose,
      });
    } else {
      this.createTooltip(strings);
      tooltip = this.getTooltip();
    }

    // To reset its position, so it doesn't show until the cursor enters the viewport.
    tooltip.style.visibility = '-100%';
    tooltip.style.left = '-100%';

    tooltip.classList.add(Config.tooltipClassVisible);
  }

  /**
   * Update the tooltip template with new variables.
   */
  static updateTooltipHtml(strings: StringsObject) {
    const allVariables = {
      contentClass: Config.tooltipClassContent,
      textClass: Config.tooltipClassText,
      escapeClass: Config.tooltipClassEscape,
      ...strings,
    };

    this.getTooltip().innerHTML = Object.entries(allVariables).reduce((acc, [key, value]) => {
      return acc.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }, tooltipHTML);
  }

  /**
   * Position the tooltip, so it floats next to the user's cursor.
   */
  static positionTooltip(event: MouseEvent) {
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
   */
  static getTooltip(): HTMLElement {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return document.querySelector<HTMLElement>(`.${Config.tooltipClass}`)!;
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
   */
  static getSelectorContent(selector?: string | null): string | undefined {
    if (!selector) {
      return;
    }

    let elementContent = '';

    // Get the index, if any
    const selectorParts = selector.split('@');
    const [selectorPath, selectorIndex] = selectorParts;

    const element = document.querySelector<HTMLElement>(selectorPath);

    if (!element) {
      return;
    }

    const tag = element.tagName ? element.tagName.toLowerCase() : '';

    if (isOfType<HTMLTextAreaElement>(element, 'value') && selectorIndex && tag === 'textarea') {
      elementContent = element.value.split(/\n/g)[selectorIndex];
    } else if (selectorIndex) {
      const elementTextPart = getTextParts(element)[selectorIndex];

      if (elementTextPart) {
        elementContent = elementTextPart.textContent;
      }
    } else {
      // @ts-expect-error todo: fix this
      elementContent = isTextElement(element) ? element.value : element.textContent;
    }

    return elementContent.trim();
  }

  /**
   * Wrap given elements in a span.
   */
  static wrap(array: Node[]) {
    array.forEach((el) => {
      if ((el.parentElement?.childNodes?.length ?? 0) <= 1 || !el.textContent?.trim()) {
        return;
      }

      const span = document.createElement('span');
      span.innerHTML = el.textContent;
      span.classList.add(Config.wrappedItemClass);
      el.parentNode?.insertBefore(span, el);
      el.parentNode?.removeChild(el);
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const txt = document.createTextNode(el.textContent!);

      el.parentNode?.insertBefore(txt, el);
      el.parentNode?.removeChild(el);
    }
  }
}
