import {type MessageData} from '../types/index.js';

/**
 * Return whether an incoming message is from the CRX vite plugin. Only relevant in development.
 */
export const isCrxMessage = (message: MessageData): boolean => {
  if (import.meta.env.PROD) {
    return false;
  }

  return (typeof message.data === 'string' && message.data.includes('ping')) || message.type === 'connected';
};
