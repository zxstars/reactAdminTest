/*
 * @Author: your name
 * @Date: 2021-07-21 13:54:16
 * @LastEditTime: 2021-08-28 15:04:29
 * @LastEditors: Kun Yang
 * @Description: In User Settings Edit
 * @FilePath: \besta-admin-web\src\index.js
 */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import ReactDOM from 'react-dom';
import {
  Switch, Route, Redirect, HashRouter as Router,
} from 'react-router-dom';
// import { createStore, combineReducers } from 'redux'
import './index.css';
// import 'antd/dist/antd.css'
import '@/utils/i18n';
import { mainRoutes } from '@/routes';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import * as serviceWorker from './serviceWorker';
import App from './App';


// redux 中三个重要部分: action reducer state(store)
ReactDOM.render(
  // 全局注册使用redux
  <Provider store={store}>
    <Router>
      {/* Switch组件做性能优化一旦匹配到路由就停止匹配 */}
      <Switch>
        {/* 主要路由直接匹配 */}
        { mainRoutes.map((route) =>
        // return <Route key={route.path} component={route.component}></Route>
          // eslint-disable-next-line implicit-arrow-linebreak
          <Route key={route.path} {...route} />) }
        {/* 所有/路径转发给App.js */}
        <Route path="/" render={(routeProps) => <App {...routeProps} />} />
        {/* 如果上面遍历中没有找到路由则会执行当前重定向路由404 */}
        <Redirect to="/404" />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
