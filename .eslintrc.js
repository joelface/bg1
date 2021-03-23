module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      { accessibility: 'no-public' },
    ],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-parameter-properties': ['off'],
    curly: ['error', 'multi-line'],
    'object-shorthand': ['error', 'always'],
    'react/no-unescaped-entities': ['error', { forbid: ['>', '"', '}'] }],
    'prettier/prettier': 'error',
  },
  settings: {
    react: {
      version: 'detect',
      pragma: 'h',
    },
  },
};
