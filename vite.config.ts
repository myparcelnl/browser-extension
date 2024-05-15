import {defineConfig} from 'vite';
import {crx} from '@crxjs/vite-plugin';
import {platformConfig, manifest, getPlatform, getEnvironment} from './private/vite';

const modifySassForPlatform = (platform: string) => {
  let sass = `$platform: '${platform}';`;

  switch (platform) {
    case 'myparcel':
      sass += `$primary: #ff8c00;`;
      break;

    case 'sendmyparcel':
      sass += `$primary: #068d94;`;
      break;

    case 'flespakket':
      sass += `$primary: #ff8c00;`;
      break;
  }

  return sass;
};

export default defineConfig((env) => {
  const isDev = env.mode !== 'production';
  const environment = getEnvironment(env.mode);
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
