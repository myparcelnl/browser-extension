import {MAPPING_PREFIX} from '../../constants.js';

export const getStorageMappingKey = (url: string): string => `${MAPPING_PREFIX}${url}`;
