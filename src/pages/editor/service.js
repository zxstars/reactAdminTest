/* eslint-disable max-depth */
/* eslint-disable operator-assignment */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/*
 * @Description: 当前业务逻辑
 * @Author: Kun Yang
 * @Date: 2021-08-20 14:59:56
 * @LastEditors: Kun Yang
 * @LastEditTime: 2022-01-10 15:16:36
 */
import {
  blankSpace,
  tvTypeCode,
  toppanelCode,
  normalTypeCode,
  compLegs,
  legHeight,
  TwentyblankSpace,
  localCabinetHight,
  localCabineLegType,
  legTypes,
  // topPanelSize
} from '@/config/const';
import auth from '@/utils/auth';

let initPosData = ''; // 全局存储画布数据
// eslint-disable-next-line no-unused-vars
let globalGrounpIdData = []; // 全局存储地柜分组id数据（包含重叠部分）


// 设置h5端的坐标信息
export const setMobilePos = (scalePos, posData) => {
  const saveJson = JSON.parse(JSON.stringify(props.defaultPos));
  const copyPosData = JSON.parse(JSON.stringify(posData));
  //  [...posData]
  const canvasWidth = (Number(scalePos.originEndP.x) + canvasMargin) - (Number(scalePos.originStartP.x) - canvasMargin);
  const canvasHeight = (Number(scalePos.originEndP.y) + canvasMargin) - (Number(scalePos.originStartP.y) - canvasMargin);
  saveScreenshotSize.width = canvasWidth || 0;
  saveScreenshotSize.height = canvasHeight || 0;

  // 处理柜体坐标
  copyPosData.frames.forEach((v, index) => {
    let obj = {};
    const x = Number(v.componentBasic.proportion.x) - (scalePos.originStartP.x - canvasMargin);
    const y = Number(v.componentBasic.proportion.y) - (scalePos.originStartP.y - canvasMargin);

    const mobilX = x / canvasWidth;
    const mobilY = y / canvasHeight;
    const mobileScaleWidth = Number(v.componentBasic.width) / canvasWidth;
    const mobileScaleHeight = (Number(v.componentBasic.height) + blankSpace) / canvasHeight;
    obj = {
      w: mobileScaleWidth,
      h: mobileScaleHeight,
      x: mobilX,
      y: mobilY,
    };
    scalcPos[index] = obj;

    copyPosData.frames[index].componentBasic.mobileProportion = { ...obj };
    saveJson.frames[index].componentBasic.mobileProportion = { ...obj };
    // copyPosData[index].mobilX = mobilX;
    // copyPosData[index].mobilY = mobilY;
    // copyPosData[index].mobileScaleWidth = mobileScaleWidth;
    // copyPosData[index].mobileScaleHeight = mobileScaleHeight;
  });

  // 处理顶板
  copyPosData.basic.topPanel.forEach((item) => {
    const mobileProportion = {
      x: (item.proportion.x - (scalePos.originStartP.x - canvasMargin)) / canvasWidth,
      y: (item.proportion.y - (scalePos.originStartP.y - canvasMargin)) / canvasWidth,
    };
    item.mobileProportion = mobileProportion;

    item.componentBasic.forEach((v) => {
      v.mobilWidth = v.width / canvasWidth;
    });
  });
  saveJson.basic.topPanel = copyPosData.basic.topPanel;

  // 处理桌角
  copyPosData.basic.legs.forEach((item) => {
    item.componentBasic.forEach((v) => {
      v.mobilX = (v.x - (scalePos.originStartP.x - canvasMargin)) / canvasWidth;
      v.mobilHeight = v.height / canvasHeight;
    });
  });
  saveJson.basic.legs = copyPosData.basic.legs;

  // 处理电视机
  copyPosData.propping.forEach((item) => {
    const mobileProportion = {
      x: (item.proportion.x - (scalePos.originStartP.x - canvasMargin)) / canvasWidth,
      y: (item.proportion.y - (scalePos.originStartP.y - canvasMargin)) / canvasWidth,
    };
    // eslint-disable-next-line no-param-reassign
    item.mobileProportion = mobileProportion;
  });
  saveJson.propping = copyPosData.propping;

  saveJson.basic.saveScreenshotSize = saveScreenshotSize;
  saveJson.basic.size = {
    width: canvasWidth,
    height: Number(scalePos.sortRangeHeight.max),
    deep: '20',
  };
  // eslint-disable-next-line no-undef
  utils.downloadObject(saveJson, `画布数据${(new Date()).getTime()}`);
};

