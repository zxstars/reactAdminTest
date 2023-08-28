/* eslint-disable func-names */
/*
 * @Author: your name
 * @Date: 2021-07-21 11:59:50
 * @LastEditTime: 2021-08-03 21:06:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \besta-admin-web\src\utils\util.js
 */
const utils = {
  // 防抖
  debounce(fn, delay) {
    let timer = null; // 借助闭包
    return function () {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(fn, delay); // 简化写法
    };
  },

  // 使用递归的方式实现数组、对象的深拷贝
  deepClone(obj) {
    const objClone = Array.isArray(obj) ? [] : {};
    if (obj && typeof obj === 'object') {
      // eslint-disable-next-line no-restricted-syntax
      for (const key in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(key)) {
          // 判断ojb子元素是否为对象，如果是，递归复制
          if (obj[key] && typeof obj[key] === 'object') {
            objClone[key] = utils.deepClone(obj[key]);
          } else {
            // 如果不是，简单复制
            objClone[key] = obj[key];
          }
        }
      }
    }
    return objClone;
  },


  throttle(func, delay) {
    let timer = null;
    return function () {
      const context = this;
      // eslint-disable-next-line prefer-rest-params
      const args = arguments;
      if (!timer) {
        timer = setTimeout(() => {
          func.apply(context, args);
          timer = null;
        }, delay);
      }
    };
  },

  /**
   * @param {*Blob} data blob数据源
   * @param {*string} filename 下载文件名
   * @description 下载文件
   */

  /* eslint-disable no-unreachable */
  down(data, filename, mime, bom) {
    debugger;
    const blobData = (typeof bom !== 'undefined') ? [bom, data] : [data];
    const blob = new Blob(blobData, { type: mime || 'application/octet-stream' });
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
      // IE workaround for "HTML7007: One or more blob URLs were
      // revoked by closing the blob for which they were created.
      // These URLs will no longer resolve as the data backing
      // the URL has been freed."
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const blobURL = (window.URL && window.URL.createObjectURL)
        ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = blobURL;
      tempLink.setAttribute('download', filename);

      // Safari thinks _blank anchor are pop ups. We only want to set _blank
      // target if the browser does not support the HTML5 download attribute.
      // This allows you to download files in desktop safari if pop up blocking
      // is enabled.
      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
      }

      document.body.appendChild(tempLink);
      tempLink.click();

      // Fixes "webkit blob resource error 1"
      setTimeout(() => {
        document.body.removeChild(tempLink);
        window.URL.revokeObjectURL(blobURL);
      }, 200);
    }
  },

  /**
   * @param  {String} data 图片展示的dataUrl
   * @param  {String} filename 文件名
   * @description 保存图片
   */
  saveFile(data, filename) {
    const saveLink = document.createElement('a');
    saveLink.href = data;
    saveLink.download = filename;
    const event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    saveLink.dispatchEvent(event);
  },
  /**
   * @param {*} record json数据
   * @param {*} fileName 文件名
   * @description 下载json数据文件
   */
  downloadObject(record, fileName) {
    // 创建隐藏的可下载链接
    const eleLink = document.createElement('a');
    eleLink.download = `${fileName}.json`;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    const blob = new Blob([JSON.stringify(record)]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
  },
  /**
   * @param  {String} creeatId  创建dom的id
   * @param  {String} style 样式
   * @description 在body创建节点
   */
  createDom(creeatId, style = '') {
    const dom = document.createElement('div');
    dom.setAttribute('id', creeatId);
    dom.setAttribute('style', style);
    document.body.appendChild(dom);
    return dom;
  },
  /**
   * @param  {String} delID  移除dom的id
   * @description 移除body上挂载的dom
   */
  delDom(delID) {
    document.body.removeChild(document.getElementById(delID));
  },
};

export default utils;
