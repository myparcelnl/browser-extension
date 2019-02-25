module.exports = {
  env: {
    node: true,
    browser: true,
    webextensions: true,
    jquery: true,
  },
  extends: '../myparcel-core/dmp-standards/eslint/.eslintrc.es6.js',
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  }
};