let totalCurrent = 0;

// 排序
const sortSpace = (data) => data.sort((a, b) => a.x - b.x);

// 将地柜数据以到左墙间距拆分
const handleSpace = (data) => {
  const initData = [...data];
  if (!initData) {
    return initData;
  }
  return initData.map((v) => ({
    x: v.componentBasic.proportion.x,
    y: v.componentBasic.proportion.y,
    componentBasic: v.componentBasic,
    spacewidth: v.componentBasic.proportion.x + v.componentBasic.width,
    width: v.componentBasic.width,
    uuid: v.componentBasic.uuid,
    isAdsordId: v.componentBasic.isAdsordId,
    typeCode: v.componentBasic.typeCode,
  }));
};


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


/**
 * @param {object} defaultPos 画布数据
 * @description 算出地柜的分组数据
 * @returns TvTopPanelFlag 是否包含 tv bench
 * @returns filterData 距离左墙距离排序
 * @returns grounpDataId 分组id
 */

export const compFootGrounp = (defaultPos) => {
  initPosData = JSON.parse(JSON.stringify(defaultPos));
  let TvTopPanelFlag = false;
  const computeCabinetHeight = JSON.parse(localStorage.getItem(localCabinetHight));
  const footlegHeight = initPosData.basic.hasLeg ? legHeight : 0;

  const wallCabinetData = []; // 上墙电视柜数据
  let inFootCabinetData = []; // 地柜数据（不包含重叠）

  // 筛选地柜数据
  const footCabinetData = initPosData.frames.map((v, vx) => {
    // 是否有tv bench
    if (v.componentBasic.typeCode === tvTypeCode) {
      TvTopPanelFlag = true;
      wallCabinetData.push(v);
    }

    // 地柜、tvBanch、地柜之上的柜体
    if (v.componentBasic.proportion.y >= 380 - computeCabinetHeight[vx] - footlegHeight) {
      // wallCabinetData = []

      if (v.componentBasic.typeCode === tvTypeCode) {
        wallCabinetData.pop();
      }
      inFootCabinetData.push(v);
      return v;
    }

    if (v.componentBasic.typeCode === tvTypeCode) {
      return v;
    }

    return undefined;
  }).filter((v) => v !== undefined);
  // 过滤柜体基础信息
  const handleData = handleSpace(footCabinetData);
  inFootCabinetData = handleSpace(inFootCabinetData);
  // 将地柜分组
  const grounpDataId = handleGrounp(handleData);
  return {
    TvTopPanelFlag,
    filterData: sortSpace(handleData), // 到左墙距离排序
    grounpDataId, // 所有地柜分组id数据
    wallCabinetData, // 上墙电视柜数据
    inFootCabinetData, // 地柜分组数据（不包含重叠）
  };
};


