const prodConfig = require('./webpack.prod.conf.js');

module.exports = (env, argv) => {
  const config = [];

  const stageConfig = {
    devtool: 'eval-source-map',
  };

  // Merge stage configuration into all prod configs.
  prodConfig(env, argv).forEach((prodConfig) => {
    config.push({
      ...prodConfig,
      ...stageConfig,
    });
  });

  return config;
};
