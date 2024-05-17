import {type PlatformConfig} from '../../src/types/index.js';
import {PlatformName, Environment} from '../../src/constants.js';

/**
 * Configuration for each platform. Keys in manifest will be merged into the manifest.json file. The keys in the
 * development, testing and production objects will be merged into the config.json file based on the environment.
 */
export const platformConfig: PlatformConfig = Object.freeze({
  [PlatformName.MyParcel]: {
    manifest: {
      name: 'MyParcel',
      short_name: 'MyParcel',
      externally_connectable: {
        matches: ['*://*.myparcel.nl/*'],
      },
    },
    urls: {
      [Environment.Development]: 'https://extension.dev.myparcel.nl',
      [Environment.Testing]: 'https://remote1.extension.testing.myparcel.nl',
      [Environment.Production]: 'https://extension.myparcel.nl',
    },
  },
  [PlatformName.Flespakket]: {
    manifest: {
      name: 'Flespakket',
      short_name: 'Flespakket',
      externally_connectable: {
        matches: ['*://*.flespakket.nl/*'],
      },
    },
    urls: {
      [Environment.Development]: 'https://extension.dev.flespakket.nl',
      [Environment.Testing]: 'https://remote1.extension.testing.flespakket.nl',
      [Environment.Production]: 'https://extension.flespakket.nl',
    },
  },
  [PlatformName.SendMyParcel]: {
    manifest: {
      name: 'SendMyParcel',
      short_name: 'SendMyParcel',
      externally_connectable: {
        matches: ['*://*.sendmyparcel.be/*'],
      },
    },
    urls: {
      [Environment.Development]: 'https://extension.dev.sendmyparcel.be',
      [Environment.Testing]: 'https://remote1.extension.testing.sendmyparcel.be',
      [Environment.Production]: 'https://extension.sendmyparcel.be',
    },
  },
});
