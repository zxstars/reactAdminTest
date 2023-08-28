/* eslint-disable no-unused-expressions */
import React, { useEffect, useState, useRef } from 'react';
import { List, Card } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import dbnull from '@/assets/editor/door/dbnull.png';

import { getPartsLists, getTopPanelLists, getToppane2dlLists } from '@/api/editor';
import {
  partsCode,
  blankSpace,
  normalTypeCode,
  tvTypeCode, compTopanel, topMaxWidth, topMinWidth, topPanelSize, toppanelCode, compLegs,
  legHeight,
  TwentyblankSpace,
} from '@/config/const';
import styles from '../../editor.module.scss';

let totalCurrent = 0;
const Parts = ({
  defaultPos, setPosData, setChooseTopanel, setChooseLeg,
}) => {
  const allPosDataRef = useRef(); // 所有画布数据
  const defalutLegPosDataRef = useRef(); // 桌角默认数据
  const [topList, setTopList] = useState([]); // 顶板列表数据
  const [legList, setLegList] = useState({}); // 桌角列表数据
  const [topPanelTypeId, setTopPanelTypeId] = useState(null);
  const [topPanelCurrent, setTopPanelCurrent] = useState(null); // 选择的顶板下标
  const [legCurrent, setLegCurrent] = useState(null);
  const topPanelColorRef = useRef();// 选择的顶板colorName
  const topPanlGrounpDataRef = useRef();// 顶板分组数据
  const topPanlProporDataRef = useRef();// 顶板起始坐标分组数据
  const legDataRef = useRef();// 选择桌角数据
  const legFlagRef = useRef();// 是否安装桌角
  const hasTvRef = useRef();// 是否存在电视柜

  // 排序
  const sortSpace = (data) => data.sort((a, b) => a.x - b.x);


  // 合并分组数据
  const mergeGrounp = (data) => {
    const initData = [...data];
    const grounpDataId = [];

    initData.forEach((v, vx) => {
      grounpDataId[vx] = [];

      if (vx === initData.length - 1) {
        // grounpData[vx] = [];
        // grounpData[vx].push(v);
        // const lastGrounp =
        // grounpDataId.forEach((ele, eleInx) => {
        //   const newGrounp = Array.from(new Set([...ele, ...v]));
        //   if (newGrounp.length === v.length + ele.length) {
        //     grounpDataId[vx] = v;
        //   }
        // });
        grounpDataId[vx] = v;
      }
      for (let index = vx + 1; index < initData.length; index++) {
        const newGrounp = Array.from(new Set([...v, ...initData[index]]));
        if (newGrounp.length === v.length + initData[index].length) {
          grounpDataId[vx] = v;
        } else {
          grounpDataId[vx] = newGrounp;
          initData.splice(index, 1);
        }
        return;
      }
    });

    return grounpDataId;
  };

  // 分组处理
  const handleGrounp = (data) => {
    const initData = [...data];
    // 到左墙距离排序
    const sortData = sortSpace(initData);
    const grounpDataId = [];

    // 找出两个相连的柜体
    sortData.forEach((v, vx) => {
      grounpDataId[vx] = [];

      if (vx === sortData.length - 1) {
        grounpDataId[vx].push(v.uuid);
      }
      for (let index = vx + 1; index < sortData.length; index++) {
        const element = sortData[index];
        if (v.spacewidth === element.x) {
          grounpDataId[vx].push(v.uuid);
          grounpDataId[vx].push(element.uuid);
        } else {
          grounpDataId[vx].push(v.uuid);
        }
        return;
      }
    });

    // 合并两个相连的柜体
    totalCurrent = Math.ceil(grounpDataId.length / 2);
    // cureent = 0;
    let mergeData = mergeGrounp(grounpDataId);
    // if (cureent <= totalCurrent) {
    for (let index = 0; index < totalCurrent; index++) {
      mergeData = mergeGrounp(mergeData);
    }
    return mergeData;
  };

  // 将地柜数据以到左墙间距拆分
  const handleSpace = (data) => {
    const initData = [...data];
    if (!initData) {
      return initData;
    }
    return initData.map((v) => ({
      x: v.componentBasic.proportion.x,
      y: v.componentBasic.proportion.y,
      spacewidth: v.componentBasic.proportion.x + v.componentBasic.width,
      width: v.componentBasic.width,
      uuid: v.componentBasic.uuid,
      isAdsordId: v.componentBasic.isAdsordId,
      typeCode: v.componentBasic.typeCode,
    }));
  };

  /**
   * @description 算出地柜的分组数据
   * @returns filterData 距离左墙距离排序
   * @returns grounpDataId 分组id
   */
  const compFootGrounp = () => {
    const initPosData = JSON.parse(JSON.stringify(defaultPos));
    // 筛选地柜数据
    const footCabinetData = initPosData.frames.map((v) => {
      // 地柜、tvBanch、地柜之上的柜体
      if (v.componentBasic.proportion.y + v.componentBasic.height >= 380
        - Number(`${v.componentBasic.depth === 20 ? TwentyblankSpace : blankSpace}`)
        || v.componentBasic.typeCode === tvTypeCode
        || v.componentBasic.isAdsordId) {
        if (v.componentBasic.typeCode === tvTypeCode) {
          hasTvRef.current = true;
        }
        return v;
      }
    }).filter((v) => v !== undefined);
    console.log('footCabinetData', footCabinetData);
    // 处理地柜到左墙得间距数据
    const handleData = handleSpace(footCabinetData);
    console.log('handleData', handleData);
    // 将地柜分组
    const grounpDataId = handleGrounp(handleData);
    console.log('grounpData', grounpDataId);
    return {
      filterData: sortSpace(handleData), // 所有地柜过滤后数据
      grounpDataId, // 所有地柜分组id数据
    };
  };

  // 宽度分组 60 120 180
  const handleWidthObj = (data, width) => {
    const initData = { ...data };

    if (!width) {
      // eslint-disable-next-line radix
      const current = parseInt(initData.width / topMaxWidth);
      const result = [];
      for (let index = 0; index < current; index++) {
        result.push({
          typeCode: initData.typeCode,
          width: topMaxWidth * 10,
          ...topPanelSize,
        });
      }
      // 不能取整都会多出一个60cm的宽度
      const surplusWidth = initData.width - current * topMaxWidth;
      result.push({
        typeCode: initData.typeCode,
        width: surplusWidth * 10,
        ...topPanelSize,
      });
      return result;
    }

    const current = initData.width / width;
    const result = [];
    for (let index = 0; index < current; index++) {
      result.push({
        typeCode: initData.typeCode,
        width: width * 10,
        ...topPanelSize,
      });
    }
    return result;
  };

  // 切分宽度 to do tvBanch
  const handleCompWidth = (data) => {
    const initData = { ...data };
    if (initData.width <= 180) {
      return {
        ...initData,
        ...topPanelSize,
        width: initData.width * 10,
      };
    } if (initData.width > 180) {
      // data.width / 180;
      const newObj = { ...initData };
      let reslut = [];
      if (newObj.width % 120 === 0) {
        reslut = handleWidthObj(newObj, 120);
      } else if (newObj.width % 180 === 0) {
        reslut = handleWidthObj(newObj, 180);
      } else {
        reslut = handleWidthObj(newObj);
      }
      return reslut;
      // const newWidth = newObj.width % 120 === 0 ? handleObj() : newObj.width % 180 === 0?
    }
  };

  // 计算顶板宽度的分组
  const handleCompToppanel = (data) => {
    const initData = [...data];
    const result = [];
    initData.forEach((item, index) => {
      result[index] = [];
      item.forEach((v) => {
        const compWidth = handleCompWidth(v);
        if (Array.isArray(compWidth)) {
          result[index].push(...compWidth);
        } else {
          result[index].push(compWidth);
        }
      });
    });
    return result;
  };

  // 计算顶板，写入templateJson
  const handleGrounpTopPanel = (data) => {
    const initData = { ...data };
    console.log('initData', initData);

    const { filterData, grounpDataId } = initData;

    // 以分组id将数据分组
    const grounpData = [];
    grounpDataId.forEach((item) => {
      const handleData = filterData.filter((v) => item.includes(v.uuid));
      grounpData.push(handleData);
    });

    const widthGrounpData = [];
    // to do 验证tv banch
    grounpData.forEach((item, eleInx) => {
      let totalComWidth = 0;
      let totalTvWidth = 0;
      widthGrounpData[eleInx] = [];
      item.forEach((v, vx) => {
        if (v.typeCode === normalTypeCode) {
          // return `K${width}`;
          totalTvWidth && widthGrounpData[eleInx].push({
            typeCode: toppanelCode.top,
            width: totalTvWidth,
          });
          totalTvWidth = 0;
          totalComWidth += v.width;
          // return 1;
        } else {
          totalComWidth && widthGrounpData[eleInx].push({
            typeCode: toppanelCode.normal,
            width: totalComWidth,
          });
          totalComWidth = 0;
          totalTvWidth += v.width;
          // return 0;
        }
        if (vx === item.length - 1) {
          totalComWidth && widthGrounpData[eleInx].push({
            typeCode: toppanelCode.normal,
            width: totalComWidth,
          });
          totalTvWidth && widthGrounpData[eleInx].push({
            typeCode: toppanelCode.top,
            width: totalTvWidth,
          });
        }
      });
    });

    console.log('widthGrounpData', widthGrounpData);
    console.log('grounpDataId', grounpDataId);

    // 计算除几块顶板拼接
    const compToppanelGrounpData = handleCompToppanel(widthGrounpData);

    // 每一组地柜的初始坐标
    const proporData = [];

    grounpData.forEach((v, vx) => {
      let total = 0;
      proporData[vx] = [];
      const firtsPos = v[0];
      for (let index = 0; index < compToppanelGrounpData[vx].length; index++) {
        if (index) {
          total += (compToppanelGrounpData[vx][index - 1].width / 10);
        }

        proporData[vx].push({
          x: firtsPos.x + (index ? total : 0),
          y: firtsPos.y,
        });
        // total += compToppanelGrounpData[vx].length;
      }
    });

    topPanlProporDataRef.current = proporData;


    // 不加顶板初始数据
    if (topPanelColorRef.current === undefined) {
      const defaultList = [];
      compToppanelGrounpData.forEach((item, index) => {
        defaultList[index] = [];
        item.forEach((v) => {
          defaultList[index].push({
            ...v,
            imageUrl: '',
          });
        });
      });
      const result = compTopanel(defaultList, proporData, grounpDataId, true);
      const newPosData = {
        ...defaultPos,
        basic: {
          ...defaultPos.basic,
          topPanel: [...result],
        },
      };
      allPosDataRef.current = newPosData;
      setPosData(newPosData);
    } else {
      getToppane2dlLists({
        colorName: topPanelColorRef.current,
        groupData: compToppanelGrounpData,
      }).then((res) => {
        const reslutLists = res.list;

        // 处理templateJson数据
        const result = compTopanel(reslutLists, proporData, grounpDataId);

        // 判断是否已经安装桌角

        if (defaultPos.basic.hasLeg) {
          result.forEach((item) => {
            item.componentBasic.forEach((v) => {
              v.proportion.y -= legHeight;
            });
          });
        }


        setPosData({
          ...defaultPos,
          basic: {
            ...defaultPos.basic,
            topPanel: [...result],
            hasTVTopPanel: !!hasTvRef.current,
            hasTopPanel: true,
          },
        });
      });
    }
  };

  // 计算桌角
  const handleCompLeg = (data) => {
    const initData = { ...data };
    const { filterData, grounpDataId } = initData;

    // grounpDataId.forEach()
    // topPanlProporDataRef.current

    // 以分组id将数据分组
    const grounpData = [];
    grounpDataId.forEach((item) => {
      const handleData = filterData.filter((v) => item.includes(v.uuid));
      grounpData.push(handleData);
    });

    // 每一组地柜的初始坐标
    const proporData = [];
    grounpData.forEach((v) => {
      proporData.push({
        x: v[0].x,
        y: v[0].y,
      });
    });

    const totalProporData = [];
    grounpData.forEach((item) => {
      const xProp = item.map((v) => v.x);
      totalProporData.push(xProp);
    });
    console.log('totalProporData', totalProporData);

    // 每一组的每个柜体的宽度
    const widthGrounpData = [];
    grounpData.forEach((item) => {
      const widthData = item.map((v) => v.width);
      widthGrounpData.push(widthData);
    });

    // 处理桌角得templateJSon数据
    const result = compLegs(legDataRef.current, proporData, grounpDataId, grounpData);
    if (!legDataRef.current) {
      defalutLegPosDataRef.current = result;
    }
    const flootIds = grounpDataId.flat();
    const initPosData = JSON.parse(JSON.stringify(defaultPos));
    if (legDataRef.current !== undefined && !initPosData.basic.hasLeg) {
      // 将柜体坐标移动
      initPosData.frames.forEach((v) => {
        if (flootIds.includes(v.componentBasic.uuid)) {
          v.componentBasic.proportion.y -= legHeight;
        }
      });
      initPosData.basic.topPanel.forEach((v) => {
        v.componentBasic.map((item) => {
          item.proportion.y -= legHeight;
        });
      });
    }

    const newPosData = legDataRef.current ? initPosData : allPosDataRef.current;

    setPosData({
      ...newPosData,
      basic: {
        ...newPosData.basic,
        legs: [...result],
        hasLeg: !!legDataRef.current,
      },
    });


    console.log('topPanlProporDataRef.current ', result);
  };

  // 选择配件
  const handleChooseParts = (typeCode, inx, item) => {
    // setTopPanelTypeId(typeId);

    if (typeCode === partsCode.top) {
      console.log('!!!!!!!!!!!', item);
      // setTopPanelColor(item.validDesignText);

      topPanelColorRef.current = item.validDesignText;

      // const grounpData = compFootGrounp();
      // compFootGrounp();
      // topPanlGrounpDataRef.current = compFootGrounp();
      setTopPanelCurrent(inx);
      handleGrounpTopPanel(topPanlGrounpDataRef.current);
      setChooseTopanel(true);
    } else {
      legDataRef.current = item;
      handleCompLeg(topPanlGrounpDataRef.current);
      setLegCurrent(inx);
      setChooseLeg(true);
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
    } else {
      legFlagRef.current = false;
      // const newPosData = hasLegMove()
      // 将柜体坐标移动
      const initPosData = JSON.parse(JSON.stringify(defaultPos));

      initPosData.basic.topPanel.forEach((v) => {
        v.componentBasic.map((item) => {
          item.proportion.y += legHeight;
        });
      });
      setPosData({
        ...initPosData,
        basic: {
          ...initPosData.basic,
          legs: [...defalutLegPosDataRef.current],
          hasLeg: false,
        },
        frames: [
          ...allPosDataRef.current.frames,
        ],
      });
      setLegCurrent(null);
      setChooseLeg(false);
    }
  };

  // 获取顶板列表
  const handleGetPartslLists = (typeCode) => {
    getPartsLists({
      typeCode,
    }).then((res) => {
      console.log(res);
      if (res.list) {
        // setTopList(res.list[0]);
        setLegList(res.list[0]);
      }
    });
    getTopPanelLists({
      tvBenchFlag: !!hasTvRef.current,
    }).then((res) => {
      console.log(res);
      if (res.list) {
        setTopList(res.list);
      }
    });
  };

  const handleGetGrounpData = () => {
    topPanlGrounpDataRef.current = compFootGrounp();
  };

  useEffect(() => {
    handleGetPartslLists(`${partsCode.leg}`);
    handleGetGrounpData();
    // 赋予顶板初始值
    // key值得问题
    handleGrounpTopPanel(topPanlGrounpDataRef.current);
    // 赋予桌角初始值
    handleCompLeg(topPanlGrounpDataRef.current);
  }, []);

  return (
    <div className={styles['step-two-colorParts-content']}>
      <List
        header={<div className={styles['step-two-colorParts-title']}>选择顶板</div>}
      >
        <Card bordered={false} hoverable={false}>
          {
            <Card.Grid
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
        header={<div className={styles['step-two-colorParts-title']}>选择桌角</div>}
      >
        <Card bordered={false} hoverable={false}>
          {
            <Card.Grid
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
};


// 获取state值
const mapStateToProps = (state) => ({
  defaultPos: state.editorReducers.defaultPos,
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
});
Parts.prototype = {
  defaultPos: PropTypes.object,
  setChooseTopanel: PropTypes.func,
  setChooseLeg: PropTypes.func,
};

Parts.defaultProps = {
  defaultPos: {},
  setChooseTopanel: () => {},
  setChooseLeg: () => {},
};


export default connect(mapStateToProps, mapDispatchToProps)(Parts);
