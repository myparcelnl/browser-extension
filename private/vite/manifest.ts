/* eslint-disable @typescript-eslint/no-magic-numbers */
import {defineManifest} from '@crxjs/vite-plugin';
import {Environment} from '../../src/constants.js';
import packageJson from '../../package.json';
import {platformConfig} from './platformConfig.js';
import {getPlatform} from './getPlatform.js';
import {getEnvironment} from './getEnvironment.js';

const {version} = packageJson;

const [major, minor, patch, label = '0'] = version.replace(/[^\d.-]+/g, '').split(/[.-]/);

const ucfirst = (string: string): string => string.charAt(0).toUpperCase() + string.slice(1);

// @ts-expect-error todo: fix type error
// eslint-disable-next-line max-lines-per-function
export const manifest = defineManifest((env) => {
  const environment = getEnvironment(env.mode as Environment);
  const platform = getPlatform();

  const isProd = environment === Environment.Production;

  const manifest = {
    background: {
      service_worker: 'src/serviceWorker.ts',
      type: 'module',
    },
    author: {
      email: 'support@myparcel.nl',
    },
    default_locale: 'en',
    host_permissions: ['*://*/*'],
    icons: {
      16: `assets/icons/icon-${platform}-16px.png`,
      48: `assets/icons/icon-${platform}-48px.png`,
      128: `assets/icons/icon-${platform}-128px.png`,
    },
    manifest_version: 3,
    minimum_chrome_version: '88',
    permissions: ['activeTab', 'contextMenus', 'storage', 'tabs'],
    version: `${major}.${minor}.${patch}.${label}`,
    version_name: version,
    content_scripts: [
      {
        js: ['src/contentScript.ts'],
        all_frames: true,
        exclude_matches: [
          '*://backoffice.flespakket.nl/*',
          '*://backoffice.myparcel.nl/*',
          '*://backoffice.sendmyparcel.be/*',
          '*://extension.flespakket.nl/*',
          '*://extension.myparcel.nl/*',
          '*://extension.sendmyparcel.be/*',
        ],
        matches: ['<all_urls>'],
        world: 'ISOLATED',
      },
    ],
    action: {
      default_icon: {
        16: `assets/icons/icon-${platform}-16px.png`,
        48: `assets/icons/icon-${platform}-48px.png`,
        128: `assets/icons/icon-${platform}-128px.png`,
      },
    },

    ...platformConfig[platform]?.manifest,
  } satisfies chrome.runtime.ManifestV3;

  if (!isProd) {
    // Changes for development and testing environments
    Object.assign(manifest, {
      options_page: 'assets/options/options.html',
      name: `${manifest.name} (${ucfirst(environment)})`,
    });
  }

  return manifest;
});
