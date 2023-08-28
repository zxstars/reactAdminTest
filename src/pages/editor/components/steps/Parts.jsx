/* eslint-disable no-unused-expressions */
import React, {
  useEffect, useState, useRef, forwardRef, useImperativeHandle,
} from 'react';
import { List, Card } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import dbnull from '@/assets/editor/door/dbnull.png';

import { getPartsLists, getTopPanelLists, getToppane2dlLists } from '@/api/editor';
import {
  partsCode,
  legHeight,
  tvTypeCode,
  compNewTopanel,
  localCabineLegType,
} from '@/config/const';
import styles from '../../editor.module.scss';
import { compFootGrounp, handleComputeLegsInitData, handleServiceCompGrounpData } from '../../service';
import auth from '@/utils/auth';


const topPanelHash = new Map();
topPanelHash.set('仿混凝土效果/淡灰色', '仿混凝土效果/淡灰色');
topPanelHash.set('橡木贴面', '橡木贴面');
topPanelHash.set('玻璃 白色', '玻璃 白色');
topPanelHash.set('玻璃 黑色', '玻璃 黑色');
topPanelHash.set('仿大理石/黑色', '仿大理石/黑色');
let globalDefaultLegsData = [];
const Parts = forwardRef(({
  defaultPos, setPosData, setChooseTopanel, setChooseLeg, editData, setOldMccData,
  setEnterCount, enterPartsCount,
}, ref) => {
  const allPosDataRef = useRef(); // 所有画布数据
  // const defalutLegPosDataRef = useRef(); // 桌角默认数据
  // const initLegPosDataRef = useRef(); // 选中桌角的初始默认数据（所有桌角数据）
  const isHasLegRef = useRef(); // 选中桌角信息默认数据
  const [topList, setTopList] = useState([]); // 顶板列表数据
  const [legList, setLegList] = useState({}); // 桌角列表数据
  // const [topPanelTypeId, setTopPanelTypeId] = useState(null);
  const [topPanelCurrent, setTopPanelCurrent] = useState(null); // 选择的顶板下标
  const [legCurrent, setLegCurrent] = useState(null); // 选择的桌角下标
  const topPanelColorRef = useRef();// 选择的顶板colorName
  const topPanlGrounpDataRef = useRef();// 顶板分组数据
  const defaultaRef = useRef();// 顶板分组数据
  // const topPanlProporDataRef = useRef();// 顶板起始坐标分组数据
  const legDataRef = useRef();// 选择桌角数据
  const topDataRef = useRef();// 选择顶板数据(列表默认选中的数据)
  const legFlagRef = useRef();// 是否安装桌角
  // const hasTvRef = useRef();// 是否存在电视柜
  const topGrounpId = useRef();// 地柜分组的id
  const topGrounpPanel = useRef();// 地柜分组的数据 查询顶板数据
  const editDefaultRef = useRef(); // 编辑mcc默认数据存储


  /**
   * @param {*array} item 顶板分组数据 frames: 安装顶板柜体的uuid
   * @description 判断是否是地柜的顶板
   * @returns true 是地柜的顶板
   * @returns false 是挂墙（挨着）电视柜的顶板
   */
  const handleFilterFootCabine = (item) => {
    let isFootTopPanel = false;
    // 获取上墙电视柜的uuid
    const wallCabinetDataId = topPanlGrounpDataRef.current.wallCabinetData.map((v) => v.componentBasic.uuid);

    wallCabinetDataId.forEach((id) => {
      if (item.frames.includes(id)) {
        isFootTopPanel = true;
      }
    });
    return isFootTopPanel;
  };

  // 计算顶板，写入templateJson
  const handleGrounpTopPanel = async (data) => {
    // topPanlProporDataRef.current = proporData;
    const { newEndTopPanelData, topGrounpIdData } = handleServiceCompGrounpData(data, defaultaRef.current);
    topGrounpId.current = topGrounpIdData;
    topGrounpPanel.current = newEndTopPanelData;

    // 不加顶板初始数据
    if (topPanelColorRef.current === undefined) {
      // const result = compTopanel(defaultList, proporData, grounpDataId, true);

      const result = compNewTopanel(newEndTopPanelData, topGrounpIdData, true);
      const hasTVTopPanel = defaultPos.frames.filter((v) => v.componentBasic.typeCode === tvTypeCode).length;

      const newPosData = {
        ...defaultPos,
        basic: {
          ...defaultPos.basic,
          topPanel: [...result],
          hasTVTopPanel: !!hasTVTopPanel,
        },
      };
      allPosDataRef.current = newPosData;
      setPosData(newPosData);
    }
    if (topPanelColorRef.current || defaultPos.basic.hasTopPanel) {
      // 先默认选中的顶板先去编辑数据editData里拿
      topPanelColorRef.current = topPanelColorRef.current
        ? topPanelColorRef.current : (defaultPos?.basic?.topPanel[0]?.componentBasic[0]?.colorName
          || editDefaultRef.current.topPanelColorName);

      const { success, list } = await getToppane2dlLists({
        colorName: topPanelColorRef.current,
        groupData: newEndTopPanelData,
      });
      if (success) {
        const reslutLists = list;

        // 处理templateJson数据
        const result = compNewTopanel(reslutLists, topGrounpIdData, false);
        if (editDefaultRef.current.topPanelColorName) {
          editDefaultRef.current.topInstallData = result;
        }

        // 第一次进行配件选择 判断是否已经安装桌角
        if (defaultPos.basic.hasLeg && enterPartsCount) {
          result.forEach((item) => {
            item.componentBasic.forEach((v) => {
              const isFootTopPanel = handleFilterFootCabine(item);

              if (!isFootTopPanel) {
                v.proportion.y -= legHeight;
              }
            });
          });
        }
        // 第n次进入 处理加了桌角后又再次进入加顶板
        if (!defaultPos.basic.hasLeg && !enterPartsCount) {
          result.forEach((item) => {
            item.componentBasic.forEach((v) => {
              v.proportion.y += legHeight;
            });
          });
        }

        setPosData({
          ...defaultPos,
          basic: {
            ...defaultPos.basic,
            topPanel: [...result],
            hasTopPanel: true,
          },
        });
      }
      // console.log(success, data);
      // getToppane2dlLists({
      //   colorName: topPanelColorRef.current,
      //   groupData: newEndTopPanelData,
      // }).then((res) => {
      //   const reslutLists = res.list;

      //   // 处理templateJson数据
      //   const result = compNewTopanel(reslutLists, topGrounpIdData, false);

      //   // 第一次进行配件选择 判断是否已经安装桌角
      //   if (defaultPos.basic.hasLeg && !isHasLegRef.current) {
      //     result.forEach((item) => {
      //       item.componentBasic.forEach((v) => {
      //         const isFootTopPanel = handleFilterFootCabine(item);

      //         if (!isFootTopPanel) {
      //           v.proportion.y -= legHeight;
      //         }
      //       });
      //     });
      //   }
      //   // 第n次进入 处理加了桌角后又再次进入加桌角
      //   if (!defaultPos.basic.hasLeg && isHasLegRef.current) {
      //     result.forEach((item) => {
      //       item.componentBasic.forEach((v) => {
      //         v.proportion.y += legHeight;
      //       });
      //     });
      //   }

      //   setPosData({
      //     ...defaultPos,
      //     basic: {
      //       ...defaultPos.basic,
      //       topPanel: [...result],
      //       hasTopPanel: true,
      //     },
      //   });
      // });
    }
  };

  // 计算桌角
  const handleCompLeg = () => {
    // 处理桌角得templateJSon数据
    const result = handleComputeLegsInitData(topPanlGrounpDataRef.current, legDataRef.current);
    // TODO 再次添加桌角时，禁用会报错
    if (!legDataRef.current) {
      globalDefaultLegsData = result;
    }
    const flootIds = topGrounpId.current.flat();
    const initPosData = JSON.parse(JSON.stringify(defaultPos));
    const wallCabinetDataId = topPanlGrounpDataRef.current.wallCabinetData.map((v) => v.componentBasic.uuid);
    // 选择桌角并且未添加左脚
    if ((legDataRef.current !== undefined && !initPosData.basic.hasLeg)
    || (editDefaultRef.current.hasLeg && enterPartsCount)) {
      // 将柜体坐标移动桌角高度
      initPosData.frames.forEach((v) => {
        // 1: 是否是地柜（id判断） 2：是否是上墙电视柜（自身） 3：是否是吸附电视柜的普通柜体
        if (flootIds.includes(v.componentBasic.uuid)
          && !wallCabinetDataId.includes(v.componentBasic.uuid)
          && !wallCabinetDataId.includes(v.componentBasic.isAdsordId)
        ) {
          v.componentBasic.proportion.y -= legHeight;
        }
      });
      initPosData.basic.topPanel.forEach((item) => {
        item.componentBasic.forEach((v) => {
          const isFootTopPanel = handleFilterFootCabine(item);
          // 是否是地柜顶板
          if (!isFootTopPanel) {
            v.proportion.y -= legHeight;
          }
        });
      });
    }

    const newPosData = legDataRef.current ? initPosData : allPosDataRef.current;
    const installTopData = editDefaultRef.current?.topInstallData ? editDefaultRef.current.topInstallData
      : newPosData.basic.topPanel;
    setPosData({
      ...newPosData,
      basic: {
        ...newPosData.basic,
        legs: [...result],
        topPanel: [...installTopData],
        hasLeg: !!legDataRef.current,
      },
    });
  };

  // 选择配件
  const handleChooseParts = (typeCode, inx, item) => {
    // setTopPanelTypeId(typeId);

    if (typeCode === partsCode.top) {
      // setTopPanelColor(item.validDesignText);

      topPanelColorRef.current = item.validDesignText;

      // const grounpData = compFootGrounp();
      // compFootGrounp();
      // topPanlGrounpDataRef.current = compFootGrounp();
      // eslint-disable-next-line no-use-before-define
      setTopPanelCurrent(inx);
      handleGrounpTopPanel(topPanlGrounpDataRef.current);
      setChooseTopanel(true);
      if (editData) {
        setOldMccData({
          ...editData,
          basic: {
            ...editData.basic,
            topPanelColorName: '',
          },
        });
      }
      editDefaultRef.current.topInstallData = null;
      editDefaultRef.current.topPanelColorName = '';
      editDefaultRef.current.hasLeg = false;
    } else {
      // eslint-disable-next-line no-use-before-define
      legDataRef.current = item;
      editDefaultRef.current.hasLeg = false;
      handleCompLeg(topPanlGrounpDataRef.current);
      setLegCurrent(inx);
      setChooseLeg(true);
      auth.setLocalCache(localCabineLegType, item.specialFlag || '');
      if (editData) {
        setOldMccData({
          ...editData,
          basic: {
            ...editData.basic,
            hasLeg: false,
          },
        });
      }
      editDefaultRef.current.hasLeg = false;
    }
  };

  // 不选择配件
  const handleChooseNullParts = (typeCode) => {
    if (typeCode === partsCode.top) {
      topPanelColorRef.current = null;
      setPosData({
        ...defaultPos,
        basic: {
          ...defaultPos.basic,
          topPanel: [
            ...allPosDataRef.current.basic.topPanel,
          ],
          hasTopPanel: false,
        },
      });
      setTopPanelCurrent(null);
      setChooseTopanel(false);
      editDefaultRef.current.hasLeg = false;
      if (editData) {
        setOldMccData({
          ...editData,
          basic: {
            ...editData.basic,
            topPanelColorName: '',
          },
        });
      }
      editDefaultRef.current.topInstallData = null;
      editDefaultRef.current.topPanelColorName = '';
    } else {
      if (!defaultPos.basic.hasLeg) {
        return;
      }

      isHasLegRef.current = false;
      legFlagRef.current = false;
      legDataRef.current = null;
      // const newPosData = hasLegMove()
      // 将柜体坐标移动
      const initPosData = JSON.parse(JSON.stringify(defaultPos));

      initPosData.basic.topPanel.forEach((item) => {
        item.componentBasic.map((v) => {
          const isFootTopPanel = handleFilterFootCabine(item);
          if (!legFlagRef.current && !isFootTopPanel) {
            v.proportion.y += legHeight;
          }
        });
      });
      const footIdData = initPosData.basic.legs.map((v) => v.frames).flat();

      initPosData.frames.forEach((v) => {
        if (footIdData.includes(v.componentBasic.uuid)) {
          v.componentBasic.proportion.y += legHeight;
        }
      });

      setPosData({
        ...initPosData,
        basic: {
          ...initPosData.basic,
          legs: [...globalDefaultLegsData],
          hasLeg: false,
        },
        // frames: [
        //   ...allPosDataRef.current.frames,
        // ],
      });
      setLegCurrent(null);
      setChooseLeg(false);
      editDefaultRef.current.hasLeg = false;
      if (editData) {
        setOldMccData({
          ...editData,
          basic: {
            ...editData.basic,
            hasLeg: false,
          },
        });
      }
      editDefaultRef.current.hasLeg = false;
    }
  };

  // 获取顶板、桌角列表
  const handleGetPartslLists = (typeCode) => {
    // 桌角
    getPartsLists({
      typeCode,
    }).then((res) => {
      if (res.list) {
        // setTopList(res.list[0]);
        setLegList(res.list[0]);
        // 设置默认选中的桌角
        if (legDataRef.current) {
          const chooseDefaultLegCurrent = res.list[0].componentBasics.findIndex((v) => v.id === legDataRef.current.id);
          setLegCurrent(chooseDefaultLegCurrent);
        }
      }
    });

    const sizes = [];
    topGrounpPanel.current.forEach((item) => {
      item.forEach((v) => {
        if (!v.notInstall) {
          sizes.push(v.width);
        }
      });
    });

    // 顶板
    getTopPanelLists({
      tvBenchFlag: topPanlGrounpDataRef.current.TvTopPanelFlag,
      sizes: sizes.toString(),
    }).then((res) => {
      if (res.list) {
        setTopList(res.list);
        if (topDataRef.current) {
          const chooseDefaultTopCurrent = res.list.findIndex((v) => v.validDesignText === topDataRef.current.colorName
                                          || editDefaultRef.current.topPanelColorName);
          setTopPanelCurrent(chooseDefaultTopCurrent);
        }
      }
    });
  };

  const handleGetGrounpData = () => {
    topPanlGrounpDataRef.current = compFootGrounp(defaultPos);
    defaultaRef.current = defaultPos;
    // 设置默认顶板数据
    if (defaultPos.basic.hasTopPanel) {
      topDataRef.current = defaultPos.basic.topPanel[0]?.componentBasic[0] // 设置列表选择的顶板
                          || editDefaultRef.current?.topPanelDefaultData; // 设置编辑默认选择的顶板
    }
    // 设置默认桌角数据
    if (defaultPos.basic.hasLeg) {
      isHasLegRef.current = true; // 是否安装过桌角
      legDataRef.current = defaultPos.basic.legs[0]?.componentBasic[0]// 设置选择的桌角
                           || editDefaultRef.current?.legDefaultData; // 设置编辑默认选择的桌角
      // legDataRef.current = defaultPos.basic.legs[0]?.componentBasic[0]; // 设置选择的桌角
      // initLegPosDataRef.current = defaultPos.basic.legs; // 设置桌角默认数据
    }
  };

  const handleGetEditDefaultData = () => {
    const baseInfo = {};
    // const initPosData = JSON.parse(JSON.stringify(defaultPos));

    baseInfo.topPanelColorName = editData?.basic?.topPanelColorName; // 顶板颜色
    baseInfo.hasLeg = editData?.basic?.hasLeg; // 是否添加了桌角
    baseInfo.topPanelData = editData?.basic?.topPanel; // 默认的所有顶板数据
    baseInfo.topPanelDefaultData = editData?.basic?.topPanel[0]?.componentBasic[0]; // 默认的一块顶板数据
    baseInfo.legDefaultData = editData?.basic?.legs[0]?.componentBasic[0];// 默认的一块桌角数据
    // mapStateToProps不更新
    // if (editData?.basic?.hasLeg) {
    //   setPosData({
    //     ...initPosData,
    //     basic: {
    //       ...initPosData.basic,
    //       hasLeg: false,
    //     },
    //   });
    // }
    editDefaultRef.current = baseInfo;
  };

  const initLegOrToppanelData = async () => {
    // compTopGrounp();
    // 地柜分组
    handleGetGrounpData();
    // 赋予顶板初始值
    // key值得问题
    await handleGrounpTopPanel(topPanlGrounpDataRef.current);
    // 赋予桌角初始值
    handleCompLeg(topPanlGrounpDataRef.current);
  };

  // 暴露给父组件使用的子组件方法 可以自定义可用的方法等
  useImperativeHandle(ref, () => ({
    initLegOrToppanelData,
  }));

  useEffect(() => {
    handleGetEditDefaultData();
    // 计算桌角、顶板初始值
    initLegOrToppanelData();
    handleGetPartslLists(`${partsCode.leg}`);
    return () => {
      if (!legDataRef.current) {
        setEnterCount(true);
      } else {
        setEnterCount(false);
      }
    };
  }, []);

  return (
    <div className={styles['step-two-colorParts-content']}>
      <List
        header={<div className={styles['step-two-colorParts-title']}>选择顶板</div>}
      >
        <Card bordered={false} hoverable={false}>
          {
            <Card.Grid
              key="top"
              hoverable={false}
              onClick={() => handleChooseNullParts(partsCode.top)}
              className={topPanelCurrent === null ? styles.active : ''}
            >
              <img src={dbnull} width="60" height="60" alt="" />
            </Card.Grid>
          }
          {
            topList ? topList.map((item, inx) => (
              <Card.Grid
                key={item.id + item.validDesignText}
                hoverable={false}
                onClick={() => handleChooseParts(partsCode.top, inx, item)}
                className={topPanelCurrent === inx ? styles.active : ''}
              >
                <img src={item.imageUrl} width="60" height="60" alt="" />
              </Card.Grid>
            )) : ''
          }
        </Card>
      </List>
      <List
        header={<div className={styles['step-two-colorParts-title']}>选择桌腿</div>}
      >
        <Card bordered={false} hoverable={false}>
          {
            <Card.Grid
              key="leg"
              hoverable={false}
              onClick={() => handleChooseNullParts(legList.typeCode)}
              className={legCurrent === null ? styles.active : ''}
            >
              <img src={dbnull} width="60" height="60" alt="" />
            </Card.Grid>
          }
          {
            legList.componentBasics ? legList.componentBasics.map((item, inx) => (
              <Card.Grid
                key={item.uuid + item.id}
                hoverable={false}
                onClick={() => handleChooseParts(legList.typeCode, inx, item)}
                className={legCurrent === inx ? styles.active : ''}
              >
                <img src={item.materialUrl} width="60" height="60" alt="" />
              </Card.Grid>
            )) : ''
          }
        </Card>
      </List>
    </div>
  );
});


