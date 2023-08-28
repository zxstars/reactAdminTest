/*
 * @Author: jiangli.zhou
 * @Date: 2021-07-21 13:54:16
 * @LastEditTime: 2021-12-31 17:46:29
 * @LastEditors: Kun Yang
 * @Description: In User Settings Edit`
 * @FilePath: \besta-admin-web\src\setupProxy.js
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(createProxyMiddleware('/api', {
    // target: 'http://api.pacteraedge.com:8084',
    // target: 'http://172.16.84.52:8080',
    target: 'https://besta-admin-web-qa.aidesign.ingka-dt.cn/', // qa
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      '^/api': '',
    },
  }));
};
