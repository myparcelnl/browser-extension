/* eslint-disable no-magic-numbers,no-console */
const merge = require('webpack-merge');
const prodConfig = require('./webpack.prod.conf.js');

module.exports = (env, argv) => {
  return merge(prodConfig(env, argv), {
    devtool: 'eval-source-map',
  });
};