// 宽度分组 60 120 180
const handleWidthObj = (data, width) => {
  const initData = { ...data };

  if (!width) {
    // eslint-disable-next-line radix
    const newWidth = initData.componentBasic.width - 180;
    const current = newWidth / 120;
    let grounpResult = [];
    // 先拼接120顶板
    grounpResult = handleWidthObj({
      ...initData,
      componentBasic: {
        ...initData.componentBasic,
        width: newWidth,
      },
      // totalWidth: newWidth,
    }, 120);

    // 最后会剩下一个180的顶板
    let result = [];
    result = [
      ...grounpResult,
    ];
    result.push({
      // proportion: initData.proportion,
      proportion: {
        ...initData.componentBasic.proportion,
        x: initData.componentBasic.proportion.x + current * 120,
      },
      typeCode: initData.componentBasic.typeCode === normalTypeCode ? toppanelCode.normal : toppanelCode.top,
      width: 180 * 10,
      // ...topPanelSize,
      depth: initData.componentBasic.deep,
    });


    // for (let index = 0; index < current; index++) {
    //   result.push({
    //     // proportion: initData.proportion,
    //     proportion: {
    //       ...initData.proportion,
    //       x: initData.proportion.x + index * topMaxWidth,
    //     },
    //     typeCode: initData.typeCode === normalTypeCode ? toppanelCode.normal : toppanelCode.top,
    //     width: topMaxWidth * 10,
    //     ...topPanelSize,
    //   });
    // }
    // // 不能取整都会多出一个60cm的宽度
    // const surplusWidth = initData.totalWidth - current * topMaxWidth;
    // result.push({
    //   // proportion: initData.proportion,
    //   proportion: {
    //     ...initData.proportion,
    //     x: initData.proportion.x + current * topMaxWidth,
    //   },
    //   typeCode: initData.typeCode === normalTypeCode ? toppanelCode.normal : toppanelCode.top,
    //   width: surplusWidth * 10,
    //   ...topPanelSize,
    // });
    return result;
  }

  const current = initData.componentBasic.width / width;
  const result = [];
  for (let index = 0; index < current; index++) {
    result.push({
      proportion: {
        ...initData.componentBasic.proportion,
        x: initData.componentBasic.proportion.x + index * width,
      },
      // typeCode: initData.typeCode,
      typeCode: initData.componentBasic.typeCode === normalTypeCode ? toppanelCode.normal : toppanelCode.top,
      width: width * 10,
      // ...topPanelSize,
      depth: initData.componentBasic.deep,

    });
  }
  return result;
};

// 顶板的分组 60、120、180
// eslint-disable-next-line consistent-return
const handleGrounpWidth = (oldGrounpData) => {
  const initOldData = { ...oldGrounpData };

  if (initOldData.componentBasic.width <= 180) {
    return [{
      // ...initData,
      proportion: initOldData.componentBasic.proportion,
      typeCode: initOldData.componentBasic.typeCode === normalTypeCode ? toppanelCode.normal : toppanelCode.top,
      width: initOldData.componentBasic.width * 10,
      // ...topPanelSize,
      depth: initOldData.componentBasic.deep,
    }];
  }
  if (initOldData.componentBasic.width > 180) {
    // data.width / 180;
    const newObj = { ...initOldData };
    let reslut = [];
    if (newObj.componentBasic.width % 180 === 0) {
      reslut = handleWidthObj(newObj, 180);
    } else if (newObj.componentBasic.width % 120 === 0) {
      reslut = handleWidthObj(newObj, 120);
    } else {
      reslut = handleWidthObj(newObj);
    }
    return reslut;
    // const newWidth = newObj.width % 120 === 0 ? handleObj() : newObj.width % 180 === 0?
  }
};

const compIsOverlapCabinet = (data) => {
  const initData = JSON.parse(JSON.stringify(data));

  // initData
  let i = 0;
  let j;
  const result = [];
  for (; i < initData.length; i = j) {
    const firstElement = initData[i];
    result.push(firstElement);
    for (j = i + 1; j < initData.length;) {
      const secElement = initData[j];
      // const sapce = secElement.componentBasic.deep === 20?TwentyblankSpace:blankSpace
      const flag = secElement.componentBasic.proportion.y - initData[j - 1].componentBasic.height === initData[j - 1].componentBasic.proportion.y;
      if (!flag) {
        result.push(secElement);
      }
      j++;
    }
  }
  return result;
};


/**
 * @param {*} data 分组的基础数据filterData, grounpDataId
 * @param {*} defaultPos 画布数据
 * @returns {array}  topGrounpIdData  顶板分组id
 * @returns {array}  newEndTopPanelData 顶板分组数据
 * @description 将画布的地柜安装顶板进行分组
 */
