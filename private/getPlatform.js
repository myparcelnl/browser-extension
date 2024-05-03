import {DEFAULT_PLATFORM} from './build/constants.js';

export const getPlatform = () => process.env.PLATFORM ?? DEFAULT_PLATFORM;
