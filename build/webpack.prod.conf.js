const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: {
    functions: ['./src/scss/popup.scss', './src/scss/extension.scss'],
    background: './src/background.js',
    inject: './src/inject.js',
  },
  output: {
    filename: 'js/[name].js',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  module: {
    rules: [
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
