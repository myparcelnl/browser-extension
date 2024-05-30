import {type RequireOnly} from '@myparcel/ts-utils';
import {type Environment, type PlatformName} from '../constants.js';

export type PlatformConfig = Record<
  PlatformName,
  {
    manifest: Partial<chrome.runtime.ManifestV3> & RequireOnly<chrome.runtime.ManifestV3, 'name'>;
    urls: Record<Environment, string>;
  }
>;

export type StorageObject = Record<string, boolean | string>;

export interface StoredExtensionSettings extends StorageObject {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  enable_context_menu: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any;

export type SavedFieldMappings = Record<string, Record<string, string>>;

// JSON encoded messages
export type MessageQueue = Set<string>;

export type ConnectionType = {type: 'popup' | 'content'; id?: number};
