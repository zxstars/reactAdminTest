/* eslint-disable no-unused-vars */
import React, {
  useState, useEffect, useRef,
} from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import {
  Steps, Button, Drawer, List, Modal, message,
  Spin,
} from 'antd';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import closeImg from '@/assets/editor/close.png';
import arrowBack from '@/assets/editor/door/arrow-back.png';
import commodity1 from '@/assets/editor/door/commodity1.png';
import editorLogo from '@/assets/editor/editorLogo.svg';
import { connect } from 'react-redux';
// import gt02 from '@/assets/editor/BestaTest/Besta_test_12_04.png';
import { getProductLists, saveMcc } from '@/api/editor';
import html2canvas from 'html2canvas';
import utils from '@/utils/util';
import {
  canvasMargin,
  blankSpace,
  legHeight,
  compNewTopanel,
  TwentyblankSpace,
  tvTypeCode,
  localCabinetHight,
  localCabinetColors,
  localCabineLegType,
} from '@/config/const';
import styles from '../editor.module.scss';
import FirstStep from './steps/FirstStep';
import SecondStep from './steps/SecondStep';
import ThreeStep from './steps/ThreeStep';
import AddStruct from './steps/AddStruct';
import Canvas from './Canvas';
import { compFootGrounp, handleServiceCompGrounpData, handleComputeLegsInitData } from '../service';
import auth from '@/utils/auth';

const { Step } = Steps;
const { confirm } = Modal;
const listData = {
  totalPrice: '4290',
  title: 'BESTA 贝达',
  descript: '储物组合，宽240 X 深40厘米 X 高198厘米',
  imgUrl: commodity1,
  list: [],
};
const env = process.env.NODE_ENV === 'development';

