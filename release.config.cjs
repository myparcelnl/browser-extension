/* eslint-disable no-template-curly-in-string */
const {
  addCommitAnalyzerPlugin,
  addGitHubActionsOutputPlugin,
  addReleaseNotesGeneratorPlugin,
  addChangelogPlugin,
  addNpmPlugin,
} = require('@myparcel-dev/semantic-release-config/src/plugins');
const {addGitHubPlugin, addGitPlugin} = require('@myparcel-dev/semantic-release-config/src/plugins');
const mainConfig = require('@myparcel-dev/semantic-release-config');

module.exports = {
  ...mainConfig,
  extends: '@myparcel-dev/semantic-release-config',
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
