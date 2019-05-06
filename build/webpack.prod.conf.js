const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const packageData = require('../package.json');
const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  const prodPlugins = [];
  const prodRules = [];

  if (isProd) {
    // Don't import Logger.js.
    prodPlugins.push(new webpack.IgnorePlugin({
      resourceRegExp: /helpers\/Logger$/,
    }));

    // Clean dist folder before building
    prodPlugins.push(new CleanWebpackPlugin());

    // Create zip file for extension
    prodPlugins.push(
      new ZipPlugin({
        path: path.resolve(__dirname, '../zip'),
        filename: `chrome-extension-${packageData.version}.zip`,
        fileOptions: {
          compress: true,
        },
      })
    );

    // Strip Logger
    prodRules.push({
      test: /\.js?$/,
      exclude: /node_modules/,
      use: {
        loader: 'webpack-strip-log-loader',
        options: {
          modules: ['Logger'],
        },
      },
    });
  }

  return {
    mode: 'production',
    entry: {
      background: './src/Background.js',
      content: ['./src/Content.js', './src/scss/content.scss'],
      popup: ['./src/app/Popup.js', './src/scss/popup.scss'],
    },
    output: {
      filename: 'js/[name].js',
    },
    plugins: [
      ...prodPlugins,
      new CopyWebpackPlugin([
        {
          from: 'src/images',
          to: 'images',
        },
        {
          from: 'config',
          to: 'config',
        },
        {
          from: 'manifest.json',
          to: 'manifest.json',
        },
      ]),
      new MiniCssExtractPlugin({
        filename: 'css/[name].css',
        chunkFilename: '[id].css',
      }),
      new HtmlWebpackPlugin({
        filename: 'popup.html',
        template: 'src/app/popup.html',
        chunks: ['popup'],
      }),
    ],
    module: {
      rules: [
        ...prodRules,
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.scss$/,
          use: [
            {loader: MiniCssExtractPlugin.loader},
            'css-loader',
            'sass-loader',
          ],
        },
      ],
    },
  };
};
