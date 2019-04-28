const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  const prodPlugins = [];
  const babelProdPlugins = [];

  if (isProd) {
    // Don't import Logger.js.
    prodPlugins.push(new webpack.IgnorePlugin({
      resourceRegExp: /helpers\/Logger$/,
    }));
  }

  return {
    mode: 'production',
    entry: {
      functions: ['./src/scss/content.scss'],
      background: './src/background.js',
      content: './src/content.js',
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
      ]),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.js?$/,
          exclude: /node_modules/,
          use: {
            loader: 'webpack-strip-log-loader',
            options: {
              modules: ['Logger'],
            },
          },
        },
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
            {
              loader: 'file-loader',
              options: {
                name: 'css/[name].css',
              },
            },
            'extract-loader',
            'css-loader?-url',
            'sass-loader',
          ],
        },
      ],
    },
  };
};
