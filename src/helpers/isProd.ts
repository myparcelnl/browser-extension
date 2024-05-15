import {ENVIRONMENT, Environment} from '../constants.js';

export const isProd = () => ENVIRONMENT === Environment.Production;
