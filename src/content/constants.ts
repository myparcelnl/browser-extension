import {PLATFORM} from '../constants.js';

export const CLASS_PREFIX = `${PLATFORM}__`;

export const SELECTION_CLASS = `${CLASS_PREFIX}mapping-field`;

export const TOOLTIP_CLASS = `${CLASS_PREFIX}mapping-tooltip`;

export const TOOLTIP_CLASS_CONTENT = `${TOOLTIP_CLASS}__content`;

export const TOOLTIP_CLASS_ESCAPE = `${TOOLTIP_CLASS_CONTENT}__escape`;

export const TOOLTIP_CLASS_TEXT = `${TOOLTIP_CLASS_CONTENT}__text`;

export const TOOLTIP_CLASS_VISIBLE = `${TOOLTIP_CLASS}--visible`;

export const WRAPPED_ITEM_CLASS = `${CLASS_PREFIX}wrapped-item`;

/**
 * HTML elements that contain text.
 */
export const contentTags = Object.freeze(['INPUT', 'SELECT', 'TEXTAREA']);

/**
 * Input tag types that contain text.
 */
export const validInputTypes = Object.freeze(['text', 'number']);
