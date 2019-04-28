const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  const prodPlugins = [];
  const babelProdPlugins = [];
  const prodRules = [];

  if (isProd) {
    // Don't import Logger.js.
    prodPlugins.push(new webpack.IgnorePlugin({
      resourceRegExp: /helpers\/Logger$/,
    }));
    prodRules.push({
      test: /\.js?$/,
      exclude: /node_modules/,
      use: {
        loader: 'webpack-strip-log-loader',
        options: {
          modules: ['Logger'],
        },
      },
    },);
  }

  return {
    mode: 'production',
    entry: {
      background: './src/background.js',
      content: ['./src/content.js', './src/scss/content.scss'],
      popup: ['./src/app/popup.js', './src/scss/popup.scss'],
    },
    output: {
      filename: 'js/[name].js',
    },
    plugins: [
      ...prodPlugins,
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin([
        {
          from: 'src/images',
          to: 'images',
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
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                ...babelProdPlugins,
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-transform-runtime',
                '@babel/plugin-transform-named-capturing-groups-regex',
              ],
            },
          },
        },
        {
          test: /\.scss$/,
          use: [
            'file-loader',
            { loader: MiniCssExtractPlugin.loader },
            'css-loader',
            'sass-loader',
          ],
        },
      ],
    },
  };
};
