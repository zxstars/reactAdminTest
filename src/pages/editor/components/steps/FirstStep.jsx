import React, {
  useState, useEffect, useRef,
} from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  Form, Select, Button, message,
} from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  cabinetWidthOptions, cabinetHeightOptions, cabinetDeepOptions,
  tvTypeCode, normalTypeCode, TwentyblankSpace, blankSpace, localCabinetColors,
} from '@/config/const';
import { getCabinetStructure, getCabinetColor, getStructureColor } from '@/api/editor';
import styles from '../../editor.module.scss';
import auth from '@/utils/auth';

// 获取state值
const mapStateToProps = (state) => ({
  defaultPos: state.editorReducers.defaultPos,
});

// 改变state的值的方法
const mapDispatchToProps = (dispatch) => ({
  setCabinetCount: (data) => {
    dispatch({ type: 'SET_CABINET_COUNT', payload: data });
  },
  setPosData: (data) => {
    dispatch({ type: 'SET_POS', payload: data });
  },
});
const FirstStep = connect(mapStateToProps, mapDispatchToProps)(({
  setPosData, setCabinetCount, defaultPos, handleSaveSizeInfo, fieldsData,
}) => {
  const { t } = useTranslation();

  const [form] = Form.useForm();

  const [colorList, setColorList] = useState([]); // 颜色列表
  const [colorId, setColor] = useState(null);// 颜色选择
  const [deepId, setDeepId] = useState(null);// 深度选择
  const [heightId, setHeightId] = useState(null); // 高度选择
  const allPosDataRef = useRef(); // 柜体数据


  // const [deepId, setDeepId] = useState(1);
  // 选择颜色
  const handleChangeColor = (id) => {
    // setDeepId(id);
    setColor(id);
  };
  // 选择深度
  const handleChangeDeep = (id) => {
    setDeepId(id);
  };
  // 选择高度
  const handleChangeHeight = (id) => {
    setHeightId(id);
  };
  // 判断是否是默认添加柜体的位置
  const isDefaultPos = (data) => {
    let flag = false;
    data.forEach((v) => {
      const topBlank = v.componentBasic.deep === 20 ? TwentyblankSpace : blankSpace;
      if (v.componentBasic.proportion.x === 0
          && 380 - topBlank - v.componentBasic.height - v.componentBasic.proportion.y === 0
      ) {
        flag = true;
      }
    });
    return flag;
  };

  const hangeGetStructureColor = ({
    color,
    depth,
    width,
    height,
    typeCode,
  }) => {
    getCabinetStructure({
      color,
      depth,
      width,
      height,
      typeCode,
    }).then((res) => {
      // console.log();
      const { componentBasic, units } = res;
      if (res.componentBasic) {
        // 判断是否存在默认柜体
        const isDefault = isDefaultPos(defaultPos.frames);
        if (isDefault) {
          message.error('请将上一个添加到画布的默认柜体摆放到正确位置');
          return;
        }
        if (!res.componentBasic.imageUrl) {
          message.error('请求柜体素材失败');
          return;
        }
        const initData = allPosDataRef.current ? allPosDataRef.current : defaultPos;
        const topBlank = componentBasic.deep === 20 ? TwentyblankSpace : blankSpace;
        const newPosData = {
          ...initData,
          frames: [
            ...initData.frames,
            {
              componentBasic: {
                ...componentBasic,
                proportion: {
                  ...componentBasic.proportion,
                  y: 380 - componentBasic.height - topBlank,
                },
              },
              units,
            },
          ],
        };
        allPosDataRef.current = newPosData;
        setPosData(newPosData);
        setCabinetCount(newPosData.frames.length);
      }
    });
  };

  // 添加柜体
  const addCabinet = () => {
    form.validateFields()
      .then((fileds) => {
        const {
          width, height, depth, color,
        } = fileds;

        let diffWidth = width;
        let typeCode = normalTypeCode;

        if (height) {
          switch (width) {
            case 1:
              diffWidth = 60;
              break;
            case 2:
              diffWidth = 120;
              break;
            case 3:
              diffWidth = 120;
              typeCode = tvTypeCode;
              break;
            case 4:
              diffWidth = 180;
              typeCode = tvTypeCode;
              break;
            default:
              break;
          }
        }


        const editorColorName = localStorage.getItem('editor-color');
        if (editorColorName !== color) {
          let components = [];
          components = defaultPos.frames.map((item) => ({
            componentId: item.componentBasic.componentId,
            uuid: item.componentBasic.uuid,
          }));

          getStructureColor({
            colorName: color,
            components,
          }).then((res) => {
            if (res.list) {
              const newPosData = JSON.parse(JSON.stringify(defaultPos));
              const newstructData = res.list;

              newPosData.frames.forEach((item, index) => {
                if (item.componentBasic.uuid === newstructData[index].uuid) {
                  item.componentBasic = {
                    ...item.componentBasic,
                    ...newstructData[index],
                  };
                }
              });
              allPosDataRef.current = newPosData;
              // setPosData(newPosData);
              localStorage.setItem('editor-color', color);
            }
            hangeGetStructureColor({
              color,
              depth: depth * 10,
              width: diffWidth * 10,
              height: height * 10,
              typeCode,
            });
          });
        } else {
          hangeGetStructureColor({
            color,
            depth: depth * 10,
            width: diffWidth * 10,
            height: height * 10,
            typeCode,
          });
        }
        handleSaveSizeInfo(fileds);

        // form.resetFields();
        // const baseData = { ...defaultAddCabinetInfo };
        // const baseData = width === '180'
        //   ? defaultAddCabinetInfo(width, height, depth, color) : defaultDg(diffWidth, height, depth);
        // const newPosData = {
        //   ...defaultPos,
        //   frames: [
        //     ...defaultPos.frames,
        //     baseData,
        //   ],
        // };
        // setPosData(newPosData);
        // setCabinetCount(newPosData.frames.length);
        // form.resetFields();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getColorList = () => {
    getCabinetColor().then((res) => {
      if (res.list) {
        setColorList([...res.list]);
        auth.setLocalCache(localCabinetColors, res.list);
      }
    });
  };

  useEffect(() => {
    // getColorList();
    handleChangeDeep(fieldsData.depth);
    handleChangeHeight(fieldsData.height);
  }, [fieldsData]);
  useEffect(() => {
    const colorLists = auth.getLocalCache(localCabinetColors);
    if (colorLists && colorLists.length) {
      setColorList([...colorLists]);
      return;
    }
    getColorList();
  }, []);


  return (
    <>
      <span className={styles['step-title']}>
        {`${t('第一步')}:${t('柜体设计')}`}
      </span>
      <Form
        form={form}
        layout="vertical"
        className={styles['cabinet-design-form']}
      >
        <Form.Item
          name="color"
          initialValue={fieldsData?.color}
          label={<Trans>柜体颜色</Trans>}
          rules={[{ required: true, message: '请选择柜体颜色' }]}
        >
          <Select optionLabelProp="title" onChange={handleChangeColor}>
            {
              colorList.map((v) => (
                <Select.Option key={v.id} value={v.validDesignText} title={v.validDesignText}>
                  <>
                    {/* <span
                      className={styles['cabinet-design-first-color']}
                      style={{
                        background: `${v.color}`,
                      }}
                    /> */}
                    <img className={styles['cabinet-design-first-color']} src={v.imageUrl} alt="" />
                    <span className={styles['cabinet-design-first-span']}>{v.validDesignText}</span>
                  </>
                </Select.Option>
              ))
            }
          </Select>
        </Form.Item>
        <Form.Item
          name="depth"
          initialValue={fieldsData?.depth}
          label={<Trans>柜体深度</Trans>}
          rules={[{ required: true, message: '请选择柜体深度' }]}
        >
          <Select onChange={handleChangeDeep}>
            {
              colorId || fieldsData?.depth
                ? (cabinetDeepOptions.map((v) => <Select.Option key={v.id} value={v.value}>{v.title}</Select.Option>))
                : ''
            }
          </Select>
        </Form.Item>
        <Form.Item
          name="height"
          initialValue={fieldsData?.height}
          label={<Trans>柜体高度</Trans>}
          rules={[{ required: true, message: '请选择柜体高度' }]}
        >
          <Select onChange={handleChangeHeight}>
            {
              cabinetHeightOptions[deepId] ? cabinetHeightOptions[deepId].map((v) => (
                <Select.Option key={v.id} value={v.value}>
                  {v.title}
                </Select.Option>
              )) : []
            }
          </Select>
        </Form.Item>
        <Form.Item
          name="width"
          initialValue={fieldsData?.width}
          label={<Trans>柜体宽度</Trans>}
          rules={[{ required: true, message: '请选择柜体宽度' }]}
        >
          <Select>
            {
              cabinetWidthOptions[`${deepId}-${heightId}`] ? cabinetWidthOptions[`${deepId}-${heightId}`].map((v) => (
                <Select.Option key={v.id} value={v.id} title={v.title}>
                  {v.title}
                </Select.Option>
              )) : []
            }
          </Select>
        </Form.Item>

      </Form>
      <Button
        type="primary"
        onClick={addCabinet}
        style={{ float: 'right' }}
        className={[styles['normal-btn'], styles['first-next-step-btn']]}
      >
        {t('添加柜体')}
      </Button>
    </>
  );
});

FirstStep.prototype = {
  setPosData: PropTypes.func,
  onSaveCabinet: PropTypes.func,
  handleSaveSizeInfo: PropTypes.func,
  fieldsData: PropTypes.object,
};

FirstStep.defaultProps = {
  setPosData: () => {},
  handleSaveSizeInfo: () => {},
  fieldsData: {},
};

export default FirstStep;
