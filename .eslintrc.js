module.exports = {
  env: {
    node: true,
    browser: true,
    webextensions: true,
    jquery: true,
    jest: true,
  },
  extends: '../myparcel-core/dmp-standards/eslint/.eslintrc.es6.js',
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 10,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
