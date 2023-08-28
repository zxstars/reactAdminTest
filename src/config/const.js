/* eslint-disable camelcase */
import { v4 as uuid } from 'uuid';

// 180
import Besta_test_01_04 from '@/assets/editor/BestaTest/Besta_test_12_03.png';
import Besta_test_11_04 from '@/assets/editor/BestaTest/Besta_test_12_033.png';
import doorTop from '@/assets/editor/door/doorTop.png';

// 60
import Besta_test_01_01 from '@/assets/editor/BestaTest/Besta_test_12_01.png';
// import Besta_test_01_01 from '@/assets/editor/BestaTest/Besta_test_12_04.png';
// import Besta_test_11_01 from '@/assets/editor/BestaTest/Besta_test_22_01.png';

import topPanel from '@/assets/editor/door/dingban4.png';
// leg
import leg from '@/assets/editor/door/leg.png';
// tv
import tvImg from '@/assets/editor/BestaTest/tv.png';

export const CANCEL_REQUEST_MESSAGE = 'cancel request';

// 跨域认证信息 header 名
export const xsrfHeaderName = 'Authorization';
export const expireAt = new Date(new Date().getTime() + 4 * 60 * 60 * 1000);

// 尺寸的单位 mm
export const multiple = 10;
export const canvasSize = {
  height: 380,
  width: 640,
};
// 柜体画布的id
export const canvasId = 'editor-canvas-wrapper';
// 画布放大初始比例
export const canvasScalcSize = 1;
// 画布截屏间距px
export const canvasMargin = 0;
// 桌角高度px
export const legHeight = 10;
// 顶板厚度
export const topPanelHeight = 11;

// 柜体类型的typeCode  框架,23166。   电视柜,10333
export const normalTypeCode = '23166';
export const tvTypeCode = '10333';

// 配件 产品类型code （顶板10238）（支脚29506）
export const partsCode = {
  top: '10238',
  leg: '29506,29505',
};
// 顶板配件 电视顶板 29581 顶板 10238
export const toppanelCode = {
  top: '29581',
  normal: '10238',
};

// 40cm柜体留白
export const blankSpace = 24;
// 20cm柜体留白
export const TwentyblankSpace = 13;
// 柜体自动对齐距离
export const autoAlignSpace = 15;

// 分割顶板的最大宽度
export const topMaxWidth = 180;
// 分割顶板的最小宽度
export const topMinWidth = 60;
// 顶板固定深度厚度
export const topPanelSize = {
  // height: 0,
  depth: 400,
};
// localStorage存储的柜体高度信息
export const localCabinetHight = 'editor-cabinetHeight';
// localStorage存储的柜体颜色列表
export const localCabinetColors = 'editor-cabinetColors';
// localStorage存储的桌角类型
export const localCabineLegType = 'editor-cabinetLegType';
// 支腿类型
export const legTypes = {
  normal: '0', // 正常支腿类型
  triangle: '1', // 三角支腿类型
};
// 深度类型
export const defaultDepth = {
  twenty: 20,
  forty: 40,
};

export const topPanelData = [
  {
    componentBasic: {
      id: '1-1-1',
      componentId: '1-1-1',
      name: '1-1-1',
      typeCode: '1-1-1',
      typeName: '1-1-1',
      imageUrl: topPanel,
      width: '60',
      height: '5',
      depth: '20',
    },
  },
];


export const tvData = {
  id: 'tv-1',
  name: '名称',
  code: '类型码',
  imageUrl: tvImg,
  width: 183,
  height: 105,
  deep: 20,
  location: 'x-y-z',
  proportion: {
    x: 0,
    y: 0,
  },
  mobileProportion: 'online里的装饰物和和画布之间的比例，保留4位小数,{“x”:””,”y”:””,”w”:””,”h”:””}',
};

export const defaultLegBasicData = () => ({
  uuid: uuid(),
  width: 0,
  height: 10, // 每个桌角固定高度
  deep: 0,
  imageUrl: '',
});

/**
 * @param {array} componentBasicData 顶板分组的基础信息数据
 * @param {array} grounpIdData 顶板分组的id数据
 * @param {boolean} isDefault 是否是默认顶板数据
 * @returns templateJson顶板数据
 */
