
import request from '../utils/request';


// 获取vspr管理列表
export const getVSPRList = (data) => request({
  url: '/virtual/manager/list',
  method: 'GET',
  data,
});
// 获取vspr管理列表
export const getVSPRNodeList = (data) => request({
  url: '/virtual/manager/list/node',
  method: 'GET',
  data,
});


// 获取指定查询vspr
export const getVSPRById = (data) => request({
  url: '/virtual/manager/one',
  method: 'GET',
  data,
});


// 删除指定查询vspr
export const deleteVSPR = (data) => request({
  url: '/virtual/manager/delete',
  method: 'DELETE',
  data,
});


// 更新渲染状态
export const createVSPRByCode = (data) => request({
  url: '/virtual/manager/render/status',
  method: 'PUT',
  data,
});

// 高清渲染回调
export const renderCallback = (data) => request({
  url: '/virtual/manager/render/callback',
  method: 'POST',
  data,
});

// 更新渲染状态
export const updateSort = (data) => request({
  url: '/virtual/manager/update',
  method: 'PUT',
  data,
});

// 查询 template_json 信息
export const getTemplateJson = (data) => request({
  url: '/virtual/template-json',
  method: 'GET',
  data,
});

// 查询场景内配信息
export const getSceneInternal = () => request({
  url: '/virtual/scene-internal',
  method: 'GET',
});

// 替换功能
export const replacement = (data) => request({
  url: '/virtual/replace',
  method: 'POST',
  data,
});

// 上传图片
export const uploadImage = (data) => request({
  url: '/virtual/upload',
  method: 'POST',
  data,
});
// 新增功能
export const addVSPR = (data) => request({
  url: '/virtual/save',
  method: 'POST',
  data,
});

// 导出功能
export const exportExcel = (data) => request({
  url: '/virtual/exportExcel',
  method: 'POST',
  data,
  responseType: 'blob', // 注意
});

// 推送
export const pushDTC = (data) => request({
  url: '/virtual/pushDTC',
  method: 'POST',
  data,
});

