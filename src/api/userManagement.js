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

// 查询用户
export const queryUserList = (data) => request({
  url: 'user/list',
  method: 'GET',
  data,
});

// 新增用户
export const userSave = (data) => request({
  url: 'user/save',
  method: 'POST',
  data,
});

// 删除用户
export const userDelete = (id) => request({
  url: `user/delete/${id}`,
  method: 'DELETE',
});

// 修改用户
export const userUpdate = (data) => request({
  url: 'user/update',
  method: 'PUT',
  data,
});

// 角色列表
export const getRoleList = (data) => request({
  url: 'role/select/list',
  method: 'GET',
  data,
});

// BU下拉列表
export const getCountrySelect = (data) => request({
  url: 'country/select/list',
  method: 'GET',
  data,
});

// 门店下拉列表
export const getStoreSelect = (data) => request({
  url: 'store/select/list',
  method: 'GET',
  data,
});

// 重置密码
export const putPasswordReset = (data) => request({
  url: 'user/password/reset',
  method: 'PUT',
  data,
});

export const userEnable = (id) => request({
  url: `user/enable/${id}`,
  method: 'PUT',
});

export const userDisable = (id) => request({
  url: `user/disable/${id}`,
  method: 'PUT',
});
