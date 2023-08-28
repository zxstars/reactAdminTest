/* eslint-disable no-var */
/*
 * @Author: your name
 * @Date: 2021-07-20 15:19:40
 * @LastEditTime: 2021-08-28 16:53:56
 * @LastEditors: Kun Yang
 * @Description: In User Settings Edit
 * @FilePath: \kitchen-admin-web\src\routes\index.js
 */

// 登录
import { Login } from '@/pages/login';
// editor
import Editor from '@/pages/editor/editor';

// 404
import notFound from '@/pages/error/notFound';
// import UserManagement from '@/pages/userManagement';
// import MccManagement from '@/pages/mccManagement';
import HotPanel from '@/pages/hotPanel';
// import ActivityManagement from '@/pages/activityManagement';
// import QuesManagement from '@/pages/quesManagement';
// import Commodity from '@/pages/commodity';
// import Combinedpool from '@/pages/combinedPool';
import HomePageTool from '@/pages/homePageTool';
import BillyVirtualSpr from '@/pages/billyVirtualSpr';

// 主要路由
export const mainRoutes = [
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/editor',
    component: Editor,
  },
  {
    path: '/404',
    component: notFound,
  },
];

/**
 * @param {*string} path 路由
 * @param {*comp} component 组件
 * @param {*boolean} exact 路由是否严格模式
 * @param {*boolean} isShow 是否显示
 * @param {*string} title 左侧菜单栏和面包签名称
 * @param {*string} icon 图标
 * @param {*boolean} route 面包签中不能进行点击则加上route
 * @param {*Array} childrens  嵌套路由 --- 参数同上
 * @description 菜单路由
 */
export const adminRoutes = [
  // {
  //   path: '/userManagement',
  //   component: UserManagement,
  //   exact: true,
  //   isShow: true,
  //   title: '用户管理',
  //   icon: 'dashboard',
  //   route: true,
  // },
  // {
  //   path: '/activityManagement',
  //   component: ActivityManagement,
  //   exact: true,
  //   isShow: true,
  //   title: '活动管理',
  //   icon: 'dashboard',
  //   route: true,
  //   parentId: '68',
  // },
  // {
  //   path: '/mccManagement',
  //   component: MccManagement,
  //   exact: true,
  //   isShow: true,
  //   title: 'MCC管理',
  //   icon: 'dashboard',
  //   route: true,
  // },
  {
    path: '/homePageTool',
    component: HomePageTool,
    exact: true,
    isShow: true,
    title: '首页展示',
    icon: 'dashboard',
    route: true,
  },
  {
    path: '/hotPanel',
    component: HotPanel,
    exact: true,
    isShow: true,
    title: '热销门板',
    icon: 'dashboard',
    route: true,
  },
  {
    path: '/billyVirtualSpr',
    component: BillyVirtualSpr,
    exact: true,
    isShow: true,
    title: 'BILLY Virtual SPR',
    icon: 'dashboard',
    route: true,
  },
  // {
  //   path: '/commodity',
  //   component: Commodity,
  //   exact: true,
  //   isShow: true,
  //   title: '商品管理',
  //   icon: 'dashboard',
  //   route: true,
  // },
  // {
  //   path: '/quesManagement',
  //   component: QuesManagement,
  //   exact: true,
  //   isShow: true,
  //   title: '问答管理',
  //   icon: 'dashboard',
  //   route: true,
  // },
  // {
  //   path: '/combinedpool',
  //   component: Combinedpool,
  //   exact: true,
  //   isShow: true,
  //   title: '组合池管理',
  //   icon: 'dashboard',
  //   route: true,
  // },

];
