
import request from '../utils/request';


// 获取首页分页
export const getHomeList = (data) => request({
  url: '/display/home/query/list',
  method: 'GET',
  data,
});

// 获取指定查询首页
export const getHomeById = (id) => request({
  url: `/display/home/query/${id}`,
  method: 'GET',
});
// 获取指定查询首页
export const getmccBycode = (code) => request({
  url: `/mcc/template/${code}`,
  method: 'GET',
});

// 创建指定查询首页
export const createHomeByCode = (data) => request({
  url: '/display/home/create',
  method: 'POST',
  data,
});

// 更新指定查询首页
export const updateHomeByCode = (data) => request({
  url: '/display/home/update',
  method: 'PUT',
  data,
});

// 删除指定查询首页
export const deleteHome = (id) => request({
  url: `/display/home/delete/${id}`,
  method: 'DELETE',
});

// 上架
export const upHome = (id) => request({
  url: `/display/home/up/${id}`,
  method: 'PUT',
});
// 下架
export const downHome = (id) => request({
  url: `/display/home/down/${id}`,
  method: 'PUT',
});

// 上传图片
export const uploadHomeImage = (data) => request({
  url: '/display/home/upload/image',
  method: 'POST',
  data,
});
