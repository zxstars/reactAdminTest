/**
 * index.js 用于管理所有的redux中的reducers
 */

import { combineReducers } from 'redux';

import loginReducers from './loginReducer';
import editorReducers from './editorReducer';

const allReducers = {
  loginReducers,
  editorReducers,
};

const rootReducers = combineReducers(allReducers);

export default rootReducers;
