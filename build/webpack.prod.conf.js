const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const packageData = require('../package.json');
const path = require('path');
const webpack = require('webpack');
const {platforms} = require('../config/config');

/**
 * @param {boolean} isProd - If we're in production mode or not.
 * @param {string} platform - Platform name.
 *
 * @returns {Array}
 */
const prodPlugins = (isProd, platform) => {
  if (!isProd) {
    return [];
  }

  return [
    // Don't import Logger.js.
    new webpack.IgnorePlugin({
      resourceRegExp: /helpers\/Logger$/,
    }),

    // Clean dist folder before building
    new CleanWebpackPlugin(),

    // Create zip file for extension
    new FileManagerPlugin({
      onEnd: {
        archive: [
          {
            source: `dist/${platform}`,
            destination: `dist/chrome-extension-${platform}-${packageData.version}.zip`,
          },
        ],
      },
    }),
  ];
};

/**
 *
 * @param {boolean} isProd - If we're in production mode or not.
 *
 * @returns {Array}
 */
const prodRules = (isProd) => {
  if (!isProd) {
    return [];
  }

  return [
    // Strip Logger
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
  ];
};

/**
 * Modify the manifest file for each platform.
 *
 * @param {Buffer} buffer - File contents.
 * @param {string} platform - Platform name.
 *
 * @returns {string}
 */
const updateManifest = (buffer, platform) => {
  // Replace platform placeholder strings with actual platform name
  const string = buffer.toString().replace(/__MSG_platform__/g, platform);
  const templateManifest = JSON.parse(string);

  const newManifest = {
    // Start with the template data
    ...templateManifest,
    // Get manifest data from platform config
    ...platforms[platform].manifest,
    // Copy the version from package.json
    version: packageData.version,
  };

  return JSON.stringify(newManifest, null, 2);
};

/**
 * Modify the config file for each platform.
 *
 * @param {Buffer} buffer - File contents.
 * @param {string} platform - Platform name.
 *
 * @returns {string}
 */
const updateConfig = (buffer, platform) => {
  const config = JSON.parse(buffer.toString());

  const {platforms, ...configuration} = config;
  const {manifest, ...platformData} = platforms[platform];

  // Strip out other platform data and manifest configuration
  const newConfig = {
    ...configuration,
    ...platformData,
  };

  return JSON.stringify(newConfig, null, 2);
};

/**
 * Export a webpack config for each platform.
 *
 * @param {*} env - Webpack env.
 * @param {*} argv - Webpack argv.
 *
 * @returns {Array.<Object>} - Array of webpack configs.
 */
module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return Object.keys(platforms).map((platform) => {
    const outputDir = path.resolve(__dirname, `../dist/${platform}`);

    return {
      resolveLoader: {
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      },

      mode: 'production',
      entry: {
        background: './src/Background.js',
        content: ['./src/Content.js', './src/scss/content.scss'],
      },
      output: {
        filename: `js/${platform}-[name].js`,
        path: outputDir,
      },

      plugins: [
        ...prodPlugins(isProd, platform),
        new CopyWebpackPlugin([
          {
            from: `src/images/${platform}`,
            to: `${outputDir}/images`,
          },
          {
            from: 'config/config.json',
            to: `${outputDir}/config.json`,
            transform: (content) => updateConfig(content, platform),
          },
          {
            from: 'config/manifest-template.json',
            to: `${outputDir}/manifest.json`,
            transform: (content) => updateManifest(content, platform),
          },
        ]),
        new MiniCssExtractPlugin({
          filename: `css/${platform}-[name].css`,
          path: outputDir,
        }),
      ],
      module: {
        rules: [
          ...prodRules(isProd),
          {
            test: /\.m?js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
          },
          {
            test: /\.(html)$/,
            loader: 'mustache-loader?minify',
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
  });
};
