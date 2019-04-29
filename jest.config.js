/**
 * @see https://jestjs.io/docs/en/configuration.html
 * @type {jest.ProjectConfig}
 */
module.exports = {
  preset: 'jest-puppeteer',
  setupFiles: [
    'jest-webextension-mock',
  ],
};
