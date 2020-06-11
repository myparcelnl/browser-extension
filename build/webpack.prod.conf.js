const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const {injectVariable} = require('./helpers/injectVariable');
const fs = require('fs');
const packageData = require('../package.json');
const path = require('path');
const webpack = require('webpack');
const {platforms: platformConfig} = require('../config/config');

const ENV_STAGING = 'staging';
const ENV_PRODUCTION = 'production';

/**
 * Plugins to use in production.
 *
 * @param {String} platform - Platform name.
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
 * @param {String} platform - Platform name.
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
 * @param {Buffer} content - File contents.
 * @param {String} platform - Platform name.
 * @param {String} env - Environment.
 *
 * @returns {String}
 */
const updateManifest = (content, platform, env) => {
  const environmentSuffix = env === 'production' ? '' : env;
  const configDir = path.resolve(__dirname, '../', 'config');
  let overrideManifest = {};

  // Turn the JSON string into an object and replace platform placeholder strings with actual platform name.
  const templateManifest = JSON.parse(content.toString());

  if (fs.existsSync(`${configDir}/manifest-override-${env}.json`)) {
    const overrideFile = fs.readFileSync(`${configDir}/manifest-override-${env}.json`);
    overrideManifest = JSON.parse(overrideFile.toString());
  }

  let newManifest = {
    // Start with the template data
    ...templateManifest,
    // Add the override data.
    ...overrideManifest,
    // Get manifest data from platform config
    ...platformConfig[platform].manifest,
    // Copy the version from package.json
    version: packageData.version,
    version_name: `${packageData.version}${environmentSuffix ? `-${environmentSuffix}` : ''}`,
  };

  // Add the platform variable.
  newManifest = injectVariable(newManifest, '__MSG_platform__', platform);

  // Suffix the name with the uppercased environment suffix.
  newManifest.name += ` ${environmentSuffix.charAt(0).toUpperCase()}${environmentSuffix.slice(1)}`;

  return JSON.stringify(newManifest, null, 2);
};

/**
 * Modify the config file for each platform.
 *
 * @param {Buffer} buffer - File contents.
 * @param {String} platform - Platform name.
 *
 * @returns {String}
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
 * Get extra rules based on environment.
 *
 * @param {String} env - Environment. Currently supports 'production' and 'staging'.
 *
 * @returns {Array}
 */
const getEnvironmentRules = (env) => {
  switch (env) {
    case ENV_PRODUCTION:
      return prodRules;
    case ENV_STAGING:
      return stageRules;
    default:
      return [];
  }
};

/**
 * Get extra plugins based on environment.
 *
 * @param {String} env - Environment. Currently supports 'production' and 'staging'.
 * @param {String} platform - Platform name.
 *
 * @returns {Array}
 */
const getEnvironmentPlugins = (env, platform) => {
  switch (env) {
    case ENV_PRODUCTION:
      return prodPlugins(platform);
    case ENV_STAGING:
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
module.exports = (env = ENV_PRODUCTION) => {
  return Object.keys(platformConfig).map((platform) => {
    const environmentPrefix = env === ENV_PRODUCTION ? '' : `${env}-`;

    /**
     * Output different dirs if environment is staging.
     *
     * @type {String}
     */
    const outputDir = path.resolve(__dirname, `../dist/${environmentPrefix}${platform}`);

    return {
      resolveLoader: {
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      },

      mode: ENV_PRODUCTION,
      entry: {
        background: './src/Background.js',
        content: ['./src/Content.js', `./src/scss/${platform}.scss`],
      },
      output: {
        filename: `js/${platform}-[name].js`,
        path: outputDir,
      },
      plugins: [
        ...getEnvironmentPlugins(env, platform),
        new CopyWebpackPlugin({
          patterns: [
            /**
             * Copy the image assets.
             */
            {
              from: `src/images/${platform}`,
              to: `${outputDir}/images`,
            },

            /**
             * Copy the configuration.
             */
            {
              from: 'config/config.json',
              to: `${outputDir}/config.json`,
              transform: (content) => updateConfig(content, platform),
            },

            /**
             * Copy options directory if environment is not prod.
             */
            ...env === ENV_PRODUCTION
              ? []
              : [{
                from: 'config/options',
                to: `${outputDir}/options`,
              }],

            /**
             * Transform the manifest templates by platform and environment.
             */
            {
              from: 'config/manifest-template.json',
              to: `${outputDir}/manifest.json`,
              transform: (content) => updateManifest(content, platform, env),
            },
          ],
        }),
        new MiniCssExtractPlugin({
          filename: `css/${platform}-[name].css`,
          path: outputDir,
        }),
      ],
      module: {
        rules: [
          ...getEnvironmentRules(env),
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
