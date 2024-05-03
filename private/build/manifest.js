/* eslint-disable no-magic-numbers */
import {defineManifest} from '@crxjs/vite-plugin';
import {getPlatform} from '../getPlatform.js';
import {getEnvironment} from '../getEnvironment.js';
import packageJson from '../../package.json';
import {platformConfig} from './platformConfig.js';

const {version} = packageJson;

const [major, minor, patch, label = '0'] = version.replace(/[^\d.-]+/g, '').split(/[.-]/);

const ucfirst = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const manifest = defineManifest((env) => {
  const environment = getEnvironment(env.mode);
  const platform = getPlatform();

  const isProd = environment === 'production';

  /** @type {chrome.runtime.ManifestV3} */
  const manifest = {
    background: {
      service_worker: 'src/Background.js',
      type: 'module',
    },
    default_locale: 'en',
    host_permissions: ['*://*/*'],
    icons: {
      16: `icons/icon-${platform}-16px.png`,
      48: `icons/icon-${platform}-48px.png`,
      128: `icons/icon-${platform}-128px.png`,
    },
    manifest_version: 3,
    minimum_chrome_version: '88',
    permissions: ['activeTab', 'contextMenus', 'storage', 'tabs'],
    version: `${major}.${minor}.${patch}.${label}`,
    version_name: version,
    content_scripts: [
      {
        js: ['src/Content.js'],
        all_frames: true,
        exclude_matches: ['*://*.myparcel.nl/*', '*://*.flespakket.nl/*', '*://*.sendmyparcel.be/*'],
        matches: ['<all_urls>'],
        world: 'ISOLATED',
      },
    ],
    action: {
      default_icon: {
        16: `icons/icon-${platform}-16px.png`,
        48: `icons/icon-${platform}-48px.png`,
        128: `icons/icon-${platform}-128px.png`,
      },
    },

    // content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",

    ...platformConfig[platform]?.manifest,
  };

  if (!isProd) {
    // Changes for development environment
    Object.assign(manifest, {
      options_page: 'src/options/options.html',
      name: `${manifest.name} (${ucfirst(environment)})`,
    });
  }

  return manifest;
});
