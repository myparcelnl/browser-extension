const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
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
    new CopyWebpackPlugin([
      {from: 'src/images', to: 'images'},
    ]),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
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
