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
        '@myparcel-eslint/eslint-config-node',
        '@myparcel-eslint/eslint-config-esnext',
        '@myparcel-eslint/eslint-config-prettier',
        '@myparcel-eslint/eslint-config-import',
      ],
    },
    {
      files: ['**/*.ts'],
      extends: [
        '@myparcel-eslint/eslint-config-node',
        '@myparcel-eslint/eslint-config-esnext',
        '@myparcel-eslint/eslint-config-prettier-typescript',
        '@myparcel-eslint/eslint-config-import',
      ],
      rules: {
        '@typescript-eslint/no-misused-promises': 'off',
        'class-methods-use-this': 'off',

        // Turn these off to avoid being tempted to refactor the whole project now
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-extraneous-class': 'off',
      },
    },
  ],
};
