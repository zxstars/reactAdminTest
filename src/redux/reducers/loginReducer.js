import loginState from '@/redux/state/login';

const loginReducers = (state = { ...loginState }, action) => {
  switch (action.type) {
    case 'SET_ROUTES':
      return { ...state, defaultRoutes: action.payload }; // 这里action传入动态色值并同步到state
    default:
      return state;
  }
};

export default loginReducers;
