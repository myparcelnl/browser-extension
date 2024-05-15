/**
 * Get text parts from element.
 */
export const getTextParts = (element: HTMLElement) => {
  const childNodes = Array.from(element.childNodes);

  return childNodes.filter((node) => node.nodeName === '#text' && node.nodeValue?.trim());
};
