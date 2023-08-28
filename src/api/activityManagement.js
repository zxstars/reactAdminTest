/*
 * @Description: Description
 * @Author: Xiaohua Zhu
 * @Date: 2022-02-14 14:31:30
 * @LastEditors: Xiaohua Zhu
 * @LastEditTime: 2022-02-16 12:52:43
 */

import request from '../utils/request';

// 活动列表
export const getActivityList = (data) => request({
  url: 'activity/list',
  method: 'GET',
  data,
});

// 新增活动
export const addActivity = (data) => request({
  url: 'activity/save',
  method: 'POST',
  data,
});

// 更新活动
export const updateActivity = (data) => request({
  url: 'activity/update',
  method: 'PUT',
  data,
});

// 删除活动
export const deleteActivity = (id) => request({
  url: `activity/delete/${id}`,
  method: 'DELETE',
});

// 开启活动
export const enableActivity = (id) => request({
  url: `activity/enable/${id}`,
  method: 'PUT',
});

// 开启活动
export const disableActivity = (id) => request({
  url: `activity/disable/${id}`,
  method: 'PUT',
});

// 上传图片
export const uploadImage = (data) => request({
  url: 'activity/upload/image',
  method: 'POST',
  data,
});
