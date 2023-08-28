/*
 * @Author: your name
 * @Date: 2021-07-21 13:54:16
 * @LastEditTime: 2021-08-31 14:13:45
 * @LastEditors: Kun Yang
 * @Description: In User Settings Edit
 * @FilePath: \besta-admin-web\src\App.js
 */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
// import { adminRoutes } from '@/routes';
import '@/utils/i18n';
import './App.css';
import Layouts from '@/components/Layouts';
import Auth from '@/utils/auth';
import notFound from '@/pages/error/notFound';

class App extends React.Component {
  // 递归处理路由，生成路由组件
  generateRoute(item) {
    // 有子路由
    if (item.childrens && item.childrens.length !== 0) {
      // 当前路由也要生成路由
      const routeView = (
        <Route
          key={item.path}
          path={item.path}
          exact={item.exact}
          render={
            (routeProps) =>
            // 路由对应的组件 <Route><组件名称></组件名称></Route> ,这样就不用写Link标签来指定的路由组件了
              // eslint-disable-next-line implicit-arrow-linebreak
              <item.component {...routeProps} />

          }
        />
      );
      // 生成当前路由的子路由
      const childrens = item.childrens.map((route) => this.generateRoute(route));
      childrens.push(routeView);
      return childrens;
    }

    // 生成当前路由
    return (
      <Route
        key={item.path}
        path={item.path}
        exact={item.exact}
        render={
                      (routeProps) => <item.component {...routeProps} />
                  }
      />
    );
  }

  render() {
    // 全局判断是否登录
    return Auth.isLogin() ? (
      <Layouts defaultRoutes={this.props.defaultRoutes}>
        <Switch>
          {
              this.props.defaultRoutes.map((item) => this.generateRoute(item))
          }
          {/* 如果上面遍历中没有找到路由则会执行当前重定向路由404 */}
          <Route key="/*" path="/*" component={notFound} />
          <Redirect to="/404" />
        </Switch>
      </Layouts>
    ) : <Redirect to="/login" />;
  }
}

// 获取state值
const mapStateToProps = (state) => ({
  defaultRoutes: state.loginReducers.defaultRoutes,
});


export default connect(mapStateToProps)(App);