export const compNewTopanel = (componentBasicData, grounpIdData, isDefault) => {
  const initComponentBasicData = [...componentBasicData];
  const initGrounpIdData = [...grounpIdData];
  const result = [];


  grounpIdData.forEach((item, index) => {
    const obj = {};
    // obj.proportion = initProporData[index];
    obj.uuid = uuid();

    // item.forEach((v, vx) => {
    //   v.proportion = initProporData[index][vx];
    //   v.width = isDefault ? v.width / 10 : v.width;
    //   v.depth = isDefault ? v.depth / 10 : v.depth;
    // });
    let newBasicData = [];
    if (isDefault) {
      newBasicData = initComponentBasicData[index].map((v) => ({
        ...v,
        imageUrl: '',
        width: v.width / 10,
        depth: v.depth / 10,
      }));
    }
    obj.componentBasic = isDefault ? newBasicData : initComponentBasicData[index];

    obj.frames = initGrounpIdData[index];
    result.push(obj);
  });
  return result;
};

/**
 * @param {array} widthData 分组后的不同类型的不同宽度数据componentBasic数据
 * @param {ayyay} proporData 分组后的初始柜体坐标
 * @param {ayyay} grounpDataId 分组后的uuid
 * @param {boolean} isDefault 是否是未选择顶板
 * @description 返回templeJson toppanel数据
 */
export const compTopanel = (widthData, proporData, grounpDataId, isDefault) => {
  const initWidthData = [...widthData];
  const initProporData = [...proporData];
  const result = [];
  initWidthData.forEach((item, index) => {
    const obj = {};
    // obj.proportion = initProporData[index];
    obj.uuid = uuid();

    item.forEach((v, vx) => {
      v.proportion = initProporData[index][vx];
      v.width = isDefault ? v.width / 10 : v.width;
      v.depth = isDefault ? v.depth / 10 : v.depth;
    });
    obj.componentBasic = item;

    obj.frames = grounpDataId[index];
    result.push(obj);
  });
  return result;
};


/**
 * @param {array} componentBasic 分组后的不同类型的不同宽度数据componentBasic数据
 * @param {ayyay} proporData 分组后的初始柜体坐标
 * @param {ayyay} grounpDataId 地柜分组后的uuid(不包括重叠柜体)
 * @param {ayyay} grounpData 分组后的数据
 * @param {ayyay} globalGrounpIdData 分组后的数据id(包括重叠柜体)
 * @description 返回templeJson legs数据
 */
export const compLegs = (componentBasicData, proporData, grounpDataId, grounpData, globalGrounpIdData) => {
  const initcomponentBasicData = componentBasicData === undefined ? defaultLegBasicData() : { ...componentBasicData };
  const initProporData = [...proporData];
  const result = [];

  grounpDataId.forEach((item, index) => {
    // 无id时（全是上墙柜，且有电视柜）不去计算支脚
    if (!item.length) {
      return;
    }
    const newArray = [];
    const obj = {};
    const partLeg = [4 + 2 * (item.length - 1)] / 2;
    for (let inx = 0; inx < partLeg; inx++) {
      let x = 0;
      if (inx === partLeg - 1) {
        x = grounpData[index][inx - 1].x + grounpData[index][inx - 1].width;
      } else {
        x = grounpData[index][inx].x;
      }

      // 三角支脚判断
      if (componentBasicData?.specialFlag === legTypes.triangle && inx > 0 && inx < partLeg - 1) {
        newArray.push({
          ...initcomponentBasicData,
          x,
        });
      }

      newArray.push({
        ...initcomponentBasicData,
        x,
      });
    }
    obj.proportion = initProporData[index];
    obj.uuid = uuid();
    obj.componentBasic = newArray;
    obj.frames = globalGrounpIdData[index];
    // obj.widths = widthGrounpData[index];
    result.push(obj);
  });
  return result;
};


