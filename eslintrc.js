module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    /* 
        Turned off no-undef and no-unused-vars rules as they were flagging a lot of code
        Possibly caused by lack of react plugin or wrong parser
    */
    'no-undef': 0,
    'no-unused-vars': 0
  },
  parser: '@typescript-eslint/parser'
};
