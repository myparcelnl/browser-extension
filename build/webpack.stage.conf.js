const prodConfig = require('./webpack.prod.conf.js');

module.exports = (env) => {
  const config = [];

  const stageConfig = {
    devtool: 'source-map',
  };

  // Merge stage configuration into all prod configs.
  prodConfig(env.NODE_ENV).forEach((prodConfig) => {
    config.push({
      ...prodConfig,
      ...stageConfig,
    });
  });

  return config;
};
