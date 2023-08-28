/*
 * @Author: jiangli.zhou
 * @Date: 2021-07-19 09:39:00
 * @LastEditTime: 2021-07-22 09:55:55
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \kitchen-admin-web\src\api\storeManagement.js
 */

import request from '../utils/request';

// 门店列表
export const getStoreList = (data) => request({
  url: 'store/list',
  method: 'GET',
  data,
});

// BU下拉列表
export const getCountrySelect = (data) => request({
  url: 'country/select/list',
  method: 'GET',
  data,
});

// 新增门店
export const postStoreSave = (data) => request({
  url: 'store/save',
  method: 'POST',
  data,
});

// 修改门店
export const putStoreUpdate = (data) => request({
  url: 'store/update',
  method: 'PUT',
  data,
});

// 删除用户
export const deleteStore = (id) => request({
  url: `store/delete/${id}`,
  method: 'DELETE',
});

