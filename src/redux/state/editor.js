/*
 * @Description: Description
 * @Author: Kun Yang
 * @Date: 2021-07-28 10:08:56
 * @LastEditors: Kun Yang
 * @LastEditTime: 2022-01-09 19:57:07
 */
export const defaultSate = {
  cabinetCount: null, // 画布柜体个数，动态计算柜体的个数
  cabinetHeights: [], // 画布柜体个数，动态计算柜体的高度
  isFirstStep: null, // 画布是否有柜体
  chooseCabinetCurrent: null, // 选中第几个柜体
  chooseCabinetDoorCurrent: null, // 选中第几个柜体的第几个门板
  stepCurrent: 0, // editor操作的第几步 0 - 第一步 ....
  chooseToppanel: false, // 是否选择了顶板
  chooseLeg: false, // 是否选择了桌角
  loading: false, // 全局loading状态
  editData: null, // 编辑mcc的templateJSon
  enterPartsCount: true, // 进入配件选择的次数
};

const state = {
  defaultPos: {}, // 画布数据
  ...defaultSate,
  // cabinetCount: null, // 画布柜体个数，动态计算柜体的个数
  // cabinetHeights: [], // 画布柜体个数，动态计算柜体的高度
  // isFirstStep: null, // 画布是否有柜体
  // chooseCabinetCurrent: null, // 选中第几个柜体
  // chooseCabinetDoorCurrent: null, // 选中第几个柜体的第几个门板
  // stepCurrent: 0, // editor操作的第几步 0 - 第一步 ....
};

export default state;
