import {ENVIRONMENT, Environment} from '../constants.js';

export const isProd = (): boolean => ENVIRONMENT === Environment.Production;
