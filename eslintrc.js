module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error']
  },
  parser: '@typescript-eslint/parser'
};
