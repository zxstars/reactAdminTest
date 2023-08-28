/* eslint-disable import/prefer-default-export */
/*
 * @Author: jiangli.zhou
 * @Date: 2021-07-13 10:16:31
 * @LastEditTime: 2021-07-20 16:45:18
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \kitchen-admin-web\src\api\login.js
 */

import request from '../utils/request';

// 商品上架
export const productUp = (id) => request({
  url: `/product/up/${id}`,
  method: 'PUT',
});


export const productDown = (id) => request({
  url: `/product/down/${id}`,
  method: 'PUT',
});


// 编辑商品
export const productUpdate = (data) => request({
  url: '/product/update',
  method: 'PUT',
  data,
});

// 商品下拉列表
export const productSelectList = (data) => request({
  url: '/product/type/select/list',
  method: 'GET',
  data,
});


// 商品列表
export const productList = (data) => request({
  url: '/product/list',
  method: 'GET',
  data,
});

