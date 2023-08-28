/*
 * @Description: Description
 * @Author: Kun Yang
 * @Date: 2021-07-28 10:08:56
 * @LastEditors: Kun Yang
 * @LastEditTime: 2022-01-10 15:14:24
 */
import editorState, { defaultSate } from '@/redux/state/editor';

const editorReducers = (state = { ...editorState }, action) => {
  switch (action.type) {
    case 'SET_ROUTES':
      return { ...state, defaultRoutes: action.payload }; // 这里action传入动态色值并同步到state
    // 画布初始数据
    case 'SET_INIT_DATA':
      return { ...state, ...defaultSate }; // 这里action传入动态色值并同步到state
    // 修改画布数据
    case 'SET_POS':
      return { ...state, defaultPos: action.payload }; // 这里action传入动态色值并同步到state
    case 'SET_EDITDATA':
      return { ...state, editData: action.payload };
    case 'SET_EDITPARTCOUNT':
      return { ...state, enterPartsCount: action.payload };
    // 保存每一步的数据
    case 'SET_PHOTO_DATA':
      return { ...state, photoData: { ...action.payload }, enterPartsCount: true };
    // 修改画布柜体的数量
    case 'SET_CABINET_COUNT':
      return { ...state, cabinetCount: action.payload };
    // 修改画布柜体的高度
    case 'SET_CABINET_HEIGHT':
      return { ...state, cabinetHeights: action.payload };
    // 修改画布是否存在柜体
    case 'SET_ALLOW_STEP':
      return { ...state, isFirstStep: action.payload };
    // 修改选中的柜体
    case 'SET_CABINET_CURRENT':
      return { ...state, chooseCabinetCurrent: action.payload };
    // 修改选中的柜体的门板
    case 'SET_CABINET_DOOR_CURRENT':
      return { ...state, chooseCabinetDoorCurrent: action.payload };
    // 修改是否选择顶板
    case 'SET_CHOOSE_TOPANEL':
      return { ...state, chooseToppanel: action.payload };
    // 修改是否选择桌角
    case 'SET_CHOOSE_LEG':
      return { ...state, chooseLeg: action.payload };
    //  修改步骤
    case 'SET_NEXT_STEP':
      return { ...state, stepCurrent: action.payload };
    //  加载loading
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export default editorReducers;