// 柜体尺寸的菜单联级关系
// 颜色
export const cabinetColorOptions = [
  {
    id: 1,
    value: '白色',
    title: '白色 (默认)',
    color: '#fff',
  },
  {
    id: 2,
    value: '木色',
    title: '木色',
    color: '#B19581',
  },
  {
    id: 3,
    value: '黑褐色',
    title: '黑褐色',
    color: '#493E3E',
  },
];
// 深度
export const cabinetDeepOptions = [
  {
    id: 1,
    value: 20,
    title: '20cm',
  },
  {
    id: 2,
    value: 40,
    title: '40cm',
  },
];
// 高度
export const cabinetHeightOptions = {
  20: [
    {
      id: 1,
      value: 38,
      title: '38cm',
    },
    {
      id: 2,
      value: 64,
      title: '64cm',
    },
  ],
  40: [
    {
      id: 1,
      value: 38,
      title: '38cm',
    },
    {
      id: 2,
      value: 64,
      title: '64cm',
    },
    {
      id: 3,
      value: 128,
      title: '128cm',
    },
    {
      id: 4,
      value: 192,
      title: '192cm',
    },
  ],
};
// 宽度
export const cabinetWidthOptions = {
  '20-38': [
    {
      id: 1,
      value: 60,
      title: '60cm',
    },
  ],
  '20-64': [
    {
      id: 1,
      value: 60,
      title: '60cm',
    },
  ],
  '40-38': [
    {
      id: 1,
      value: 60,
      title: '60cm',
    },
    {
      id: 2,
      value: 120,
      title: '120cm (普通柜体)',
    },
    {
      id: 4,
      value: 180,
      title: '180cm (TV Bench)',
    },
  ],
  '40-64': [
    {
      id: 1,
      value: 60,
      title: '60cm',
    },
    {
      id: 2,
      value: 120,
      title: '120cm (普通柜体)',
    },
    {
      id: 4,
      value: 180,
      title: '180cm (TV Bench)',
    },
  ],
  '40-128': [
    {
      id: 1,
      value: 60,
      title: '60cm',
    },
  ],
  '40-192': [
    {
      id: 1,
      value: 60,
      title: '60cm',
    },
  ],
};


// 柜体每个单元的长宽
export const cabinetUnitWidth = 60;
export const cabinetUnitHeight = 32;

export const defaultDg = (width, height, deep) => ({
  componentBasic: {
    id: Math.random() * 100,
    componentId: Math.random() * 100,
    name: Math.random() * 100,
    typeCode: 23166,
    typeName: Math.random() * 100,
    imageUrl: Besta_test_01_01,
    width,
    height,
    deep,
    // proportion: '{"x":"0.1","y":"0.1","h":"64","w":"120"}',
    proportion: {
      x: 0,
      y: 0,
    },
    mobileProportion: {},
  },
  location: 'x-y-z',
  units: [
    {
      door: [{
        componentBasic: {
          id: Math.random() * 100,
          componentId: '1',
          name: '1',
          typeCode: '1',
          typeName: '2',
          imageUrl: 'https://images2.pianshen.com/293/9c/9c0bb1694c8f738f7680ae4a4903c34d.png',
          colorCode: '颜色码',
          colorName: '颜色名称',
          width: '60',
          height: '32',
          deep: '2',
        },
        height: '0',
      }],
    },
  ],
  leg: {
    componentBasic: {
      id: '1-1',
      componentId: '组件id',
      name: '组件名',
      typeCode: '产品类型编码，用于区分是哪种商品',
      typeName: '产品类型名称',
      imageUrl: leg,
      width: '60',
      height: '10',
      depth: '20',
    },
    location: [
      'x-y-z（支脚坐标，多个支脚有多个坐标系）',
    ],
  },
});

export const defaultAddCabinetInfo = (width, height, deep, color = '') => ({
  componentBasic: {
    uuid: Math.random() * 100,
    id: Math.random() * 100,
    componentId: Math.random() * 100,
    name: Math.random() * 100,
    typeCode: 10333,
    typeName: Math.random() * 100,
    imageUrl: Besta_test_01_04,
    width,
    height,
    deep,
    // proportion: '{"x":"0.1","y":"0.1","h":"64","w":"120"}',
    proportion: {
      x: 0,
      y: 0,
    },
    mobileProportion: {},
  },
  location: 'x-y-z',
  units: [
    {},
    {
      door: [{
        componentBasic: {
          id: Math.random() * 100,
          componentId: '1',
          name: '1',
          typeCode: '1',
          typeName: '2',
          imageUrl: Besta_test_11_04,
          colorCode: color,
          colorName: '颜色名称',
          width: '60',
          height: '32',
          deep: '2',
        },
        height: '0',
      }, {
        componentBasic: {
          id: Math.random() * 100,
          componentId: '1-1',
          name: '1-1',
          typeCode: '1-1',
          typeName: '2-1',
          imageUrl: doorTop,
          colorCode: color,
          colorName: '颜色名称',
          width: '60',
          height: '32',
          deep: '2',
        },
        height: '27',
      }],
    },
    {
      door: [{
        componentBasic: {
          id: Math.random() * 100,
          componentId: '1-3',
          name: '1',
          typeCode: '1',
          typeName: '2',
          imageUrl: Besta_test_11_04,
          colorCode: '颜色码',
          colorName: '颜色名称',
          width: '60',
          height: '32',
          deep: '2',
        },
        height: '0',
      }],
    }],
});

