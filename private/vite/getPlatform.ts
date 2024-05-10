import {DEFAULT_PLATFORM} from './constants';

export const getPlatform = () => process.env.PLATFORM ?? DEFAULT_PLATFORM;
