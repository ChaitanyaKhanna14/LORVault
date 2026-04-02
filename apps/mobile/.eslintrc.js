module.exports = {
  extends: ['expo'],
  rules: {
    // Disable rules that require newer @typescript-eslint versions
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-wrapper-object-types': 'off',
    '@typescript-eslint/array-type': 'off',
    // Other rules
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'import/order': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/', '.expo/'],
};
