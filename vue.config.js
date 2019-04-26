// const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
// const chromeExtension = require(`./build/webpack.${env}.conf.js`);
// const merge = require('webpack-merge');

module.exports = {
  pages: {
    index: {
      entry: './src/app/src/main.js',
      template: './src/app/public/index.html',
      filename: './app/index.html',
      title: 'MyParcel Chrome Extension',
    },
  },
};
