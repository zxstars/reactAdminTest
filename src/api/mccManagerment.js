/*
 * @Description: Description
 * @Author: Kun Yang
 * @Date: 2021-11-25 15:00:30
 * @LastEditors: Kun Yang
 * @LastEditTime: 2021-12-30 10:41:37
 */
import request from '../utils/request';

export const mccUpdate = (data) => request({
  url: '/mcc/update',
  method: 'PUT',
  data,
});

export const deleteMcc = (id) => request({
  url: `/mcc/remove/${id}`,
  method: 'DELETE',
});


export const getMccList = (data) => request({
  url: '/mcc/list',
  method: 'GET',
  data,
});
//  组合池获取列表
export const getMccTemplateList = (data) => request({
  url: '/mcc/template/list',
  method: 'GET',
  data,
});
// 组合池编辑
export const getMccTemplateById = (id) => request({
  url: `/mcc/template/get/${id}`,
  method: 'GET',
});

// 更新组合池
export const mccTemplateUpdate = (data) => request({
  url: '/mcc/template/update',
  method: 'PUT',
  data,
});
// 删除组合池
export const deleteCombine = (data) => request({
  url: '/mcc/template/update',
  method: 'PUT',
  data,
});
// 删除组合池
export const getMccSimple = (data) => request({
  url: '/mcc/template/update',
  method: 'PUT',
  data,
});
// 删除组合池
export const mccTemplateAdd = (data) => request({
  url: '/mcc/template/update',
  method: 'PUT',
  data,
});

// 上传图片
export const uploadImage = (data) => request({
  url: '/mcc/template/upload/image',
  method: 'POST',
  data,
});
// 设置MCC
export const setMcc = (id) => request({
  url: `/mcc/template/set/${id}`,
  method: 'POST',
});
// 删除组合池的mcc
export const deleteCombinedPoolMcc = (id) => request({
  url: `/mcc/template/delete/${id}`,
  method: 'delete',
});
