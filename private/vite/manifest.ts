/* eslint-disable @typescript-eslint/no-magic-numbers */
import * as child_process from 'node:child_process';
import {defineManifest} from '@crxjs/vite-plugin';
import {Environment} from '../../src/constants.js';
import packageJson from '../../package.json' assert {type: 'json'};
import {platformConfig} from './platformConfig.js';
import {getPlatform} from './getPlatform.js';
import {getEnvironment} from './getEnvironment.js';

const {version} = packageJson;

const [major, minor, patch] = version.replace(/[^\d.-]+/g, '').split(/[.-]/);

// Use the amount of commits since the last tag to determine the version label
const commitsSinceLastTag = child_process
  .execSync('git rev-list $(git describe --tags --abbrev=0)..HEAD --count')
  .toString()
  .trim();

// @ts-expect-error todo: fix type error
// eslint-disable-next-line max-lines-per-function
export const manifest = defineManifest((env) => {
  const environment = getEnvironment(env.mode as Environment);
  const platform = getPlatform();

  const isProd = environment === Environment.Production;

  const label = isProd ? 0 : commitsSinceLastTag;

  const manifest = {
    description: '__MSG_appDescription__',
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

  // Changes for development and testing environments
  if (!isProd) {
    Object.assign(manifest, {options_page: 'assets/options/options.html'});
  }

  if (Environment.Testing === environment) {
    // https://developer.chrome.com/docs/extensions/develop/migrate/publish-mv3#label-beta
    Object.assign(manifest, {
      name: `${manifest.name} BETA`,
      description: `THIS EXTENSION IS FOR BETA TESTING`,
    });
  } else if (Environment.Development === environment) {
    Object.assign(manifest, {
      name: `${manifest.name} [${environment}]`,
      description: `${manifest.description} [${environment}]`,
    });
  }

  return manifest;
});
