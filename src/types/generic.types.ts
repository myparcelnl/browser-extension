import {type RequireOnly} from '@myparcel/ts-utils';

export type Environment = 'development' | 'staging' | 'production';

export type PlatformConfig = Record<
  string,
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

export interface MappedFields {
  url: string;
  fields: string[];
}

// JSON encoded messages
export type MessageQueue = Set<string>;

export type ConnectionType = 'popup' | 'content';
