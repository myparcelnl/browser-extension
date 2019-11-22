const prodConfig = require('./webpack.prod.conf');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');

module.exports = (env) => {
  const config = [];

  const devConfig = (index) => ({
    mode: 'development',
    watchOptions: {
      ignored: ['/dist', '/node_modules'],
    },
    devServer: {
      disableHostCheck: true,
      writeToDisk: true,
    },
    devtool: 'eval-source-map',
    plugins: [
      new ChromeExtensionReloader({
        port: 9090 + index,
        reloadPage: false,
        entries: {
          background: 'background',
          contentScript: ['content'],
        },
      }),
    ],
  });

  // Merge dev configuration into all prod configs.
  prodConfig(env.NODE_ENV).forEach((prodConfig, index) => {
    config.push({
      ...prodConfig,
      ...{
        ...devConfig(index),
        // Concatenate plugins instead of overriding them
        plugins: [
          ...prodConfig.plugins,
          ...devConfig(index).plugins,
        ],
      },
    });
  });

  return config;
};
