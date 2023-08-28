/*
 * @Description: Description
 * @Author: Kun Yang
 * @Date: 2021-07-21 11:59:50
 * @LastEditors: Kun Yang
 * @LastEditTime: 2021-08-21 15:28:39
 */
const apis = {
  login: {
    authCode: '/auth/code', // 验证码
    authLogin: '/auth/login', // 登陆
    menuList: '/menu/build', // 用户菜单权限
  },
  editor: {
    getCabinetColor: '/component/color/list', // 获取柜体颜色
    getStructureColor: '/structure/replace/list', // 替换柜体颜色
    getDefaultCabinetStructure: '/structure/default', // 获取默认的柜体结构
    getAllCabinetStructure: '/structure/select/list', // 获取不同类型的柜体结构
    getDoorColorLists: '/appearance/color/select/list', // 获取门板颜色列表
    getDoorInfoLists: '/appearance/select/list', // 获取门板信息
    getPartsLists: '/component/select/list', // 获取桌角列表
    getToppanelLists: '/component/roof/color/list', // 获取顶板列表
    getToppane2dlLists: '/component/roof/list', // 获取顶板尺寸分块数据
    getTv: '/propIn/select/list', // 获取电视机数据
    getProductLists: '/mcc/template/product/list', // 商品清单
    saveMcc: '/mcc/template/save', // 保存MCC
  },
  test: 'http://hm45pd.natappfree.cc/billy-admin-api',


};

export default apis;