const Menu = ({
  isStrcutc,
  setStruct,
  onSaveCabinet,
  isFirstStep,
  defaultPos,
  setAllowNextStep,
  stepCurrent, setCurrent, chooseCabinetCurrent, setPosData, cabinetHeights, setPhotoData,
  photoData,
  setInitData,
  setLoading,
  setCabinetCurrentset,
  setCabinetCurrentDoorset,
  editData,
}) => {
  // const [current, setCurrent] = React.useState(0);
  const [visible, setVisible] = useState(false);
  const threeStepRef = useRef(); // 调用第三步子组件
  const currentType = useRef(); // mcc类型
  const fieldsRef = useRef(); // 添加柜体的尺寸信息
  const [mccImgUrlRef, setMccImgUrlRef] = useState(); // mcc保存的base64图片片
  const saveJsonRef = useRef(); // mcc保存的TemplateJson
  const [productLists, setProductLists] = useState([]);// 商品列表
  const [productInfo, setProductInfo] = useState({}); // mcc基本信息
  const [saveLoading, setSaveLoading] = useState(false); // mcc基本信息
  const [chooseAddStructData, setChooseAddStructData] = useState({}); // 选中的框体数据
  // const chooseAddStructData = useRef(); // 选中的框体数据
  // eslint-disable-next-line no-unused-vars
  const history = useHistory(); // 路由跳转

  // 保存添加柜体的尺寸信息
  const handleSaveSizeInfo = (fileds) => {
    fieldsRef.current = fileds;
  };
  const steps = [
    {
      title: '第一步',
      component: <FirstStep
        onSaveCabinet={onSaveCabinet}
        handleSaveSizeInfo={handleSaveSizeInfo}
        fieldsData={fieldsRef.current}
      />,
    },
    {
      title: '第二步',
      component: <SecondStep />,
    },
    {
      title: '第三步',
      component: <ThreeStep ref={threeStepRef} />,
    },
  ];

  const id = 'mobile_dom';
  // const groundHeigth = 0;
  let globalHeight = 0;

  // 根据key排序 从小到大
  const sort = (data, coordinateKey, type, isMcc) => {
    const sortData = JSON.parse(JSON.stringify(data));
    const sortOriData = JSON.parse(JSON.stringify(data));
    const sortMinData = sortData.sort((a, b) => Number(a.componentBasic.proportion[coordinateKey])
      - Number(b.componentBasic.proportion[coordinateKey]));
    const sortMaxData = sortOriData.sort((a, b) => (Number(a.componentBasic.proportion[coordinateKey])
                          + Number(a.componentBasic[type]))
                          - (Number(b.componentBasic.proportion[coordinateKey]) + Number(b.componentBasic[type])));

    // 处理tvbench 影响
    let flagSpace = sortMaxData[sortMaxData.length - 1].componentBasic.deep === 20 ? TwentyblankSpace : blankSpace;
    let length = sortMaxData.length - 1;
    let groundHeight = 0;

    // flagSpace = sortData[sortMaxData.length - 1].componentBasic.deep === 20 ? TwentyblankSpace : blankSpace;
    if (sortMaxData[length].componentBasic?.type === 'tv' && coordinateKey === 'y') {
      // flagSpace = 0;
      flagSpace = sortMaxData[length - 1].componentBasic.deep === 20 ? TwentyblankSpace : blankSpace;
      length = sortMaxData.length - 2;
    }

    // 判断离地多高
    if (coordinateKey === 'y'
      && sortMaxData[length].componentBasic.proportion.y
      !== 380 - sortMaxData[length].componentBasic.height - flagSpace
      - Number(`${defaultPos.basic.hasLeg ? legHeight : 0}`)
    ) {
      groundHeight = (380 - sortMaxData[length].componentBasic.proportion.y)
             - sortMaxData[length].componentBasic.height - flagSpace;
    }


    // if (isMcc) {
    //   if (sortMaxData[length].componentBasic?.type === 'tv') {
    //     // groundHeigth =
    //     const height = sortMaxData[length-2].componentBasic.proportion
    //   }
    // }
    globalHeight = groundHeight;
    return {
      min: sortMinData[0].componentBasic.proportion[coordinateKey],
      max: Number(sortMaxData[length].componentBasic.proportion[coordinateKey])
            + Number(sortMaxData[length].componentBasic[type])
            + Number(`${coordinateKey === 'y' ? flagSpace : 0}`)
            + groundHeight,
    };
  };

  // const lb = 23;
  // 计算柜体真实高度
  // to do 需要根据留白的高度动态计算实际高度
  const computedMaxHeight = (data) => {
    const sortData = JSON.parse(JSON.stringify(data));
    sortData.sort((a, b) => Number(a.componentBasic.proportion.y) - Number(b.componentBasic.proportion.y));

    // 只有上墙且柜体高度大于电视机高度才加上留白高度
    let flagSpace = 0;

    /* 考虑tvbench的情况 */
    // const LastData = sortData[0];
    // const LastSecData = sortData[1];
    // if (LastData.componentBasic.type === 'tv') {
    //   const space = LastSecData.componentBasic.proportion.y - LastData.componentBasic.proportion.y;
    //   if (space > 0) {
    //     // 留白是否超出电视机高度
    //     const isBlank = LastSecData.componentBasic.proportion.y - blankSpace;

    //     flagSpace = isBlank >= LastData.componentBasic.proportion.y ? 0 : blankSpace;
    //   } else {
    //     flagSpace = Math.abs(space) > blankSpace ? LastSecData.componentBasic.proportion.y - blankSpace : 0;
    //   }
    // } else {
    //   flagSpace = blankSpace;
    // }
    if (sortData[0].componentBasic.deep === 20) {
      flagSpace = TwentyblankSpace;
    } else {
      flagSpace = blankSpace;
    }

    return {
      max: 380 - (Number(sortData[0].componentBasic.proportion.y) + flagSpace) - globalHeight,
      flagSpace,
    };
  };

  const saveScreenshotSize = {};
  const scalcPos = [];


  /**
   * @param {*} isMcc 是否包含电视机
   * @returns 左上角坐标、右下角坐标、最大高度信息
   * @description 截图的起始终点坐标
   */
  const getRange = (isMcc = true) => {
    const proppingData = JSON.parse(JSON.stringify(defaultPos.propping));
    const compProppingData = {
      componentBasic: {
        ...proppingData[0],
      },
    };

    const sortData = defaultPos.propping.length && isMcc
      ? [...defaultPos.frames, compProppingData] : [...defaultPos.frames];

    const sortRangeX = sort(sortData, 'x', 'width', isMcc);
    const sortRangeY = sort(sortData, 'y', 'height', isMcc);
    const sortRangeHeight = computedMaxHeight(sortData);

    // 处理顶板的高度
    // if (defaultPos.basic.topPanel.length) {
    //   // sortRangeY.min -= topPanelHeight;
    //   if (!defaultPos.basic.topPanel[0].componentBasic[0].imageUrl) {
    //     // sortRangeHeight.max += topPanelHeight;
    //   }
    // }
    // 处理桌角的高度
    if (defaultPos.basic.legs.length) {
      if (defaultPos.basic.legs[0].componentBasic[0].imageUrl) {
        sortRangeY.max += legHeight;
        // sortRangeHeight.max -= legHeight;
      }
    }

    // const sortRangeY = sort(allPosData, 'pcY', 'y');

    // 截图宽高坐标
    const originStartP = {
      x: sortRangeX.min,
      y: sortRangeY.min,
    };
    const originEndP = {
      x: sortRangeX.max,
      y: sortRangeY.max,
    };

    return {
      originStartP,
      originEndP,
      sortRangeHeight,
    };
  };


  // 设置h5端的坐标信息
  const setMobilePos = (scalePos, posData) => {
    const saveJson = JSON.parse(JSON.stringify(defaultPos));
    const copyPosData = JSON.parse(JSON.stringify(posData));
    //  [...posData]
    const canvasWidth = (Number(scalePos.originEndP.x) + canvasMargin) - (Number(scalePos.originStartP.x)
                          - canvasMargin);
    const canvasHeight = (Number(scalePos.originEndP.y) + canvasMargin) - (Number(scalePos.originStartP.y)
                          - canvasMargin);
    saveScreenshotSize.width = canvasWidth || 0;
    saveScreenshotSize.height = canvasHeight || 0;

    let hangQuantity = 0; // 挂条
    let supportLegsQuantity = 0; // 支撑脚
    const doorColors = []; // 门板颜色
    let MaxDepth = 20; // mcc深度


    // 处理桌角
    let hasLeg = false;
    let footCabinetIds = [];
    copyPosData.basic.legs.forEach((item) => {
      item.componentBasic.forEach((v) => {
        if (v.imageUrl) {
          hasLeg = true;
        }
        v.mobileX = (v.x - (scalePos.originStartP.x - canvasMargin)) / canvasWidth;
        v.mobileHeight = v.height / canvasHeight;
      });
      footCabinetIds = footCabinetIds.concat(item.frames);
    });
    // 设置桌角数据
    saveJson.basic.legs = copyPosData.basic.legs;
    // 设置是否已经安装了桌角
    saveJson.basic.hasLeg = hasLeg;


    const hasLegHeight = hasLeg ? legHeight : 0;
    // 上墙电视柜数据
    const wallCabineIdtData = copyPosData.frames.map((v, vx) => {
      // 地柜、tvBanch、地柜之上的柜体
      if (v.componentBasic.proportion.y < 380 - cabinetHeights[vx] - hasLegHeight
        && v.componentBasic.typeCode === tvTypeCode
      ) {
        // wallCabinetData.push(v);
        return v.componentBasic.uuid;
      }
    }).filter((v) => v !== undefined);


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
      // 计算挂条
      if ((v.componentBasic.proportion.y + cabinetHeights[index] + hasLegHeight < 380)
          && !v.componentBasic.isAdsordId
          && v.componentBasic.typeCode !== tvTypeCode
      ) {
        const num = v.componentBasic.width / 60;
        hangQuantity += num;
      } else if (wallCabineIdtData.includes(v.componentBasic.isAdsordId)) {
        const num = v.componentBasic.width / 60;
        hangQuantity += num;
      }

      // 计算支撑脚
      // if (v.componentBasic.proportion.y + v.componentBasic.height >= 380 - blankSpace
      if (
        footCabinetIds.includes(v.componentBasic.uuid)
        && (v.componentBasic.proportion.y === 380 - cabinetHeights[index] - legHeight
          || v.componentBasic.proportion.y === 380 - cabinetHeights[index])
        && v.componentBasic.width >= 120
      ) {
        const num = Math.ceil(v.componentBasic.width / 120);
        supportLegsQuantity += num;
      }

      // 设置柜体的h5坐标
      copyPosData.frames[index].componentBasic.mobileProportion = { ...obj };
      saveJson.frames[index].componentBasic.mobileProportion = { ...obj };

      if (v.componentBasic.deep > MaxDepth) {
        MaxDepth = v.componentBasic.deep;
      }

      // 设置门板颜色
      v.units.forEach((item) => {
        item.door.forEach((ele) => {
          if (!doorColors.includes(ele.componentBasic.colorName)) {
            doorColors.push(ele.componentBasic.colorName);
          }
        });
      });
    });

    // 处理所有门板颜色
    saveJson.basic.doorColors = doorColors;

    // 处理顶板 是否已经安装了顶板
    let hasTopPanel = false;
    let topPanelFlag = false;
    copyPosData.basic.topPanel.forEach((item) => {
      item.componentBasic.forEach((v) => {
        if (v.imageUrl) {
          hasTopPanel = true;
        }
        if (!v.notInstall) {
          topPanelFlag = true;
        }
        const mobileProportion = {
          x: (v.proportion.x - (scalePos.originStartP.x - canvasMargin)) / canvasWidth,
          y: (v.proportion.y - (scalePos.originStartP.y - canvasMargin)) / canvasHeight,
        };
        v.mobileProportion = mobileProportion;
        v.mobileWidth = v.width / canvasWidth;
      });
    });

    // 处理安装的顶板颜色
    let topPanelColorName = '';
    if (hasTopPanel && copyPosData.basic.topPanel.length) {
      topPanelColorName = copyPosData.basic.topPanel[0].componentBasic[0].colorName;
    }

    // 设置顶板数据
    saveJson.basic.topPanel = copyPosData.basic.topPanel;
    // 设置是否已经安装了顶板
    saveJson.basic.hasTopPanel = hasTopPanel;
    // 设置已经安装的顶板颜色
    saveJson.basic.topPanelColorName = topPanelColorName;


    // 处理电视机
    copyPosData.propping.forEach((item) => {
      const mobileProportion = {
        x: (item.proportion.x - (scalePos.originStartP.x - canvasMargin)) / canvasWidth,
        y: (item.proportion.y - (scalePos.originStartP.y - canvasMargin)) / canvasHeight,
      };
      item.mobileProportion = mobileProportion;
    });
    saveJson.propping = copyPosData.propping;


    // 设置保存截屏的尺寸
    saveJson.basic.saveScreenshotSize = saveScreenshotSize;

    // 设置实际mcc尺寸 不包含电视机的尺寸
    const mobileOriginPos = getRange(false);
    saveJson.basic.size = {
      width: mobileOriginPos.originEndP.x - mobileOriginPos.originStartP.x,
      // height: Number(scalePos.sortRangeHeight.max),
      height: mobileOriginPos.sortRangeHeight.max,
      deep: MaxDepth,
    };
    saveJson.basic.groundHeight = globalHeight;
    // 设置mcc类型
    saveJson.basic.type = currentType.current;
    // 设置挂条
    saveJson.basic.hangQuantity = hangQuantity;
    // 设置支撑脚
    saveJson.basic.supportLegsQuantity = supportLegsQuantity;
    // 设置柜体颜色
    saveJson.basic.frameColor = localStorage.getItem('editor-color');
    // saveJson.basic.frameColor = defaultPos.frames[0].componentBasic.name.split(' ')[1];
    // 设置是否可以装顶板
    saveJson.basic.topPanelFlag = topPanelFlag;
    // 设置是否可以装支脚
    saveJson.basic.legFlag = !!copyPosData.basic.legs.length;
    // 设置安装的支腿类型
    saveJson.basic.legSpecialFlag = auth.getLocalCache(localCabineLegType) || '';
    return saveJson;
  };

  const handleSaveMcc = () => {
    // 设置mobile的尺寸
    setSaveLoading(true);
    saveMcc({
      bu: 'cn',
      language: 'zh',
      image: {
        imageUrl: mccImgUrlRef,
      },
      templateJson: saveJsonRef.current,
    }).then((res) => {
      if (res.success) {
        message.success('设计成功');
        setInitData();
        // localStorage.setItem(localCabinetHight, '[]');
        auth.setLocalCache(localCabinetHight, []);
        auth.setLocalCache(localCabinetColors, []);
        history.push('/combinedpool');
      } else {
        message.success('设计失败');
      }
      setSaveLoading(false);
    }).catch(() => {
      setSaveLoading(false);
    });
  };

  // 保存
  const handleComputeJson = () => {
    // 获取左上角顶点、左下角顶点坐标
    const mobileOriginPos = getRange();

    const style = `
      position: relative;
      width:${mobileOriginPos.originEndP.x - mobileOriginPos.originStartP.x + 2 * canvasMargin}px;
      height:${mobileOriginPos.originEndP.y - mobileOriginPos.originStartP.y + 2 * canvasMargin}px;
    `;

    // 创建截图挂载点（dom）
    const canvasDom = utils.createDom(id, style);

    // 将截图dom挂载到根节点
    ReactDOM.render(
      // <MobileDom mobileOriginPos={mobileOriginPos} posData={props.defaultPos.frames} />,
      <Canvas
        mobileOriginPos={mobileOriginPos}
        posData={defaultPos}
        allCabinetHeight={cabinetHeights}
        stepCurrent={stepCurrent}
      />,
      canvasDom,
    );

    // 基于dom生成canvas用于保存截图
    setTimeout(() => {
      html2canvas(canvasDom, {
        useCORS: true,
        allowTaint: false,
      }).then((canvas) => {
      /**
         * 获取mimeType
         * @param  {String} type the old mime-type
         * @return the new mime-type
         */
        const type = 'jpeg';
        const imgData = canvas.toDataURL(type);
        // mccImgUrlRef.current = imgData;
        setMccImgUrlRef(imgData);
        if (env) {
          // 下载后的文件名
          const filename = `截图${(new Date()).getTime()}.${type}`;
          // download
          utils.saveFile(imgData, filename);
        }
      });
    }, 60);


    // 删除节点
    // setTimeout(() => {
    //   utils.delDom(id);
    // }, 60);
  };

  // 获取商品清单
  const handleGetProductLists = () => {
    const mobileOriginPos = getRange();
    saveJsonRef.current = setMobilePos(mobileOriginPos, defaultPos);
    if (env) {
      utils.downloadObject(saveJsonRef.current, `画布数据${(new Date()).getTime()}`);
    }

    // handleSave()
    setLoading(true);
    getProductLists({
      bu: 'cn',
      language: 'zh',
      templateJson: saveJsonRef.current,
    }).then((res) => {
      if (res.productList) {
        setProductLists(res.productList);
        setProductInfo({
          height: res.height,
          width: res.width,
          depth: res.depth,
          totalPrice: res.totalPrice,
        });
      }
      setVisible(true);
      setLoading(false);
    });
  };

  // 显示物品清单
  const goGoodsList = () => {
    threeStepRef.current.validateType().then((fileds) => {
      currentType.current = fileds.type;
      handleComputeJson();
      handleGetProductLists();
    });
  };
  // 关闭物品清单
  const onClose = () => {
    setVisible(false);
  };

  // 选择某个类型的内部结构
  const onChooseStruct = (item) => {
    const posData = { ...defaultPos };

    posData.frames[chooseCabinetCurrent] = {
      ...item,
      componentBasic: {
        ...item.componentBasic,
        proportion: {
          ...posData.frames[chooseCabinetCurrent].componentBasic.proportion,
        },
      },
    };
    setPosData({
      ...posData,
    });
  };

  // 下一步
  const next = () => {
    // 设置每一步回退数据
    const newPhotoData = {
      ...photoData,
      [stepCurrent]: defaultPos,
    };
    setPhotoData(
      {
        ...newPhotoData,
      },
    );

    // 设置桌角，顶板的初始数据 第二步结束设置
    if (!defaultPos.basic.legs.length && stepCurrent === 1 && !defaultPos.basic.topPanel.length) {
      const grounpData = compFootGrounp(defaultPos);
      const { newEndTopPanelData, topGrounpIdData } = handleServiceCompGrounpData(grounpData, defaultPos);
      // 不加顶板初始数据
      const topPanelResult = compNewTopanel(newEndTopPanelData, topGrounpIdData, true);
      // 不加桌角初始数据
      const LegResult = handleComputeLegsInitData(grounpData);
      // 是否存在tvbench
      const hasTVTopPanel = defaultPos.frames.filter((v) => v.componentBasic.typeCode === tvTypeCode).length;


      const newPosData = {
        ...defaultPos,
        basic: {
          ...defaultPos.basic,
          topPanel: [...topPanelResult],
          legs: [...LegResult],
          hasTVTopPanel: !!hasTVTopPanel,
          hasLeg: false,
        },
      };
      setPosData(newPosData);
    }
    // editData?.basic?.topPanel?.length

    // 清空添加柜体尺寸信息
    fieldsRef.current = {};

    // 设置步骤
    setCurrent(stepCurrent + 1);
  };

  // 点击步骤回退到具体状态
  const handleClickStep = (e) => {
    const type = e.target.innerHTML;
    const comp = (curren) => {
      if (curren >= stepCurrent) {
        return;
      }
      console.log(stepCurrent, type);
      const setpContent = {
        1: '一',
        2: '二',
        3: '三',
      };
      // eslint-disable-next-line consistent-return
      return confirm({
        title: `确定切回${type}? 当前操作第
                ${stepCurrent === 2 && type === '第一步' ? '二步、' : ''}${setpContent[stepCurrent + 1]}步数据修改将清空`,
        okText: '确定',
        cancelText: '取消',
        onOk() {
          const newPosData = photoData[curren];
          setPosData({ ...newPosData });
          setCurrent(curren);
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    };

    switch (type) {
      case '第一步':
        comp(0);
        break;
      case '第二步':
        comp(1);
        break;
      case '第三步':
        comp(2);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (isFirstStep) {
      return;
    }
    if (defaultPos.frames && Object.keys(defaultPos.frames).length) {
      setAllowNextStep(true);
    } else {
      setAllowNextStep(false);
    }
  }, [defaultPos]);

  useEffect(() => {
    // chooseAddStructData =
    if (!chooseCabinetCurrent && chooseCabinetCurrent !== 0) {
      setChooseAddStructData({ });
      return;
    }
    setChooseAddStructData({ ...defaultPos.frames[chooseCabinetCurrent] });
  }, [chooseCabinetCurrent]);

  return (
    <div className={styles.menu}>
      {
        isStrcutc && stepCurrent === 0 ? (
          <div className={styles['normal-margin']}>
            <img
              src={closeImg}
              alt="closeImg"
              role="none"
              onClick={() => {
                setCabinetCurrentset(null);
                setCabinetCurrentDoorset(null);
                setStruct(false);
              }}
            />
            <AddStruct onChooseStruct={onChooseStruct} choosePosData={chooseAddStructData} />
          </div>
        ) : (
          <>
            <Steps current={stepCurrent} progressDot style={{ marginTop: '40px' }}>
              {steps.map((item) => (
                <Step
                  key={item.title}
                  title={item.title}
                  onClick={stepCurrent ? handleClickStep : () => {}}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Steps>

            <div className={styles['steps-content']}>
              {
                steps[stepCurrent].component
              }
            </div>
            <div className={styles['steps-action']}>
              {stepCurrent <= steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => {
                  if (stepCurrent === 2) {
                    goGoodsList();
                  } else {
                    next();
                  }
                }}
                className={[styles['first-next-step-btn'], styles['normal-btn']]}
                disabled={!isFirstStep}
              >
                {
                  stepCurrent === 2 ? <Trans>完成</Trans> : <Trans>下一步</Trans>
                }

              </Button>
              )}
            </div>
          </>
        )
      }
      <Drawer
        title={(
          <div className={styles['last-commodity-list-title']}>
            <div className={styles['last-commodity-list-title-logo']}>
              <img src={editorLogo} alt="editorLogo" />
              <span className={styles.logSpan}>
                <Trans>贝达电视柜组合编辑器</Trans>
              </span>
            </div>
            <img src={arrowBack} alt="" onClick={onClose} role="none" />
            <span>
              <Trans>商品清单</Trans>
            </span>
          </div>
        )}
        className={styles['last-commodity-list-wrapper']}
        width="100%"
        placement="right"
        closable={false}
        onClose={onClose}
        visible={visible}
      >
        <Spin spinning={saveLoading} tip="Loading...">
          <div className={styles['last-commodity-list-content']}>
            <List
              itemLayout="horizontal"
              dataSource={productLists}
              renderItem={(item) => (
                <List.Item>
                  <div className={styles['last-commodity-list-detail']}>
                    <img src={item.imageUrl} alt="commodityImg" />
                    <div className={styles['last-commodity-list-detail-info']}>
                      <div className={styles['detail-info-title']}>{item.globalName}</div>
                      <div className={styles['detail-info-content']}>
                        {
                        `${item?.typeName}`
                      }
                        {
                        `${item.colorName ? ' , ' : ''}${item?.colorName !== null ? item.colorName : ''}`
                      }
                        {
                        `${item.measureText ? ' , ' : ''}${item.measureText !== null ? item.measureText : ''}`
                      }
                      </div>
                      <div className={styles['detail-info-content']} style={{ display: item.material ? '' : 'none' }}>
                        {`材质:  ${item?.material}`}
                      </div>
                      <div className={styles['detail-info-code']}>
                        <span>{item.itemNoLocal}</span>
                      </div>
                    </div>
                    <div className={styles['last-commodity-list-detail-count']}>
                      <span className={styles['detail-info-content']}>数量</span>
                      <span className={styles['detail-count']}>{item.quantity}</span>
                    </div>
                    <div className={styles['last-commodity-list-detail-price']}>
                      <span className={styles['detail-price']}>
                        ￥
                        {item.price}
                      </span>
                    </div>
                  </div>
                </List.Item>
              )}
            />
            <div className={styles['last-commodity-list-content-show']}>
              <div className={styles.saveImgStyle}>
                <img src={mccImgUrlRef} alt="mccImg" />
              </div>
              <div className={styles['content-show-title']}>{listData.title}</div>
              <div
                className={styles['content-show-descript']}
              >
                {
                `储物组合，宽${productInfo.width}厘米 X 深${productInfo.depth}厘米 X 高${productInfo.height}厘米`
              }
              </div>
              <div className={styles['content-show-price']}>
                <span>￥</span>
                <span>{productInfo.totalPrice}</span>
                <span>.00</span>
              </div>
              <Button
                type="primary"
                style={{ width: '100%' }}
                className={[styles['first-next-step-btn'], styles['normal-btn']]}
                onClick={handleSaveMcc}
              >
                <Trans>确认设计</Trans>
              </Button>
            </div>
          </div>
        </Spin>
      </Drawer>
    </div>
  );
};

// 获取state值
const mapStateToProps = (state) => ({
  defaultPos: state.editorReducers.defaultPos,
  isFirstStep: state.editorReducers.isFirstStep,
  stepCurrent: state.editorReducers.stepCurrent,
  chooseCabinetCurrent: state.editorReducers.chooseCabinetCurrent,
  cabinetHeights: state.editorReducers.cabinetHeights,
  photoData: state.editorReducers.photoData,
  editData: state.editorReducers.editData,
});

// 改变state的值的方法
const mapDispatchToProps = (dispatch) => ({
  setPosData: (payloadData) => {
    dispatch({ type: 'SET_POS', payload: payloadData });
  },
  setAllowNextStep: (payloadData) => {
    dispatch({ type: 'SET_ALLOW_STEP', payload: payloadData });
  },
  setCurrent: (payloadData) => {
    dispatch({ type: 'SET_NEXT_STEP', payload: payloadData });
  },
  setPhotoData: (payloadData) => {
    dispatch({ type: 'SET_PHOTO_DATA', payload: payloadData });
  },
  setInitData: (payloadData) => {
    dispatch({ type: 'SET_INIT_DATA', payload: payloadData });
  },
  setLoading: (payloadData) => {
    dispatch({ type: 'SET_LOADING', payload: payloadData });
  },
  setCabinetCurrentset: (data) => {
    dispatch({ type: 'SET_CABINET_CURRENT', payload: data });
  },
  setCabinetCurrentDoorset: (data) => {
    dispatch({ type: 'SET_CABINET_DOOR_CURRENT', payload: data });
  },
});


Menu.prototype = {
  isStrcutc: PropTypes.bool,
  setStruct: PropTypes.func,
  onSaveCabinet: PropTypes.func,
  isFirstStep: PropTypes.bool,
  defaultPos: PropTypes.object,
  stepCurrent: PropTypes.number,
  setCurrent: PropTypes.func,
  chooseCabinetCurrent: PropTypes.number,
  setPosData: PropTypes.func,
  cabinetHeights: PropTypes.array,
  setPhotoData: PropTypes.func,
  photoData: PropTypes.object,
  setInitData: PropTypes.func,
  setLoading: PropTypes.func,
  setCabinetCurrentset: PropTypes.func,
  setCabinetCurrentDoorset: PropTypes.func,
  editData: PropTypes.object || null,
};

Menu.defaultProps = {
  isStrcutc: false,
  setStruct: () => {},
  onSaveCabinet: () => {},
  setAllowNextStep: () => {},
  isFirstStep: false,
  defaultPos: {},
  stepCurrent: 0,
  setCurrent: () => {},
  chooseCabinetCurrent: null,
  setPosData: () => {},
  cabinetHeights: [],
  setPhotoData: () => {},
  photoData: {},
  setInitData: () => {},
  setLoading: () => {},
  setCabinetCurrentset: () => {},
  setCabinetCurrentDoorset: () => {},
  editData: {} || null,
};
export default connect(mapStateToProps, mapDispatchToProps)(Menu);
