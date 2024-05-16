/**
 * Get text parts from element.
 */
export const getTextParts = (element: HTMLElement): ChildNode[] => {
  const childNodes = Array.from(element.childNodes);

  return childNodes.filter((node) => node.nodeName === '#text' && node.nodeValue?.trim());
};
