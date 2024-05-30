import {type PlatformName} from '../../src/constants.js';
import {DEFAULT_PLATFORM} from './constants.js';

export const getPlatform = (): PlatformName => {
  return (process.env.PLATFORM ?? DEFAULT_PLATFORM) as PlatformName;
};
