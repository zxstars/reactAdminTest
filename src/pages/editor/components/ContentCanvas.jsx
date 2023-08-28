import React, {
  useState, useEffect, useLayoutEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button, message } from 'antd';
import { throttle } from 'lodash';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useHistory, useLocation } from 'react-router-dom';

import {
  basePosInfo,
  canvasId,
  tvTypeCode,
  blankSpace,
  TwentyblankSpace,
  legHeight,
  autoAlignSpace,
  localCabinetHight,
  localCabinetColors,
  localCabineLegType,
} from '@/config/const';
import enlargeImg from '@/assets/editor/icons/enlarge.png';
import narrowImg from '@/assets/editor/icons/narrow.png';
import deleteImg from '@/assets/editor/icons/delete.png';
import copyImg from '@/assets/editor/icons/copy.png';
import editorLogo from '@/assets/editor/editorLogo.svg';
import top from '@/assets/editor/top.png';
import left from '@/assets/editor/left.png';
import bottom from '@/assets/editor/bottom.png';
import right from '@/assets/editor/right.png';
import styles from '../editor.module.scss';
import auth from '@/utils/auth';
import CanvasContent from './CanvasContent';
import { handleOldMccData } from '../service';
// import testJSON from '@/config/test';
// 全局数据
let gtdom = null; // 点击柜体的dom
let setDomIndex; // 点击元素的下标
const clickOffset = {}; // 点击点位于点击元素(柜体)左上角的x,y坐标
const clickTvOffset = {}; // 电视机元素的offset坐标
let allCabinetHeight = [];
// 获取state值
const mapStateToProps = (state) => ({
  cabinetCount: state.editorReducers.cabinetCount,
  allPosData: state.editorReducers.allPosData,
  defaultPos: state.editorReducers.defaultPos,
  stepCurrent: state.editorReducers.stepCurrent,
  isFirstStep: state.editorReducers.isFirstStep,
});
// 改变state的值的方法
const mapDispatchToProps = (dispatch) => ({
  setInitData: () => {
    dispatch({ type: 'SET_INIT_DATA' });
  },
  setPosData: (data) => {
    dispatch({ type: 'SET_POS', payload: data });
  },
  setCabinetCurrentset: (data) => {
    dispatch({ type: 'SET_CABINET_CURRENT', payload: data });
  },
  setCabinetCurrentDoorset: (data) => {
    dispatch({ type: 'SET_CABINET_DOOR_CURRENT', payload: data });
  },
  setCabinetHieghts: (data) => {
    dispatch({ type: 'SET_CABINET_HEIGHT', payload: data });
  },
  setOldMccData: (data) => {
    dispatch({ type: 'SET_EDITDATA', payload: data });
  },
  setAllowStep: (data) => {
    dispatch({ type: 'SET_ALLOW_STEP', payload: data });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)((props) => {
  const { t } = useTranslation();

  // const globalAllCompHeights = []; // 存储全局动态计算出来的柜体高度
  const [computedHeight, setComputedHeight] = useState([]);
  // const computedHeightRef = useRef();

  const [posInx, setPosInx] = useState(null); // 选中的柜体
  const [doorInx, setDoorChoose] = useState(null); // 选中柜体的门板
  const [copy, setCopy] = useState(false); // 复制删除按钮
  const [canvasScalcSize, setCanvasScalcSize] = useState(1); //  放大比例
  const history = useHistory(); // 路由跳转
  const [framesLength, setFramesLength] = useState(); // 柜体个数
  // const moveClickDomData = useRef(); // 点击元素移动后的数据状态
  const historyParams = useLocation(); // 路由传参
  // 获取初始化模板数据
  const getInitCanvasData = () => new Promise((resolve) => {
    setTimeout(() => {
      resolve(basePosInfo);
      // resolve(testJSON);
    }, 30);
  });

  // let setDomIndex; // 点击元素的下标
  let movePos; // 点击拖拽移动的坐标
  let initClickDomData; // 点击元素初始化的数据状态、数据重叠时恢复
  let moveClickDomData; // 点击元素移动后的数据状态
  const moveDom = document.getElementById('canvas-content-detail');

  /**
   * @param {*} index 当前拖拽柜体的下标
   * @param {*} isMove 是否是移动时的拖拽 用于还原画布内柜体的鼠标事件
   * @description 修改默认触发移动事件
   */
  const editMouseDefault = (index = null, isMove = false) => {
    const canvasContent = document.getElementById('canvas-content-detail');
    // eslint-disable-next-line no-unused-expressions
    canvasContent?.children.length && [...canvasContent.children].forEach((element, inx) => {
      if (isMove) {
        if (!(index === inx)) {
          element.style.pointerEvents = 'none';
          element.firstChild.style.pointerEvents = 'none';
        }
      } else {
        if (!element.style) {
          return;
        }
        element.style.pointerEvents = 'auto';
        element.firstChild.style.pointerEvents = 'auto';
      }
    });
  };

  /**
   * @description 碰撞检测
   * @param {object} otherModule  画布中每一个物体
   * @param {object} moveModule 移动的物体
   * @param {number} vx 移动的物体的下标
   * @returns {boolean} true 碰撞 fasle 未碰撞
   */
  const HasImpact = (otherModule, moveModule, vx) => {
    const topOther = otherModule.componentBasic.proportion.y;
    const bottomOther = otherModule.componentBasic.proportion.y + computedHeight[vx];
    const leftOther = otherModule.componentBasic.proportion.x;
    const rightOther = otherModule.componentBasic.proportion.x + Number(otherModule.componentBasic.width);

    const topMove = moveModule.componentBasic.proportion.y;
    const bottomMove = moveModule.componentBasic.proportion.y + computedHeight[setDomIndex];
    const leftMove = moveModule.componentBasic.proportion.x;
    const rightMove = moveModule.componentBasic.proportion.x + Number(moveModule.componentBasic.width);

    if (
      bottomMove < topOther
      || leftMove > rightOther
      || topMove > bottomOther
      || rightMove < leftOther
    ) { // 表示没碰上
      return false;
    }
    return true;
  };

  // 判断吸附方向
  const isAdsorb = (otherModule, moveModule, vx, space = 30) => {
    const topOther = otherModule.componentBasic.proportion.y;
    const bottomOther = otherModule.componentBasic.proportion.y + computedHeight[vx];
    const leftOther = otherModule.componentBasic.proportion.x;
    const rightOther = otherModule.componentBasic.proportion.x + Number(otherModule.componentBasic.width);

    const topMove = moveModule.componentBasic.proportion.y;
    const bottomMove = moveModule.componentBasic.proportion.y + computedHeight[setDomIndex];
    const leftMove = moveModule.componentBasic.proportion.x;
    const rightMove = moveModule.componentBasic.proportion.x + Number(moveModule.componentBasic.width);


    if (leftOther <= rightMove && rightMove <= rightOther) {
      if (topOther - space <= bottomMove && bottomMove <= topOther) { // 顶部吸附
        return 'top';
      }
      if (bottomOther <= topMove && topMove <= bottomOther + space) { // 底部吸附
        return 'bottom';
      }
    } else if (leftOther <= leftMove && leftMove <= rightOther) {
      if (topOther - space <= bottomMove && bottomMove <= topOther) { // 顶部吸附
        return 'top';
      }
      if (bottomOther <= topMove && topMove <= bottomOther + space) { // 底部吸附
        return 'bottom';
      }
    } else if (topOther <= topMove && topMove <= bottomOther) {
      if (rightOther <= leftMove && leftMove <= rightOther + space) { // 右边吸附
        return 'right';
      }
      if (leftOther - space <= rightMove && rightMove <= leftOther) { // 左边吸附
        return 'left';
      }
    } else if (topOther <= bottomMove && bottomMove <= bottomOther) {
      if (rightOther <= leftMove && leftMove <= rightOther + space) { // 右边吸附
        return 'right';
      }
      if (leftOther - space <= rightMove && rightMove <= leftOther) { // 左边吸附
        return 'left';
      }
    }
  };
  /**
   *
   * @param {object} adsordData 被吸附柜体
   * @param {object} isAdsordData 拖动柜体
   * @description 是否是地柜吸附
   */
  const isFootAdsorb = (adsordData, isAdsordData) => {
    const initAdsordData = { ...adsordData };
    const initIsAdsordData = { ...isAdsordData };
    // if (initAdsordData.componentBasic.proportion.y + initAdsordData.componentBasic.height >= 380
    //   - Number(`${initAdsordData.componentBasic.depth === 20 ? TwentyblankSpace : blankSpace}`)
    const chooseIndex = props.defaultPos?.frames.findIndex(
      (v) => v.componentBasic.uuid === adsordData.componentBasic.uuid,
    );

    if (initAdsordData.componentBasic.proportion.y === 380 - computedHeight[chooseIndex]
      || initAdsordData.componentBasic.isAdsordId
      || initAdsordData.componentBasic.typeCode === tvTypeCode
    ) {
      initIsAdsordData.componentBasic.isAdsordId = initAdsordData.componentBasic.isAdsordId
                                                   || initAdsordData.componentBasic.uuid;

      // 处理被吸附的柜体长度大于拖拽柜体的长度
      const adsortX = initAdsordData.componentBasic?.proportion.x;
      const adsortWidth = initAdsordData.componentBasic.width;
      const isAdsortWidth = initIsAdsordData.componentBasic.width;

      const isAdasortX = initIsAdsordData.componentBasic?.proportion.x;

      if (isAdasortX >= adsortX + adsortWidth / 2 && isAdsortWidth <= adsortWidth) {
        initIsAdsordData.componentBasic.proportion.x = adsortX + adsortWidth - isAdsortWidth;
      } else {
        initIsAdsordData.componentBasic.proportion.x = adsortX;
      }
    } else {
      // 是否是上墙电视柜吸附普通柜体
      if (initIsAdsordData.componentBasic.typeCode === tvTypeCode) {
        // 这边对原数据进行了修改！！！
        initAdsordData.componentBasic.isAdsordId = initIsAdsordData.componentBasic.uuid;
      }
      initIsAdsordData.componentBasic.isAdsordId = '';
    }
    return initIsAdsordData;
  };

  /**
   * @param {object} adsordData 被吸附柜体
   * @param {object} isAdsordData 拖动柜体
   * @param {string} direction 对齐的方向 lr 左右 tb 上下
   * @description 是否自动对齐吸附
   */
  const autoAdsorb = (adsordData, isAdsordData, direction) => {
    const initAdsordData = { ...adsordData };
    const initIsAdsordData = { ...isAdsordData };
    if (direction === 'lr') {
      // eslint-disable-next-line max-len
      const AlignOne = initAdsordData.componentBasic.proportion.y - autoAlignSpace <= initIsAdsordData.componentBasic.proportion.y
        && initIsAdsordData.componentBasic.proportion.y <= initAdsordData.componentBasic.proportion.y;
      const AlignTwo = initAdsordData.componentBasic.proportion.y <= initIsAdsordData.componentBasic.proportion.y
        && initIsAdsordData.componentBasic.proportion.y <= initAdsordData.componentBasic.proportion.y + autoAlignSpace;
      if (AlignOne || AlignTwo) {
        // const adsordIndex = props.defaultPos?.frames.findIndex(
        //   (v) => v.componentBasic.uuid === initAdsordData.componentBasic.uuid,
        // );
        // const isAdsordIndex = props.defaultPos?.frames.findIndex(
        //   (v) => v.componentBasic.uuid === initIsAdsordData.componentBasic.uuid,
        // );
        // const moveDepth = computedHeight[adsordIndex] - computedHeight[isAdsordIndex];
        initIsAdsordData.componentBasic.proportion.y = initAdsordData.componentBasic.proportion.y;
      }
    } else {
      // eslint-disable-next-line max-len
      const AlignOne = initAdsordData.componentBasic.proportion.x - autoAlignSpace <= initIsAdsordData.componentBasic.proportion.x
        && initIsAdsordData.componentBasic.proportion.x <= initAdsordData.componentBasic.proportion.x;
      const AlignTwo = initAdsordData.componentBasic.proportion.x <= initIsAdsordData.componentBasic.proportion.x
        && initIsAdsordData.componentBasic.proportion.x <= initAdsordData.componentBasic.proportion.x + autoAlignSpace;
      if (AlignOne || AlignTwo) {
        initIsAdsordData.componentBasic.proportion.x = initAdsordData.componentBasic.proportion.x;
      }
    }

    const chooseIndex = props.defaultPos?.frames.findIndex(
      (v) => v.componentBasic.uuid === initIsAdsordData.componentBasic.uuid,
    );
    // 1: 自身存在isAdsordId，吸附者也共享isAdsordId 2:上墙电视柜吸附普通柜体静止赋予自身isAdsordId
    if (initAdsordData.componentBasic.isAdsordId && initIsAdsordData.componentBasic.typeCode !== tvTypeCode) {
      initIsAdsordData.componentBasic.isAdsordId = initAdsordData.componentBasic.isAdsordId;
    }

    if (initIsAdsordData.componentBasic.proportion.y === 380 - computedHeight[chooseIndex]) {
      initIsAdsordData.componentBasic.isAdsordId = '';
    }
    // else {
    //   initIsAdsordData.componentBasic.isAdsordId = '';
    // }

    return initIsAdsordData;
  };

  // 碰撞检测
  const handleHasImpact = (initPosData, index) => {
    // const PosData = { ...props.defaultPos };
    const PosData = JSON.parse(JSON.stringify({ ...props.defaultPos }));
    const impactData = props.defaultPos.frames;
    const impactInx = []; // 存储柜体的下标 用于isFootAdsorb原数据修改重新赋值
    let moveData = moveClickDomData;
    const copyImpactData = []; // 柜体数据副本
    // const impactFlag = false
    let impactFlag; // 是否有一个碰撞
    let AdsorbFlag; // 是否有一个可以吸附

    let hasAdsorb; // 已经吸附 只吸附一个
    impactData.forEach((v, vx) => {
      if (v.componentBasic.uuid === moveData.componentBasic.uuid) {
        return;
      }
      if (impactFlag || AdsorbFlag) {
        return;
      }
      //   if (AdsorbFlag) {
      //   return
      // }
      const isImpact = HasImpact(v, moveData, vx);
      // 已经重叠恢复移动之前位置
      if (isImpact) {
        // moveData = initPosData;
        impactFlag = isImpact;
        PosData.frames[index] = initPosData;
        message.error('柜体出现重叠,已恢复原位');
        setTimeout(() => {
          props.setPosData({ ...PosData });
        }, 20);
      } else {
        impactInx.push(vx);
        copyImpactData.push(v);
      }
    });

    if (impactFlag) {
      return;
    }
    copyImpactData.forEach((v, vx) => {
      const result = isAdsorb(v, moveData, vx);
      if (hasAdsorb) {
        return;
      }
      if (result) {
        AdsorbFlag = true;
        const topBlank = v.componentBasic.deep === 20 ? TwentyblankSpace : blankSpace;
        const bottonBlank = moveData.componentBasic.deep === 20 ? TwentyblankSpace : blankSpace;

        moveData = isFootAdsorb(v, moveData);

        switch (result) {
          case 'top':
            // 吸附柜体id处理
            moveData = autoAdsorb(v, moveData, 'tb');

            moveData = {
              ...moveData,
              componentBasic: {
                ...moveData.componentBasic,
                proportion: {
                  x: moveData.componentBasic.proportion.x,
                  // ? moveData.componentBasic.proportion.x : moveData.componentBasic.proportion.x,
                  // y: v.componentBasic.proportion.y - moveData.componentBasic.height,
                  y: v.componentBasic.proportion.y - computedHeight[setDomIndex] + topBlank,
                },
              },
            };
            break;
          case 'right':
            moveData = autoAdsorb(v, moveData, 'lr');
            moveData = {
              ...moveData,
              componentBasic: {
                ...moveData.componentBasic,
                proportion: {
                  x: v.componentBasic.proportion.x + Number(v.componentBasic.width),
                  y: moveData.componentBasic.proportion.y,
                },
              },
            };
            break;
          case 'bottom':
            moveData = autoAdsorb(v, moveData, 'tb');

            moveData = {
              ...moveData,
              componentBasic: {
                ...moveData.componentBasic,
                proportion: {
                  x: moveData.componentBasic.proportion.x,
                  y: v.componentBasic.proportion.y + computedHeight[vx] - bottonBlank,
                },
              },
            };
            break;
          case 'left':
            moveData = autoAdsorb(v, moveData, 'lr');
            moveData = {
              ...moveData,
              componentBasic: {
                ...moveData.componentBasic,
                proportion: {
                  x: v.componentBasic.proportion.x - Number(moveData.componentBasic.width),
                  y: moveData.componentBasic.proportion.y,
                },
              },
            };
            break;
          default:
            break;
        }
        hasAdsorb = true;
      } else {
        moveData.componentBasic.isAdsordId = '';
      }
      // 修改移动柜体数据
      PosData.frames[index] = moveData;
      // 修改原数据
      PosData.frames[impactInx[vx]] = v;
      // 画布数据修改
      props.setPosData({ ...PosData });
    });
  };

  // 柜体移动
  const bodyMousemove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    // e = e || window.event;
    gtdom.style.pointerEvents = 'none';
    gtdom.parentElement.style.pointerEvents = 'none';

    // 设置柜体移动覆盖闪烁问题
    editMouseDefault(setDomIndex, true);

    if (props.stepCurrent !== 0) {
      return;
    }

    // const clickDom = document.getElementById(`gt${setDomIndex}`);
    // clickDom.style.pointerEvents = 'none';

    // 地柜的处理
    let isGround = false;
    const { height, width } = initClickDomData.componentBasic;

    // 柜体大于128，只能放地下
    if (Number(height) >= 128) {
      isGround = true;
    }

    // 柜体拖动范围限制
    const mouseoffetX = (e.offsetX || e.layerX); // 点击点的x坐标
    const mouseoffetY = (e.offsetY || e.layerY); // 点击点的y坐标
    let limitX;
    let limitY;
    // x
    if (mouseoffetX - clickOffset.offsetX <= autoAlignSpace) {
      limitX = 0;
    } else if ((mouseoffetX + (Number(width) - clickOffset.offsetX + autoAlignSpace)) <= 680) {
      limitX = mouseoffetX - clickOffset.offsetX;
    } else if ((mouseoffetX + (Number(width) - clickOffset.offsetX + autoAlignSpace)) > 680) {
      limitX = 680 - Number(width);
    }
    // y
    if (mouseoffetY - clickOffset.offsetY < autoAlignSpace) {
      limitY = 0;
    } else if (mouseoffetY + Number(height) < 380) {
      limitY = mouseoffetY - clickOffset.offsetY;
    } else if (mouseoffetY + Number(height) >= 380) {
      // limitY = 380 - Number(height) - Number(`${deep === 20 ? 11 : 22}`);
      // limitY = 380 - Number(height) - topBlank;
      limitY = 380 - computedHeight[setDomIndex];
    }
    movePos = {
      x: limitX,
      y: isGround ? 380 - computedHeight[setDomIndex] : limitY, // 处理192cm柜体会向上多出1cm的高度
    };
    const newPos = {
      ...initClickDomData,
      componentBasic: {
        ...initClickDomData.componentBasic,
        proportion: {
          ...initClickDomData.componentBasic.proportion,
          ...movePos,
        },
      },
    };

    // 移动的实时柜体数据
    moveClickDomData = { ...newPos };
    const newPosData = [...props.defaultPos.frames];

    newPosData.splice(setDomIndex, 1, newPos);
    // gtdom.parentElement.style.top = `${isGround ? 0 : limitY}px`;
    // gtdom.parentElement.style.left = `${limitX}px`;
    props.setPosData({
      ...props.defaultPos,
      frames: [
        ...newPosData,
      ],
    });
  };

  /**
   * @description 柜体拖拽结束
   */
  const bodyPointerUp = (e) => {
    // if (props.stepCurrent !== 0) {
    //   return;
    // }
    e.stopPropagation();
    e.preventDefault();
    // gtdom.parentElement.style.pointerEvents = 'auto';
    // gtdom.style.pointerEvents = 'auto';

    // 处理柜体移动到柜体上滑动问题
    editMouseDefault();
    // 碰撞检测 initClickDomData:点之前的柜体状态 moveClickDomData: 是否移动
    if (props.defaultPos.frames.length > 1 && moveClickDomData) {
      handleHasImpact(initClickDomData, setDomIndex);
    }
    // initClickDomData = null;
    // moveClickDomData = null;
    // gtdom.parentElement.style.pointerEvents = 'auto';
    // gtdom.style.pointerEvents = 'auto';

    // 清空选择数据
    // props.setCabinetCurrentset(null);
    // props.setCabinetCurrentDoorset(null);

    moveDom.onmousemove = null;
    // moveDom.onpointerup = null;
    document.body.onpointerup = null;
    document.body.onmouseup = null;
  };


  /**
   * @param {*object} e mousedown事件
   * @param {*objetc} item 点击柜体数据
   * @param {*number} index 点击柜体下标
   * @description 点击柜体
   */
  const handleMouseDown = (e, item, index) => {
    e.stopPropagation();
    e.preventDefault();

    initClickDomData = { ...item };
    setDomIndex = index;
    props.setCabinetCurrentset(index);
    setPosInx(index);
    setDoorChoose(null);

    // 除步骤一外结束操作
    if (props.stepCurrent !== 0) {
      return;
    }

    // 兼容Firefox
    clickOffset.offsetX = e.nativeEvent.offsetX || e.nativeEvent.layerX;
    clickOffset.offsetY = e.nativeEvent.offsetY || e.nativeEvent.layerY;

    setCopy(true);
    props.setStruct(true);

    // 处理移动柜体闪烁问题
    gtdom = e.target;
    gtdom.style.pointerEvents = 'none';
    gtdom.parentElement.style.pointerEvents = 'none';

    // moveDom.onmousemove = utils.throttle(bodyMousemove, 20);
    moveDom.onmousemove = throttle(bodyMousemove, 20);
    // moveDom.onmousemove = bodyMousemove;
    // moveDom.onpointerup = bodyPointerUp;
    document.body.onpointerup = bodyPointerUp;
  };

  const bodyTvMousemove = (e, item) => {
    e.stopPropagation();
    e.preventDefault();
    // e = e || window.event;
    // 设置柜体移动覆盖闪烁问题
    editMouseDefault(-1, true);

    const { width, height } = item;

    // 柜体拖动范围限制
    const mouseoffetX = (e.offsetX || e.layerX);
    const mouseoffetY = (e.offsetY || e.layerY);
    let limitX;
    let limitY;
    // x
    if (mouseoffetX <= clickTvOffset.offsetX) {
      limitX = 0;
    } else if ((mouseoffetX + Number(width)) <= 680) {
      limitX = mouseoffetX - clickTvOffset.offsetX;
    } else if ((mouseoffetX + Number(width)) > 680) {
      limitX = 680 - Number(width);
    }
    // y
    if (mouseoffetY <= clickTvOffset.offsetY) {
      limitY = 0;
    } else if (mouseoffetY + Number(height) < 380) {
      limitY = mouseoffetY - clickTvOffset.offsetY;
    } else if (mouseoffetY + Number(height) >= 380) {
      // limitY = 380 - Number(height) - Number(`${deep === 20 ? 11 : 22}`);
      limitY = 380 - Number(height);
    }

    // 定义初始移动坐标
    const moveTvPos = {
      x: limitX,
      y: limitY,
    };

    const isLegHeight = props.defaultPos.basic.hasLeg ? legHeight : 0;

    const isTvBench = props.defaultPos.frames.filter((v, index) => v.componentBasic.typeCode === tvTypeCode
                      && v.componentBasic.proportion.y + allCabinetHeight[index] + isLegHeight === 380);
    if (isTvBench.length && isTvBench.length === 1) {
      delete moveTvPos.x;
    }
    //  const moveTvPos = {
    //   x: e.offsetX,
    //   y: e.offsetY,
    // };
    // // 移动的实时柜体数据
    // moveClickDomData = { ...newPos };
    const newPosData = JSON.parse(JSON.stringify(props.defaultPos));

    newPosData.propping[0].proportion = {
      ...newPosData.propping[0].proportion,
      ...moveTvPos,
    };
    // gtdom.parentElement.style.top = `${isGround ? 0 : limitY}px`;
    // gtdom.parentElement.style.left = `${limitX}px`;
    props.setPosData({
      ...newPosData,
    });
  };

  const handleTvMouseDown = (e, item) => {
    // 处理移动柜体闪烁问题
    gtdom = e.target;
    gtdom.style.pointerEvents = 'none';
    gtdom.parentElement.style.pointerEvents = 'none';

    // 设置柜体移动覆盖闪烁问题
    clickTvOffset.offsetX = e.nativeEvent.offsetX || e.nativeEvent.layerX;
    clickTvOffset.offsetY = e.nativeEvent.offsetY || e.nativeEvent.layerY;

    // moveDom.onmousemove = utils.throttle((mouseE) => bodyTvMousemove(mouseE, item), 50);
    // moveDom.onmousemove = throttle((mouseE) => bodyTvMousemove(mouseE, item), 50);
    moveDom.onmousemove = throttle((mouseE) => bodyTvMousemove(mouseE, item), 50);
    // document.body.onmouseup = bodyPointerUp;

    // DONE 调用bodyPointerUp，就会出现props.defaultPos不是最新数据
    // moveDom.onpointerup = bodyPointerUp;
    // eslint-disable-next-line func-names
    moveDom.onmouseup = function () {
      moveDom.onmousemove = null;
      // moveDom.onpointerup = null;
      document.body.onpointerup = null;
      document.body.onmouseup = null;
    };
  };

  // 动态计算柜体自适应宽度后的高度
  const getHeight = (idKey, Length) => {
    const cabinetBox = document.getElementById(`${idKey}${Length}`);
    if (!cabinetBox) {
      return;
    }
    const gtContentBox = document.getElementById(`gtc${Length}`);
    gtContentBox.onload = (event) => {
      const ev = event || window.event;
      const elem = ev.target;
      if (elem.tagName.toLowerCase() === 'img') {
        //  图片加载成功
        const boxHeight = gtContentBox.height ? gtContentBox.offsetHeight : gtContentBox.height;

        allCabinetHeight[Length] = boxHeight;

        setComputedHeight([...allCabinetHeight]);
        window.localStorage.setItem(localCabinetHight, JSON.stringify(allCabinetHeight));
        props.setCabinetHieghts([...allCabinetHeight]);
      }
    };
  };

  // 放大柜体画布
  const handleScaleCanvas = () => {
    const dom = document.getElementById(canvasId);
    const scalcSize = canvasScalcSize + 0.1;
    setCanvasScalcSize(scalcSize);
    dom.style.transform = `scale(${scalcSize})`;
  };
  // 缩小柜体画布
  const handleNarrowCanvas = () => {
    const dom = document.getElementById(canvasId);
    const scalcSize = canvasScalcSize - 0.1;
    setCanvasScalcSize(scalcSize);
    dom.style.transform = `scale(${scalcSize})`;
  };
  // 取消选中状态
  const handleCancelChoose = (e) => {
    e.stopPropagation();
    setPosInx(null);
    setCopy(false);
    setDoorChoose(null);
    props.setCabinetCurrentDoorset(null);
    props.setCabinetCurrentset(null);
    props.setStruct(false);
  };

  // 删除柜体
  const handleDeleteCabinet = (e) => {
    e.preventDefault();
    const newComputedHeight = JSON.parse(JSON.stringify(computedHeight));
    newComputedHeight.splice(setDomIndex, 1);
    // setTimeout(() => {
    setComputedHeight(newComputedHeight);
    // }, 20);
    // computedHeightRef.current = newComputedHeight;
    props.setCabinetHieghts([...newComputedHeight]);
    allCabinetHeight = [...newComputedHeight];
    localStorage.setItem(localCabinetHight, JSON.stringify(newComputedHeight));
    setPosInx(null);
    const initPosData = { ...props.defaultPos };
    initPosData.frames.splice(setDomIndex, 1);
    props.setPosData({
      ...initPosData,
    });
    if (!newComputedHeight?.length) {
      props.setAllowStep(false);
    }
  };

  // 复制柜体
  const handleCopyCabinet = (e) => {
    e.preventDefault();

    const initPosData = JSON.parse(JSON.stringify(props.defaultPos));
    const copyPosData = JSON.parse(JSON.stringify(initPosData.frames[setDomIndex]));
    const newX = copyPosData.componentBasic.proportion.x + Number(copyPosData.componentBasic.width);
    let flag;
    // 判断复制右侧是否存在柜子
    initPosData.frames.forEach((item) => {
      if (flag) return;
      if (item.componentBasic.proportion.x === newX
         && item.componentBasic.proportion.y === copyPosData.componentBasic.proportion.y
      ) {
        message.error('该柜体右侧已存在柜体，请移动再复制');
        flag = true;
      }
      if (newX + Number(copyPosData.componentBasic.width) > 680) {
        message.error('复制柜体超出画布');
        flag = true;
      }
    });

    if (flag) {
      return;
    }
    copyPosData.componentBasic.proportion.x = newX;
    copyPosData.componentBasic.uuid = uuidv4();
    // console.log('initPosData', initPosData);
    props.setPosData({
      ...initPosData,
      frames: [
        ...initPosData.frames,
        copyPosData,
      ],
    });
  };

  // 检查路由传参
  const handleOldmccParams = (state) => {
    if (state && state?.oldMccData && typeof state?.oldMccData === 'string') {
      const { oldMccData } = state;
      return handleOldMccData(oldMccData);
    }
    return false;
  };

  // 初始化画布数据
  useEffect(() => {
    const { state } = historyParams;
    console.log(state);
    const { initData, originData } = handleOldmccParams(state);
    // const { initData, originData } = handleOldmccParams({ oldMccData: JSON.stringify(testJSON) });

    if (initData) {
      // 初始化画布尺寸大小
      props.setInitData();
      props.setPosData(initData);
      allCabinetHeight = [];
      localStorage.setItem(localCabinetHight, '[]');
      auth.setLocalCache(localCabinetColors, []);
      auth.setLocalCache(localCabineLegType, '');
      localStorage.setItem('editor-color', originData?.basic?.frameColor);

      // 记录源数据data
      props.setOldMccData(originData);
      // 编辑需要设置桌腿类型数据
      auth.setLocalCache(localCabineLegType, originData?.basic?.legSpecialFlag || '');
    } else {
      getInitCanvasData()
        .then((res) => {
          // 初始化画布尺寸大小
          props.setInitData();
          props.setPosData(res);
          allCabinetHeight = [];
          localStorage.setItem(localCabinetHight, '[]');
          auth.setLocalCache(localCabinetColors, []);
          auth.setLocalCache(localCabineLegType, '');
        })
        .catch((err) => {
          console.log('初始化布局err', err);
        });
    }
  }, []);

  useEffect(() => {
    document.getElementById('content-canvas').onmouseup = (e) => {
      e.preventDefault();
      e.stopPropagation();
      editMouseDefault();
    };
    return () => {
      window.onkeyup = null;
    };
  }, []);

  useEffect(() => {
    if (props.defaultPos.frames && framesLength !== props.defaultPos.frames.length) {
      setFramesLength(props.defaultPos.frames.length);
    }
  }, [props.defaultPos.frames?.length]);

  // DONE 解决计算高度异常问题
  useLayoutEffect(() => {
    if (!props.defaultPos.frames) {
      return;
    }
    // DONE 每一次的坐标变换都会调用高度的设置
    props.defaultPos.frames.map((v, vx) => {
      if (!allCabinetHeight[vx]) {
        getHeight('gt', vx);
      }
    });
  }, [props.cabinetCount, framesLength]);

  return (
    <div className={styles['content-canvas']} id="content-canvas" onMouseDown={handleCancelChoose} role="none">
      <div>
        <img
          style={{ cursor: 'pointer' }}
          src={editorLogo}
          onClick={() => {
            history.push('/combinedpool');
            localStorage.setItem(localCabinetHight, '[]');
            auth.setLocalCache(localCabinetColors, []);
            auth.setLocalCache(localCabineLegType, '');
          }}
          alt="editorLogo"
          role="none"
        />
        <span className={styles.logSpan}>
          {`${t('贝达电视柜组合编辑器')}`}
        </span>
      </div>
      <div className={styles.zoom}>
        <Button shape="round" disabled={canvasScalcSize < 0.6} className={styles.btn} onClick={handleNarrowCanvas}>
          <img src={narrowImg} alt="narrowImg" />
        </Button>
        <Button shape="round" disabled={canvasScalcSize > 1.5} className={styles.btn} onClick={handleScaleCanvas}>
          <img src={enlargeImg} alt="enlargeImg" />
        </Button>
      </div>
      <div className={styles.canvas}>
        <div className={styles['canvas-layouts']} id={canvasId}>
          <img src={top} alt="top" />
          <img src={left} alt="top" />
          <img src={bottom} alt="bottom" />
          <img src={right} alt="right" />
          {/* DONE 抽离到CanvasContent组件中 */}
          <div className={styles['canvas-detail']} id="canvas-content-detail">
            <CanvasContent
              posData={props.defaultPos}
              allCabinetHeight={allCabinetHeight}
              posInx={posInx}
              stepCurrent={props.stepCurrent}
              handleMouseDown={handleMouseDown}
              doorInx={doorInx}
              setPosInx={setPosInx}
              setCopy={setCopy}
              setDoorChoose={setDoorChoose}
              setCabinetCurrentset={props.setCabinetCurrentset}
              setCabinetCurrentDoorset={props.setCabinetCurrentDoorset}
              handleTvMouseDown={handleTvMouseDown}
            />
          </div>

        </div>
      </div>
      <div className={styles.zoom}>
        {
          copy && props.stepCurrent === 0 ? (
            <>
              <Button shape="round" className={styles.btnOpera} onPointerDown={handleCopyCabinet}>
                <img src={copyImg} alt="copyImg" />
              </Button>
              <Button shape="round" className={styles.btnOpera} onPointerDown={handleDeleteCabinet}>
                <img src={deleteImg} alt="copyImg" />
              </Button>
            </>
          ) : ''
        }
      </div>
    </div>
  );
});
