/* eslint-disable no-template-curly-in-string */
const {
  addCommitAnalyzerPlugin,
  addGitHubActionsOutputPlugin,
  addReleaseNotesGeneratorPlugin,
  addChangelogPlugin,
  addNpmPlugin,
} = require('@myparcel/semantic-release-config/src/plugins/index.js');
const {addGitHubPlugin, addGitPlugin} = require('@myparcel/semantic-release-config/src/plugins');
const mainConfig = require('@myparcel/semantic-release-config');

module.exports = {
  ...mainConfig,
  extends: '@myparcel/semantic-release-config',
  branches: [{name: 'main'}],
  plugins: [
    addCommitAnalyzerPlugin(),
    addGitHubActionsOutputPlugin(),
    addReleaseNotesGeneratorPlugin(),
    addChangelogPlugin(),
    addNpmPlugin({publish: false}),
    addGitHubPlugin(),
    addGitPlugin(),
  ],
};