export const handleServiceCompGrounpData = (data, defaultPos) => {
  const initData = { ...data };

  const { filterData, grounpDataId } = initData;

  // debugger;
  // 以分组id将数据分组
  const grounpData = [];
  grounpDataId.forEach((item) => {
    const handleData = filterData.filter((v) => item.includes(v.uuid));
    grounpData.push(handleData);
  });

  let AdsordIdGrounpData = [];
  initPosData = JSON.parse(JSON.stringify(defaultPos));
  AdsordIdGrounpData = initPosData.frames.filter((v) => v.componentBasic.isAdsordId);

  const handleTopGrounpData = [];
  grounpData.forEach((item, index) => {
    handleTopGrounpData[index] = [];
    // handleTopGrounpData[index] = item;
    item.forEach((ele, vx) => {
      handleTopGrounpData[index][vx] = [];
      handleTopGrounpData[index][vx].push(ele);

      AdsordIdGrounpData.forEach((v) => {
        if (v.componentBasic.isAdsordId === ele.uuid) {
          // handleTopGrounpData[index].push(v);
          handleTopGrounpData[index][vx].push(v);
        }
      });
    });
  });

  // 排序
  handleTopGrounpData.forEach((item) => {
    // item.sort((a, b) => a.componentBasic.proportion.x - b.componentBasic.proportion.x);
    item.forEach((v) => {
      v.sort((a, b) => a.componentBasic.proportion.y - b.componentBasic.proportion.y);
    });
  });

  // 每一组的分组id
  const topGrounpIdData = [];
  handleTopGrounpData.forEach((item, index) => {
    topGrounpIdData[index] = [];
    item.forEach((ele) => {
      ele.forEach((v) => {
        topGrounpIdData[index].push(v.componentBasic.uuid);
      });
    });
  });
  globalGrounpIdData = topGrounpIdData;

  // 将每一组柜体分为60cm的柜体
  const handleNewGrounpData = JSON.parse(JSON.stringify(handleTopGrounpData));
  // 排序
  handleNewGrounpData.forEach((item) => {
    // item.sort((a, b) => a.componentBasic.proportion.x - b.componentBasic.proportion.x);
    item.forEach((v) => {
      v.sort((a, b) => a.componentBasic.proportion.x - b.componentBasic.proportion.x);
    });
  });
  // 每一组拆分为60cm的柜体
  const newGrounpData = [];
  handleNewGrounpData.forEach((item, index) => {
    newGrounpData[index] = [];
    item.forEach((ele) => {
      for (let vx = 0; vx < ele.length; vx++) {
        if (vx === ele.length - 1) {
          const TotalWidth = ele[vx].componentBasic.width / 60;
          for (let j = 0; j < TotalWidth; j++) {
            // const element = array[j];
            newGrounpData[index].push({
              ...ele[vx],
              componentBasic: {
                ...ele[vx].componentBasic,
                width: 60,
                proportion: {
                  ...ele[vx].componentBasic.proportion,
                  x: ele[vx].componentBasic.proportion.x + j * 60,
                },
              },
            });
          }
        } else {
          const TotalWidth = ele[vx].componentBasic.width / 60;
          for (let j = 0; j < TotalWidth; j++) {
            // const element = array[j];
            newGrounpData[index].push({
              ...ele[vx],
              componentBasic: {
                ...ele[vx].componentBasic,
                width: 60,
                proportion: {
                  ...ele[vx].componentBasic.proportion,
                  x: ele[vx].componentBasic.proportion.x + j * 60,
                },
              },
            });
          }
          // newGrounpData[index].push(ele[vx]);
        }
      }
    });
  });

  // 以x排序
  newGrounpData.forEach((item) => {
    // item.sort((a, b) => a.componentBasic.proportion.x - b.componentBasic.proportion.x);
    item.sort((a, b) => a.componentBasic.proportion.x - b.componentBasic.proportion.x);
  });

  // 找出每一列60cm的板子
  const filterNewGrounpData = [];
  newGrounpData.forEach((item, index) => {
    filterNewGrounpData[index] = [];
    let initX = 0;
    // const initY = 0;
    let i = 0;
    let j = 0;
    // const count = 0;
    let num = 0;
    // const newItem = JSON.parse(JSON.stringify(item));
    for (; i < item.length; i = num) {
      initX = item[i].componentBasic.proportion.x;
      // initY = item[i].componentBasic.proportion.y;
      // initY = item[i].componentBasic.proportion.y;
      // let initCompData = item[i];
      const sortData = [];
      sortData.push(item[i]);
      for (j = i + 1; j < item.length; j++) {
        const compX = item[j].componentBasic.proportion.x;
        // const compY = item[j].componentBasic.proportion.y;
        if (initX === compX) {
          // if (initY<compY) {
          //   newItem.splice(j,1)
          // }
          sortData.push(item[j]);
          // num++;
        }
      }
      sortData.sort((a, b) => a.componentBasic.proportion.y - b.componentBasic.proportion.y);
      if (sortData.length === 1) {
        num++;
      } else {
        num += sortData.length;
      }
      const comData = sortData.length > 1 ? compIsOverlapCabinet(sortData) : sortData;
      // filterNewGrounpData[index].push(comData);
      filterNewGrounpData[index] = [...filterNewGrounpData[index], ...comData];
    }
  });
  filterNewGrounpData.forEach((item) => {
    // item.sort((a, b) => a.componentBasic.proportion.x - b.componentBasic.proportion.x);
    item.sort((a, b) => a.componentBasic.proportion.y - b.componentBasic.proportion.y);
  });
  // 每一组的柜体分组计算
  const topGrounpData = [];
  filterNewGrounpData.forEach((item, index) => {
    let i = 0;
    let j = 0;
    let num = 0;
    let count = 0;
    topGrounpData[index] = [];
    // topGrounpData[index] = [];
    for (; i < item.length; i = num) {
      // const length = item[]
      topGrounpData[index][count] = item[i];
      let totalWidth = item[i].componentBasic.width;

      if (i === item.length - 1) {
        return;
      }

      for (j = i + 1; j < item.length; j++) {
        // 1.重叠的柜体个数 2.柜体的类型typeCode 3.不重叠且柜体的高度不同 4. 不同深度
        if (
          item[i].componentBasic.typeCode === item[j].componentBasic.typeCode
          && item[i].componentBasic.proportion.y === item[j].componentBasic.proportion.y
          && item[i].componentBasic.proportion.x + totalWidth === item[j].componentBasic.proportion.x
          && item[i].componentBasic.deep === item[j].componentBasic.deep
        ) {
          totalWidth += 60;
          topGrounpData[index][count] = {
            ...item[i],
            componentBasic: {
              ...item[i].componentBasic,
              width: totalWidth,
            },
          };
          if (j === item.length - 1) {
            num = item.length;
            j = item.length;
            count++;
          }
          // arr.push(item[j]);
        } else {
          // topGrounpData[index].push(item[j]);
          num = j;
          j = item.length;
          count++;
        }
      }
    }
  });


  // // 将重叠的顶板算出顶板
  // const newTopGrounpData = [];
  // // 分组
  // topGrounpData.forEach((element, elementInx) => {
  //   // 每个分组的每块板子
  //   newTopGrounpData[elementInx] = [];
  //   element.forEach((item, index) => {
  //     // 每块板子的数据
  //     newTopGrounpData[elementInx][index] = [];
  //     let i = 0;
  //     let j = 0;
  //     let count = 0;
  //     let num = 0;
  //     let totalWidth = 0;
  //     let componentBasic = {};
  //     item.forEach((ele, eleInx) => {
  //       for (; i < item.length; i = num) {
  //         // const length = item[]
  //         const arr = [];
  //         for (j = i; j < item.length; j++) {
  //           // 1.重叠的柜体个数 2.柜体的类型typeCode 3.不重叠且柜体的高度不同
  //           if (item[i].length === item[j].length) {
  //             // arr.push(item[j]);
  //             // if (j === item.length - 1) {
  //             //   num = item.length;
  //             //   j = item.length;
  //             //   topGrounpData[index][count] = arr;
  //             // }
  //             const topWidth =
  //             if (condition) {

  //             }
  //           } else {
  //             num = j;
  //             j = item.length;
  //             topGrounpData[index][count] = arr;
  //             count++;
  //             topGrounpData[index][count] = [];
  //           }
  //         }
  //       }
  //     });
  //     newTopGrounpData[elementInx][index].push({
  //       uuid: componentBasic.uuid,
  //       totalWidth,
  //       // componentBasic,
  //       typeCode: componentBasic.typeCode,
  //       proportion: componentBasic.proportion,
  //     });
  //   });
  // });

  // 每组的每块顶板计算
  // const endTopPanelData = [];
  // // 分组
  // topGrounpData.forEach((element, elementInx) => {
  //   // 每个分组的每块板子
  //   endTopPanelData[elementInx] = [];
  //   element.forEach((item, index) => {
  //     // 每块板子的数据
  //     endTopPanelData[elementInx][index] = [];

  //     let totalWidth = 0;
  //     let componentBasic = {};
  //     item.forEach((ele, eleInx) => {
  //       // totalWidth += ele[]
  //       ele.forEach((v, vx) => {
  //         if (vx === 0) {
  //           totalWidth += v.componentBasic.width;
  //         }
  //         if (vx === 0 && eleInx === 0) {
  //           componentBasic = v.componentBasic;
  //         }
  //       });
  //     });
  //     endTopPanelData[elementInx][index].push({
  //       uuid: componentBasic.uuid,
  //       totalWidth,
  //       // componentBasic,
  //       typeCode: componentBasic.typeCode,
  //       proportion: componentBasic.proportion,
  //     });
  //   });
  // });

  // // 将每组的宽度拆分 60 、120、180
  const newEndTopPanelData = JSON.parse(JSON.stringify(topGrounpData));
  newEndTopPanelData.forEach((item, itemInx) => {
    const newItem = [];
    item.forEach((ele) => {
      // 每个宽度的分组都是下标0的位置
      // const newEleData = [...ele];
      const newEleData = { ...ele };
      // newEleData
      const handleEleData = handleGrounpWidth(newEleData);
      // item[eleInx] = handleGrounpWidth(newEleData);
      if (handleEleData.length > 1) {
        // newItem = handleEleData
        handleEleData.forEach((v) => {
          // newItem = handleEleData
          newItem.push(v);
        });
      } else {
        newItem.push(handleEleData[0]);
      }
      // ele[0].totalWidth
    });
    newEndTopPanelData[itemInx] = newItem;
  });

  // 1：高于166cm柜体不能安装顶板, 2：深度为20没有顶板
  newEndTopPanelData.forEach((item) => {
    item.forEach((v) => {
      const topBlank = v.depth === 20 ? TwentyblankSpace : blankSpace;
      if (380 - v.proportion.y - topBlank > 166 || v.depth === 20) {
        v.notInstall = true;
      }
    });
  });

  return {
    topGrounpIdData,
    newEndTopPanelData,
  };
};


