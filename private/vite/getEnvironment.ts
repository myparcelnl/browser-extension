import {Environment} from '../../src/constants.js';

export const getEnvironment = (fallback: Environment = Environment.Production): Environment => {
  return (process.env.ENVIRONMENT ?? fallback) as Environment;
};
