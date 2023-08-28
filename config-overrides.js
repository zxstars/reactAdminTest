const {
  override, addDecoratorsLegacy, addWebpackAlias, fixBabelImports,
} = require('customize-cra');

const path = require('path');

function pathResolve(pathUrl) {
  return path.join(__dirname, pathUrl);
}


module.exports = override(
  // 配置装饰器
  addDecoratorsLegacy(),
  // 配置目录别名
  addWebpackAlias({
    '@': pathResolve('./src'),
  }),
  // antd组件css样式全局引入
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: 'css',
  }),
);