/**
 * @param {object} data 分组数据
 * @param {object} legData 选择的桌角数据
 * @returns templateJson 桌角初始数据
 * @description 处理templateJson 桌角初始数据
 */
export const handleComputeLegsInitData = (data, legData = undefined) => {
  const initData = { ...data };
  const { filterData, inFootCabinetData } = initData;

  // const { filterData, grounpDataId, wallCabinetData } = initData;
  // const wallCabinetDataId = wallCabinetData.map((v) => v.componentBasic.uuid);


  // const computeCabinetHeight = JSON.parse(localStorage.getItem(localCabinetHight));
  // const footlegHeight = initPosData.basic.hasLeg ? legHeight : 0;
  // const footData = filterData.filter((v, vx) => v.componentBasic.proportion.y >= 380 - computeCabinetHeight[vx] - footlegHeight);

  const footCabinetids = handleGrounp(inFootCabinetData);

  // TODO 处理 cabinetGrounpId 的数据
  // const cabinetGrounpId = [];
  // grounpDataId.forEach((item, index) => {
  //   cabinetGrounpId[index] = [];
  //   item.forEach((uuid) => {
  //     if (!wallCabinetDataId.includes(uuid)) {
  //       cabinetGrounpId[index].push(uuid);
  //     }
  //   });
  // });

  // 以分组id将数据分组（分组的数据）
  const grounpData = [];
  footCabinetids.forEach((item) => {
    // 删选出地柜（不算重叠）的数据
    const handleData = filterData.filter((v) => item.includes(v.uuid));
    if (handleData.length) {
      grounpData.push(handleData);
    }
  });

  // 每一组地柜的初始坐标
  const proporData = [];
  grounpData.forEach((v) => {
    // 三角类型支脚 多加一组坐标数据
    if (legData?.specialFlag === legTypes.triangle) {
      proporData.push({
        x: v[0]?.x,
        y: v[0]?.y,
      });
    }
    proporData.push({
      x: v[0]?.x,
      y: v[0]?.y,
    });
  });

  // 将重叠在地柜的柜体加入地柜ids（加支腿需使用）
  const framesIds = JSON.parse(JSON.stringify(footCabinetids));
  initPosData.frames.forEach((item) => {
    framesIds.forEach((ids, inx) => {
      if (ids.includes(item.componentBasic?.isAdsordId)) {
        framesIds[inx].push(item.componentBasic.uuid);
      }
    });
  });

  // 计算默认桌角templateJson信息
  const result = compLegs(legData, proporData, footCabinetids, grounpData, framesIds);

  return result;
};

