
import request from '../utils/request';


// 获取热销门板分页
export const getDoorList = (data) => request({
  url: '/display/door/query/list',
  method: 'GET',
  data,
});

// 获取指定查询热销门板
export const getDoorById = (id) => request({
  url: `/display/door/query/${id}`,
  method: 'GET',
});

// 创建指定查询热销门板
export const createDoorByCode = (data) => request({
  url: '/display/door/create',
  method: 'POST',
  data,
});

// 删除指定查询热销门板
export const deleteDoor = (id) => request({
  url: `/display/door/delete/${id}`,
  method: 'DELETE',
});

// 上架
export const upDoor = (id) => request({
  url: `/display/door/up/${id}`,
  method: 'PUT',
});

// 下架
export const downDoor = (id) => request({
  url: `/display/door/down/${id}`,
  method: 'PUT',
});
