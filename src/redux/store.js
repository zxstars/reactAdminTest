/*
 * @Description: Description
 * @Author: Kun Yang
 * @Date: 2021-07-21 11:59:50
 * @LastEditors: Kun Yang
 * @LastEditTime: 2021-12-31 13:53:42
 */
import { createStore, applyMiddleware } from 'redux';
import RootReducers from '@/redux/reducers/index';
import thunk from 'redux-thunk';
// 创建store
const store = createStore(RootReducers, applyMiddleware(thunk));

export default store;
