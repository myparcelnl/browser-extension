import {validInputTypes, contentTags} from './constants';

/**
 * Check if a given element is an element with text content.
 */
export const isTextElement = (element: HTMLElement): boolean => {
  const tag = element.tagName.toUpperCase();

  if (!contentTags.includes(tag)) {
    return false;
  }

  // Don't allow all input types.
  if (tag === 'input') {
    return validInputTypes.includes((element as HTMLInputElement).type);
  }

  return true;
};
