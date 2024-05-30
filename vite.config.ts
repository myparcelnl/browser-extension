import {defineConfig} from 'vite';
import {crx} from '@crxjs/vite-plugin';
import {PlatformName, Environment} from './src/constants.js';
import {platformConfig, manifest, getPlatform, getEnvironment} from './private/vite/index.js';

const modifySassForPlatform = (platform: PlatformName) => {
  let sass = `$platform: '${platform}';`;

  switch (platform) {
    case PlatformName.MyParcel:
      sass += `$primary: #ff8c00;`;
      break;

    case PlatformName.SendMyParcel:
      sass += `$primary: #068d94;`;
      break;

    case PlatformName.Flespakket:
      sass += `$primary: #ff8c00;`;
      break;
  }

  return sass;
};

export default defineConfig((env) => {
  const isDev = env.mode !== Environment.Production;
  const environment = getEnvironment(env.mode as Environment);
  const platform = getPlatform();

  const popupUrl = platformConfig[platform]?.urls[environment];

  return {
    plugins: [crx({manifest})],

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: modifySassForPlatform(platform),
        },
      },
    },

    build: {
      emptyOutDir: false,
      minify: !isDev,
      sourcemap: true,
    },

    define: {
      'process.env.ENVIRONMENT': JSON.stringify(environment),
      'process.env.PLATFORM': JSON.stringify(platform),
      'process.env.POPUP_URL': JSON.stringify(popupUrl),
    },
  };
});
