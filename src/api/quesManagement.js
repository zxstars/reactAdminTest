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

// 更新问卷
export const questionUpdate = (data) => request({
  url: 'question/update',
  method: 'PUT',
  data,
});

// 新增问卷
export const questionSave = (data) => request({
  url: 'question/save',
  method: 'POST',
  data,
});

// 删除问卷
export const questionDelete = (id) => request({
  url: `question/delete/${id}`,
  method: 'DELETE',
});


// 问卷列表
export const questionList = (data) => request({
  url: 'question/list',
  method: 'GET',
  data,
});

// 查询单个问题
export const getQuestion = (id) => request({
  url: `question/get/${id}`,
  method: 'GET',
});
