const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const packageData = require('../package.json');
const path = require('path');
const webpack = require('webpack');
const {platforms} = require('../config/config');

/**
 * Plugins to use in production.
 *
 * @param {string} platform - Platform name.
 *
 * @returns {Array}
 */
const prodPlugins = (platform) => {
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
 * Plugins to use in staging.
 *
 * @param {string} platform - Platform name.
 *
 * @returns {Array}
 */
const stagePlugins = (platform) => {
  return [
    // Clean dist folder before building
    new CleanWebpackPlugin(),

    // Create zip file for extension
    new FileManagerPlugin({
      onEnd: {
        archive: [
          {
            source: `dist/staging-${platform}`,
            destination: `dist/staging-chrome-extension-${platform}-${packageData.version}.zip`,
          },
        ],
      },
    }),
  ];
};

/**
 * Rules to apply in production.
 *
 * @returns {Array}
 */
const prodRules = [
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

/**
 * Rules to apply in staging.
 *
 * @returns {Array}
 */
const stageRules = [];

/**
 * Modify the manifest file for each platform.
 *
 * @param {Buffer} buffer - File contents.
 * @param {string} platform - Platform name.
 * @param {string} env - Environment.
 *
 * @returns {string}
 */
const updateManifest = (buffer, platform, env) => {
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

  // Change some properties if it's a staging/test build
  if (env === 'staging') {
    newManifest.version_name = `${newManifest.version} beta`;
    newManifest.name += ' – Staging';
    newManifest.short_name += ' Staging';
  }

  return JSON.stringify(newManifest, null, 2);
};

/**
 * Modify the config file for each platform.
 *
 * @param {Buffer} buffer - File contents.
 * @param {string} platform - Platform name.
 * @param {string} env - Environment.
 *
 * @returns {string}
 */
const updateConfig = (buffer, platform, env) => {
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
 * Get extra rules based on environment.
 *
 * @param {string} env - Environment. Currently supports 'production' and 'staging'.
 *
 * @returns {Array}
 */
const getEnvironmentRules = (env) => {
  switch (env) {
    case 'production':
      return prodRules;
    case 'staging':
      return stageRules;
    default:
      return [];
  }
};

/**
 * Get extra plugins based on environment.
 *
 * @param {string} env - Environment. Currently supports 'production' and 'staging'.
 * @param {string} platform - Platform name.
 *
 * @returns {Array}
 */
const getEnvironmentPlugins = (env, platform) => {
  switch (env) {
    case 'production':
      return prodPlugins(platform);
    case 'staging':
      return stagePlugins(platform);
    default:
      return [];
  }
};

/**
 * Export a webpack config for each platform.
 *
 * @param {String} env - Environment. "development", "staging" or "production".
 *
 * @returns {Array.<Object>} - Array of webpack configs.
 */
module.exports = (env = 'production') => {
  return Object.keys(platforms).map((platform) => {

    /**
     * Output different dirs if environment is staging.
     *
     * @type {string}
     */
    const outputDir = env === 'staging'
      ? path.resolve(__dirname, `../dist/staging-${platform}`)
      : path.resolve(__dirname, `../dist/${platform}`);

    return {
      resolveLoader: {
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      },

      mode: 'production',
      entry: {
        background: './src/Background.js',
        content: ['./src/Content.js', `./src/scss/${platform}.scss`],
      },
      output: {
        filename: `js/${platform}-[name].js`,
        path: outputDir,
      },
      plugins: [
        ...(getEnvironmentPlugins(env, platform)),
        new CopyWebpackPlugin([
          {
            from: `src/images/${platform}`,
            to: `${outputDir}/images`,
          },
          {
            from: 'config/config.json',
            to: `${outputDir}/config.json`,
            transform: (content) => updateConfig(content, platform, env),
          },
          {
            from: 'config/manifest-template.json',
            to: `${outputDir}/manifest.json`,
            transform: (content) => updateManifest(content, platform, env),
          },
        ]),
        new MiniCssExtractPlugin({
          filename: `css/${platform}-[name].css`,
          path: outputDir,
        }),
      ],
      module: {
        rules: [
          ...(getEnvironmentRules(env)),
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
