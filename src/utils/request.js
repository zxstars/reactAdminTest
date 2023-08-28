/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/*
 * @Author: your name
 * @Date: 2021-07-12 17:40:07
 * @LastEditTime: 2021-08-12 13:56:09
 * @LastEditors: Kun Yang
 * @Description: In User Settings Edit
 * @FilePath: \kitchen-admin-web\src\utils\request.js
 */
import axios from 'axios';
import { cloneDeep, isEmpty } from 'lodash';
import pathToRegexp from 'path-to-regexp';
import { message, Modal } from 'antd';
import { CANCEL_REQUEST_MESSAGE } from '@/config/const';
import Cookies from 'js-cookie';
import utils from '@/utils/util';

let count = 0;

const { CancelToken } = axios;
window.cancelRequest = new Map();
const baseUrl = process.env.REACT_APP_BASE_REQUEST_URL;
export default function request(options) {
  // eslint-disable-next-line prefer-const
  let { data, url, method = 'get' } = options;
  const cloneData = cloneDeep(data);

  try {
    let domain = '';
    const urlMatch = url.match(/[a-zA-z]+:\/\/[^/]*/);
    if (urlMatch) {
      [domain] = urlMatch;
      url = url.slice(domain.length);
    }

    const match = pathToRegexp.parse(url);
    url = pathToRegexp.compile(url)(data);

    // eslint-disable-next-line no-restricted-syntax
    for (const item of match) {
      if (item instanceof Object && item.name in cloneData) {
        delete cloneData[item.name];
      }
    }
    url = domain + url;
  } catch (e) {
    message.error(e.message);
  }

  options.url = url;
  if (method.toUpperCase() === 'GET') {
    options.params = cloneData;
  } else if (method.toUpperCase() === 'POST') {
    options.data = cloneData;
  }
  options.cancelToken = new CancelToken((cancel) => {
    window.cancelRequest.set(Symbol(Date.now()), {
      pathname: window.location.pathname,
      cancel,
    });
  });

  // 第一步，创建实例
  const service = axios.create({
    baseURL: baseUrl,
    timeout: 60000,
  });

  // 第二步，请求拦截
  service.interceptors.request.use(
    // 请求发生前处理
    (config) => {
      config.headers = {
        'Content-Type': 'application/json',
      };
      console.log(config);
      const PublicToken = Cookies.get('Authorization');
      if (PublicToken) {
        config.headers.Authorization = PublicToken;
      }
      return config;
    },
    // 请求错误处理
    (error) => Promise.reject(error),
  );

  // 第三步，响应阻拦
  service.interceptors.response.use(
    // 响应数据处理
    // (response) => response.data,
    (response) => {
      if (response.data instanceof Blob) {
        return response;
        // utils.down(response.data, response.headers.filename);
      }
      return response.data;
    },
    // 响应错误处理
    (error) => Promise.reject(error)
    ,
  );

  return service(options)
    .then((response) => {
      const {
        data, errorMsg, errorCode,
      } = response;
      let{ success } = response;
      let result = {};
      if (response.status === 200) {
        success = true;
      }

      if (data && typeof data === 'object') {
        result = data;
        if (Array.isArray(data)) {
          result.list = data;
        }
        if (response.data instanceof Blob) {
          result.data = data;
          result.success = success;
          result.filename = response.headers.filename;
        }
      } else {
        result.data = data;
        result.success = success;
      }
      if (!success) {
        if (errorCode === 'token fail') {
          count += 1;
          if (count <= 1) {
            Modal.error({
              title: '错误提示',
              content: '当前账号失效，请重新登录',
              okText: '确定',
              onOk: () => {
                count = 0;
                window.location.hash = '#/login';
              },
            });
          }
        } else {
          message.error(errorMsg);
        }
      }
      return Promise.resolve({
        success,
        message: errorMsg,
        ...result,
        errorCode,
      });
    })
    .catch((error) => {
      const { response, message } = error;

      if (String(message) === CANCEL_REQUEST_MESSAGE) {
        return {
          success: false,
        };
      }

      let msg;
      let statusCode;

      if (response && response instanceof Object) {
        const { data, statusText } = response;
        statusCode = response.status;
        msg = data.message || statusText;
      } else {
        statusCode = 600;
        msg = error.message || 'Network Error';
      }

      return Promise.reject({
        success: false,
        statusCode,
        message: msg,
      });
    });
}
