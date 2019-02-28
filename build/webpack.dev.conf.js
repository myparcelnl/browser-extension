/* eslint-disable no-magic-numbers,no-console */
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const merge = require('webpack-merge');
const prodConfig = require('./webpack.prod.conf.js');
const fs = require('fs');

module.exports = merge(prodConfig, {
  mode: 'development',
  watch: true,
  watchOptions: {
    poll: true,
    ignored: ['dist', 'node_modules'],
  },
  devServer: {
    https: {
      ca: fs.readFileSync('./server.pem'),
    },
    disableHostCheck: true,
    writeToDisk: true,
  },
  plugins: [
    new ChromeExtensionReloader({
      port: 9099,
      entries: {
        background: 'background',
      },
    }),
  ],
});
