/**
 * Configuration for each platform. Keys in manifest will be merged into the manifest.json file. The keys in the
 * development, staging and production objects will be merged into the config.json file based on the environment.
 *
 * @type {Record<string, {manifest: Partial<chrome.runtime.ManifestV3>, urls: Record<string, string>}>}
 */
export const platformConfig = {
  myparcel: {
    manifest: {
      name: 'MyParcel',
      short_name: 'MyParcel',
      externally_connectable: {
        matches: ['*://*.myparcel.nl/*'],
      },
    },
    urls: {
      development: 'https://extension.dev.myparcel.nl',
      staging: 'https://extension.staging.myparcel.nl',
      production: 'https://extension.myparcel.nl',
    },
  },
  flespakket: {
    manifest: {
      name: 'Flespakket',
      short_name: 'Flespakket',
      externally_connectable: {
        matches: ['*://*.flespakket.nl/*'],
      },
    },
    urls: {
      development: 'https://extension.dev.flespakket.nl',
      staging: 'phttps://extension.staging.flespakket.nl',
      production: 'https://extension.flespakket.nl',
    },
  },
  sendmyparcel: {
    manifest: {
      name: 'SendMyParcel',
      short_name: 'SendMyParcel',
      externally_connectable: {
        matches: ['*://*.sendmyparcel.be/*'],
      },
    },
    urls: {
      development: 'https://extension.dev.sendmyparcel.be',
      staging: 'https://extension.staging.sendmyparcel.be',
      production: 'https://extension.sendmyparcel.be',
    },
  },
};
