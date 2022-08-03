module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    /* 
      Turned no-undef and no-unused-vars rules off as they were flagging valid code
      May need a react / ts plugin or different parser to fix
    */
    'no-undef': 0,
    'no-unused-vars': 0
  },
  parser: '@typescript-eslint/parser'
};
