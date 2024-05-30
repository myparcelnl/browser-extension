import {isTextElement} from './isTextElement.js';

/**
 * Check if element is a textarea or text/number input. If not, check if children of DOM element have text content.
 */
export const hasContent = (element: HTMLElement): boolean => {
  const {childNodes} = element;

  return isTextElement(element) || Array.from(childNodes).some((node) => !!node.nodeValue);
};
