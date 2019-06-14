const prodConfig = require('./webpack.prod.conf.js');

module.exports = () => {
  const config = [];

  const stageConfig = {
    devtool: 'source-map',
  };

  // Merge stage configuration into all prod configs.
  prodConfig('staging').forEach((prodConfig) => {
    config.push({
      ...prodConfig,
      ...stageConfig,
    });
  });

  return config;
};
