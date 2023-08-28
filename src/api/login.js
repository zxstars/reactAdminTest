/* eslint-disable import/prefer-default-export */
/*
 * @Author: jiangli.zhou
 * @Date: 2021-07-13 10:16:31
 * @LastEditTime: 2021-07-21 14:23:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \besta-admin-web\src\api\login.js
 */

import apis from '@/config/api';
import request from '../utils/request';


// 获取图像验证码
export const authCode = (data = {}) => request({
  url: apis.login.authCode,
  method: 'get',
  data,
});

// 登录
export const authLogin = (data) => request({
  url: apis.login.authLogin,
  method: 'post',
  data,
});

// 菜单
export const getMenuList = (data) => request({
  url: apis.login.menuList,
  method: 'get',
  data,
});

// 修改密码
export const putPasswordUpdate = (data) => request({
  url: '/auth/password/update',
  method: 'PUT',
  data,
});