// 获取state值
const mapStateToProps = (state) => ({
  defaultPos: { ...state.editorReducers.defaultPos },
  editData: state.editorReducers.editData,
  enterPartsCount: state.editorReducers.enterPartsCount,
});

// 改变state的值的方法
const mapDispatchToProps = (dispatch) => ({
  setPosData: (data) => {
    dispatch({ type: 'SET_POS', payload: data });
  },
  setChooseTopanel: (data) => {
    dispatch({ type: 'SET_CHOOSE_TOPANEL', payload: data });
  },
  setChooseLeg: (data) => {
    dispatch({ type: 'SET_CHOOSE_LEG', payload: data });
  },
  setOldMccData: (data) => {
    dispatch({ type: 'SET_EDITDATA', payload: data });
  },
  setEnterCount: (data) => {
    dispatch({ type: 'SET_EDITPARTCOUNT', payload: data });
  },
});
Parts.prototype = {
  defaultPos: PropTypes.object,
  setChooseTopanel: PropTypes.func,
  setChooseLeg: PropTypes.func,
  editData: PropTypes.object || null,
  enterPartsCount: PropTypes.bool,
};

Parts.defaultProps = {
  defaultPos: {},
  setChooseTopanel: () => { },
  setChooseLeg: () => { },
  editData: {} || null,
  enterPartsCount: true,
};


export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Parts);
