module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    webextensions: true,
  },
  overrides: [
    {
      files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
      extends: [
        '@myparcel-dev/eslint-config-node',
        '@myparcel-dev/eslint-config-esnext',
        '@myparcel-dev/eslint-config-prettier',
        '@myparcel-dev/eslint-config-import',
      ],
    },
    {
      files: ['**/*.ts'],
      extends: [
        '@myparcel-dev/eslint-config-node',
        '@myparcel-dev/eslint-config-esnext',
        '@myparcel-dev/eslint-config-prettier-typescript',
        '@myparcel-dev/eslint-config-import',
      ],
      rules: {
        '@typescript-eslint/no-misused-promises': 'off',
        'class-methods-use-this': 'off',

        // Turn these off to avoid being tempted to refactor the whole project now
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-extraneous-class': 'off',
      },
    },
  ],
};