/**
   * @description 计算支脚坐标 x
   * @param {*} item 第几个支脚的数据
   * @param {*} index 第几个支脚
   * @param {*} GrounpLength 一组支脚的个数
   * @param {*} mobileOriginPos 截屏数据
   * @returns x
   */
export const handleComplegPosX = (item, index, GrounpLength, mobileOriginPos) => {
  let x = 0;
  // 初始x坐标
  const originPosx = mobileOriginPos ? item.x - mobileOriginPos.originStartP.x : item.x;
  // 桌角类型
  const legType = auth.getLocalCache(localCabineLegType) || '';

  switch (legType) {
    // 正常
    case legTypes.normal:
      x = originPosx - (GrounpLength - 1 > 1 && index === GrounpLength - 1 ? 5 : 0);
      break;
      // 三角
    case legTypes.triangle:
      x = originPosx - (index > 0 && (index + 1) % 2 === 0 ? 2 : 0);
      break;
    default:
      break;
  }

  return x;
};


/**
 * @description 碰撞检测
 * @param {object} otherModule  画布中每一个物体
 * @param {object} moveModule 移动的物体
 * @param {number} frameIndex 移动的物体的下标
 * @returns {boolean} true 碰撞 fasle 未碰撞
 */
export const HasImpact = (otherModule, moveModule, frameIndex, setDomIndex, type) => {
  const computeCabinetHeight = JSON.parse(localStorage.getItem(localCabinetHight));
  const bottomMoveHeight = type === 'tv' ? moveModule.componentBasic.height : computeCabinetHeight[setDomIndex];

  const topOther = otherModule.componentBasic.proportion.y;
  const bottomOther = otherModule.componentBasic.proportion.y + computeCabinetHeight[frameIndex];
  const leftOther = otherModule.componentBasic.proportion.x;
  const rightOther = otherModule.componentBasic.proportion.x + Number(otherModule.componentBasic.width);

  const topMove = moveModule.componentBasic.proportion.y;
  const bottomMove = moveModule.componentBasic.proportion.y + bottomMoveHeight;
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

function handleLegCoordinate(mccData) {
  const result = JSON.parse(JSON.stringify(mccData));

  // 如果编辑的mcc有底柜就改变柜体坐标（减去桌角高度）
  if (result?.basic?.legs?.length && result.basic.legs[0].componentBasic[0].imageUrl) {
    result?.frames.forEach((frame) => {
      frame.componentBasic.proportion.y = frame.componentBasic.proportion.y + legHeight;
    });
  }

  return result;
}

export const handleOldMccData = (mccData) => {
  const originData = JSON.parse(mccData);
  let initData = JSON.parse(mccData);
  let propingData = [];
  let topPanelData = [];
  let legData = [];

  // 顶板数据
  if (originData?.basic?.topPanel?.length) {
    topPanelData = originData.basic.topPanel;
    initData.basic.topPanel = [];
  }
  // 桌角数据
  if (originData?.basic?.legs?.length) {
    legData = originData.basic.legs;
    initData = handleLegCoordinate(initData);
    initData.basic.legs = [];
    // initData.basic.hasLeg = false;
  }
  // 电视机数据
  if (originData?.propping?.length) {
    propingData = originData.propping;
    initData.propping = [];
  }

  return {
    initData,
    originData,
    topPanelData,
    legData,
    propingData,
  };
};
