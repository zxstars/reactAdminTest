/* eslint-disable import/prefer-default-export */
/*
 * @Description: Description
 * @Author: Kun Yang
 * @Date: 2021-08-12 13:22:40
 * @LastEditors: Kun Yang
 * @LastEditTime: 2021-08-21 15:32:38
 */

import apis from '@/config/api';
import request from '../utils/request';

// 获取默认柜体内部结构数据
export const getCabinetStructure = (data = {}) => request({
  url: apis.editor.getDefaultCabinetStructure,
  method: 'get',
  data,
});

// 获取一个尺寸所有柜体内部结构数据
export const getAllCabinetStructure = (data = {}) => request({
  url: apis.editor.getAllCabinetStructure,
  method: 'get',
  data,
});

// 获取柜体颜色
export const getCabinetColor = (data = {}) => request({
  url: apis.editor.getCabinetColor,
  method: 'get',
  data,
});
// 获取柜体颜色
export const getStructureColor = (data = {}) => request({
  url: apis.editor.getStructureColor,
  method: 'post',
  data,
});

// 获取门板列表颜色
export const getDoorColorLists = (data = {}) => request({
  url: apis.editor.getDoorColorLists,
  method: 'get',
  data,
});

// 获取选中的门板信息
export const getDoorInfoLists = (data = {}) => request({
  url: apis.editor.getDoorInfoLists,
  method: 'post',
  data,
});

// 获取桌角
export const getPartsLists = (data = {}) => request({
  url: apis.editor.getPartsLists,
  method: 'get',
  data,
});
// 获取顶板
export const getTopPanelLists = (data = {}) => request({
  url: apis.editor.getToppanelLists,
  method: 'get',
  data,
});
// 获取顶板
export const getToppane2dlLists = (data = {}) => request({
  url: apis.editor.getToppane2dlLists,
  method: 'post',
  data,
});
// 获取电视机
export const getTv = (data = {}) => request({
  url: apis.editor.getTv,
  method: 'get',
  data,
});
// 获取商品清单
export const getProductLists = (data = {}) => request({
  url: apis.editor.getProductLists,
  method: 'post',
  data,
});
// 保存Mcc
export const saveMcc = (data = {}) => request({
  url: apis.editor.saveMcc,
  method: 'post',
  data,
});
