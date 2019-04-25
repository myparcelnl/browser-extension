module.exports = {
  env: {
    node: true,
    browser: true,
    webextensions: true,
    jquery: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: ['../myparcel-core/dmp-standards/eslint/eslint-es6.config.js'],
};
