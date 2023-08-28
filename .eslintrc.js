/*
 * @Description: Description
 * @Author: Kun Yang
 * @Date: 2021-07-21 11:59:50
 * @LastEditors: Kun Yang
 * @LastEditTime: 2021-08-28 17:32:01
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  settings: {
    react: {
      version: '17.x',
    },
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'airbnb'],
  plugins: ['react', 'react-hooks'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2015,
    sourceType: 'module',
  },
  // ignorePatterns: ['config/*.js', 'scripts/*.js'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    // 'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['off'],
    'no-debugger': ['off'],
    'max-lines': ['error', { max: 1000, skipBlankLines: true }], // 每个文件不算空行，最多600行
    'max-len': ['error', 120, 2], // 单行最多120
    'max-statements': ['error', 80], // 单个函数最多80行
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }], // 空行最多不能超过2行
    'max-depth': ['error', 4], // 代码最多允许4层嵌套
    'no-unneeded-ternary': ['error'], // 禁止不必要的嵌套 var isYes = answer === 1 ? true : false;简单的判断用三元表达式代替
    'react/react-in-jsx-scope': ['off'],
    'react/jsx-filename-extension': ['off'],
    'react/prop-types': 0, // 防止在react组件定义中缺少props验证
    'import/no-unresolved': [1,
      {
        ignore: ['^@'],
      },
    ], // 需要对应umi配置对应的alias
    'linebreak-style': [0, 'error', 'windows'], // 允许windows开发环境 LF CRLF
    'react/forbid-prop-types': [0, { forbid: ['object'] }],
    'no-plusplus': [0], // 一元运算符
    'no-param-reassign': [0], // 函数参数直接赋值
    'react/no-array-index-key': [0], // 遍历下标作为key
    'array-callback-return': [0], // 箭头函数必须要返回值
    'consistent-return': [0], // 箭头函数必须要返回值
    'prefer-destructuring': [0],
    'react/jsx-props-no-spreading': [0],
    'import/extensions': ['off', 'always', {
      js: 'never', ts: 'never', jsx: 'never', vue: 'never',
    }],
    'import/order': [0], // MAC  @导入问题
  },
};
