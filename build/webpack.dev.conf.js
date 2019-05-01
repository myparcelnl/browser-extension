/* eslint-disable no-magic-numbers,no-console */
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const merge = require('webpack-merge');
const prodConfig = require('./webpack.prod.conf.js');

module.exports = (env, argv) => merge(
  prodConfig(env, argv),
  {
    mode: 'development',
    watchOptions: {
      ignored: ['dist', 'node_modules', 'zip'],
    },
    devServer: {
      disableHostCheck: true,
      writeToDisk: true,
    },
    devtool: 'eval-source-map',
    plugins: [
      new ChromeExtensionReloader({
        port: 9099,
        entries: {
          background: 'background',
          content: 'content',
          popup: 'popup',
        },
      }),
    ],
  }
);