export const basePosInfo = {
  basic: {
    name: 'BESTA 贝达',
    type: '',
    size: {
      width: '',
      height: '',
      deep: '',
    },
    saveScreenshotSize: {
      width: '',
      height: '',
    },
    groundHeight: 0, // 离地最近的柜体
    hangQuantity: 0, //  挂条
    supportLegsQuantity: 0, // 支撑脚
    legSpecialFlag: '', // 安装的支脚类型
    floorColor: '地板颜色',
    wallColor: '墙面颜色',
    // hasInstalllLeg: false, // editor是否已经装桌角
    // hasInstallTopPanel: false, // editor是否已经装顶板
    hasLeg: false, // editor是否已经装桌角
    hasTopPanel: false, // editor是否已经装顶板
    legFlag: false, // 是否可以装支脚
    topPanelFlag: false, // 是否可以装顶板
    frameColor: 'red', // 框体颜色
    doorColors: [], // 单个柜体的所有门板颜色
    hasTVTopPanel: false, // editor是否存在电视柜
    topPanelColorName: '', // editor加的顶板的颜色
    legs: [
      // {
      //   uuid: 'leg-1',
      //   proportion: {
      //     x: 260,
      //     y: 293,
      //   },
      //   componentBasic: [{
      //     id: 'db-1',
      //     componentId: 'db-1',
      //     name: 'db-1',
      //     typeCode: '产品类型编码，用于区分是哪种商品',
      //     typeName: '产品类型名称',
      //     imageUrl: leg,
      //     height: 10,
      //     width: 0,
      //     depth: 5,
      //   }],
      //   frames: [
      //     'id1',
      //     'id2',
      //   ],
      // },
    ],
    topPanel: [
      // {
      //   uuid: '08bf1fec-5047-4a84-919c-e0562f948be9',
      //   componentBasic: [{
      //     id: '251a50e832ba942aaa36accf1f15a716',
      //     appearanceId: null,
      //     uuid: '00d35aa05d22446492870083c0ac341d',
      //     componentId: 1802,
      //     name: 'BESTÅ 贝达',
      //     typeCode: '10238',
      //     typeName: '顶板',
      //     materialUrl: '',
      //     imageUrl: '',
      //     colorCode: null,
      //     colorName: '玻璃 黑色',
      //     width: 120,
      //     height: 0,
      //     deep: 40,
      //     notInstall: false,
      //     proportion: { x: 197, y: 292 },
      //   }, {
      //     id: '251a50e832ba942aaa36accf1f15a716',
      //     appearanceId: null,
      //     uuid: '2e3c59a23e5b4491a33c72b945c1f431',
      //     componentId: 1802,
      //     name: 'BESTÅ 贝达',
      //     typeCode: '10238',
      //     typeName: '顶板',
      //     materialUrl: '',
      //     imageUrl: '',
      //     colorCode: null,
      //     colorName: '玻璃 黑色',
      //     width: 120,
      //     height: 0,
      //     deep: 40,
      //     notInstall: false,
      //     proportion: { x: 317, y: 292 },
      //   }],
      //   frames: [
      //     '4062932bfa57452497d28898ac87be69',
      //     '39708b7e-b61e-471f-bbb2-cd05df0a167d',
      //   ],
      // },
    ],
  },
  frames: [
    // {
    //   componentBasic: {
    //     id: Math.random() * 100,
    //     componentId: Math.random() * 100,
    //     name: Math.random() * 100,
    //     typeCode: 23166,
    //     typeName: Math.random() * 100,
    //     imageUrl: Besta_test_01_01,
    //     width: 60,
    //     height: 64,
    //     deep: 20,
    //     // proportion: '{"x":"0.1","y":"0.1","h":"64","w":"120"}',
    //     proportion: {
    //       x: 0,
    //       y: 0,
    //     },
    //     mobileProportion: {},
    //   },
    //   location: 'x-y-z',
    //   units: [
    //     {
    //       door: [{
    //         componentBasic: {
    //           id: Math.random() * 100,
    //           componentId: '1',
    //           name: '1',
    //           typeCode: '10935',
    //           typeName: '2',
    //           imageUrl: 'https://images2.pianshen.com/293/9c/9c0bb1694c8f738f7680ae4a4903c34d.png',
    //           colorCode: '10935',
    //           colorName: '颜色名称',
    //           width: '60',
    //           height: '32',
    //           deep: '2',
    //         },
    //         height: '0',
    //       }],
    //     },
    //   ],
    // },
    // {
    //   componentBasic: {
    //     id: 't1',
    //     componentId: 't1',
    //     name: 't1',
    //     typeCode: 't1',
    //     typeName: 't1',
    //     imageUrl: gt1,
    //     width: '120',
    //     height: '64',
    //     deep: '20',
    //     // proportion: '{"x":"0.1","y":"0.1","h":"64","w":"120"}',
    //     proportion: {
    //       x: '0.1', y: '0.1', h: '64', w: '120',
    //     },
    //     mobileProportion: '{“x”:””,”y”:””,”w”:””,”h”:””}',
    //   },
    //   location: 'x-y-z',
    //   units: [
    //     // {
    //     //   door: {
    //     //     componentBasic: {
    //     //       id: '1',
    //     //       componentId: '1',
    //     //       name: '1',
    //     //       typeCode: '1',
    //     //       typeName: '2',
    //     //       imageUrl: '图片url',
    //     //       colorCode: '颜色码',
    //     //       colorName: '颜色名称',
    //     //       width: '60',
    //     //       height: '32',
    //     //       deep: '2',
    //     //     },
    //     //     height: '0',
    //     //   },
    //     //   accessories: [
    //     //     {
    //     //       componentBasic: {
    //     //         id: '1',
    //     //         componentId: '1',
    //     //         name: '1',
    //     //         typeCode: '1',
    //     //         typeName: '1',
    //     //         imageUrl: '图片url',
    //     //         width: '宽',
    //     //         height: '高',
    //     //         deep: '深',
    //     //       },
    //     //       height: '隔板或抽屉距离所在柜体底面的高度',
    //     //     },
    //     //   ],
    //     // },
    //   ],
    //   leg: {
    //     componentBasic: {
    //       id: '1',
    //       componentId: '1',
    //       name: '1',
    //       typeCode: '1',
    //       typeName: '1',
    //       imageUrl: '图片url',
    //       width: '10',
    //       height: '10',
    //       deep: '10',
    //     },
    //     location: [
    //       'x-y-z（支脚坐标，多个支脚有多个坐标系）',
    //     ],
    //   },
    // },
    // {
    //   componentBasic: {
    //     id: 't2',
    //     componentId: 't1',
    //     name: 't1',
    //     typeCode: 't1',
    //     typeName: 't1',
    //     imageUrl: dsj,
    //     width: '120',
    //     height: '64',
    //     deep: '20',
    //     proportion: {
    //       x: '100', y: '100', h: '64', w: '180',
    //     },
    //     mobileProportion: '{“x”:””,”y”:””,”w”:””,”h”:””}',
    //   },
    //   location: 'x-y-z',
    //   units: [
    //     {
    //       basic: {
    //         id: 'con1',
    //         componentId: 't1',
    //         name: 't1',
    //         typeCode: 't1',
    //         typeName: 't1',
    //         imageUrl: gt1,
    //         width: '60',
    //         height: '64',
    //         deep: '20',
    //       },
    //     },
    //     {
    //       basic: {
    //         id: 'con2',
    //         componentId: 't1',
    //         name: 't1',
    //         typeCode: 't1',
    //         typeName: 't1',
    //         imageUrl: gt1,
    //         width: '60',
    //         height: '64',
    //         deep: '20',
    //       },
    //     },
    //   ],
    //   leg: {
    //     componentBasic: {
    //       id: '1',
    //       componentId: '1',
    //       name: '1',
    //       typeCode: '1',
    //       typeName: '1',
    //       imageUrl: '图片url',
    //       width: '10',
    //       height: '10',
    //       deep: '10',
    //     },
    //     location: [
    //       'x-y-z（支脚坐标，多个支脚有多个坐标系）',
    //     ],
    //   },
    // },
  ],
  propping: [
    // {
    //   id: 'tv-1',
    //   name: '名称',
    //   code: '类型码',
    //   imageUrl: tvImg,
    //   width: 183,
    //   height: 105,
    //   deep: 20,
    //   location: 'x-y-z',
    //   proportion: {
    //     x: 0,
    //     y: 0,
    //   },
    //   mobileProportion: 'online里的装饰物和和画布之间的比例，保留4位小数,{“x”:””,”y”:””,”w”:””,”h”:””}',
    // },
  ],
};
