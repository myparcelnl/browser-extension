import {MAPPING_PREFIX} from '../../constants';

export const getStorageMappingKey = (url: string): string => `${MAPPING_PREFIX}${url}`;
