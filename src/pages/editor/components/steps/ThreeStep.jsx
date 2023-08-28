import React, {
  useEffect, useState, useImperativeHandle, forwardRef,
} from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  Radio, Space, Form, Select, Modal,
} from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { tvData } from '@/config/const';
import { getTv } from '@/api/editor';
import { tvTypeCode, legHeight } from '@/config/const';
import styles from '../../editor.module.scss';
import { HasImpact } from '../../service';

const { confirm } = Modal;

const ThreeStep = forwardRef(({
  defaultPos, setPosData, cabinetHeights, editData,
}, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [tvData, setTvData] = useState([]);
  const [chooseValue, setChooseValue] = useState('null');

  const cabinetTypes = [
    {
      id: 1,
      value: '1',
      title: '一字型',
    },
    {
      id: 2,
      value: '2',
      title: '二字型',
    },
    {
      id: 3,
      value: '3',
      title: '半包围',
    },
    {
      id: 4,
      value: '4',
      title: '全包围',
    },
    {
      id: 5,
      value: '5',
      title: '特殊',
    },
  ];

  const validateType = () => form.validateFields();

  // 暴露给父组件使用的子组件方法 可以自定义可用的方法等
  useImperativeHandle(ref, () => ({
    validateType,
  }));

  // 选择电视机
  const handleChooseTv = (e) => {
    const { value } = e.target;
    const proporTvData = tvData.filter((v) => v.code === value);

    const isLegHeight = defaultPos.basic.hasLeg ? legHeight : 0;

    // 有tvbanch的情况
    let tvPropppPos = {
      x: 0,
      y: 380 - proporTvData[0].height,
    };
    let hasTvflag = false;
    defaultPos.frames.forEach((item, index) => {
      if (item.componentBasic.typeCode === tvTypeCode
        && (item.componentBasic.proportion.y + cabinetHeights[index] + isLegHeight === 380)
        && !hasTvflag
      ) {
        hasTvflag = true;
        // 大于180的需要左移
        let moveSpace = 0;
        if (item.componentBasic.width > 180) {
          moveSpace = (item.componentBasic.width - 180) / 2;
        }
        tvPropppPos = {
          x: item.componentBasic.proportion.x + (180 - proporTvData[0].width) / 2 - moveSpace,
          y: item.componentBasic.proportion.y - proporTvData[0].height - 5,
        };
      }
    });

    // const defaultPropor = defaultPos.propping.length ? defaultPos.propping[0].proportion : tvPropppPos;
    const defaultPropor = defaultPos.propping.length ? {
      ...defaultPos.propping[0].proportion,
      x: hasTvflag ? tvPropppPos.x : defaultPos.propping[0].proportion.x,
    } : tvPropppPos;
    // const defaultPropor = tvPropppPos;
    // 不加电视机
    const proppData = value !== 'null' ? [
      {
        ...proporTvData[0],
        proportion: {
          ...defaultPropor,
        },
      },
    ] : [];

    let isHasImpact = false;
    if (proppData.length) {
      defaultPos.frames.forEach((item, index) => {
        if (!isHasImpact) {
          const result = HasImpact(item, {
            componentBasic: proppData[0],
          }, index, null, 'tv');
          if (result) {
            confirm({
              title: '添加电视机后会与柜体重叠，请重新摆放柜体或强制摆放',
              okText: '确定',
              cancelText: '取消',
              onOk() {
                isHasImpact = true;
                setChooseValue(value);
                setPosData({
                  ...defaultPos,
                  propping: proppData,
                });
              },
              onCancel() {
                setChooseValue('null');
                setPosData({
                  ...defaultPos,
                  propping: [],
                });
              },
            });
          }
        }
      });
    }

    if (!isHasImpact) {
      setChooseValue(value);
      // 写入数据
      setPosData({
        ...defaultPos,
        propping: proppData,
      });
    }
  };

  useEffect(() => {
    getTv({
      language: 'zh',
    }).then((res) => {
      // console.log(res);
      if (res.list) {
        const newTvLists = res.list;

        setTvData([
          ...newTvLists,
          {
            id: Math.random() * 100,
            name: '不需要电视机关',
            code: 'null',
          },
        ]);
      }
    });
  }, []);

  useEffect(() => {
    if (editData && editData.propping[0]?.code && tvData.length) {
      // setChooseValue();
      handleChooseTv({ target: { value: editData.propping[0].code } });
    }
  }, [tvData]);

  return (
    <div className={styles['step-three-wrapper']}>
      <span className={styles['step-title']}>
        {`${t('第三步')}: ${t('添加饰物')}`}
      </span>
      <span className={styles['step-descript-title']}>
        {`${t('选择电视机')}`}
      </span>
      <div className={styles['step-three-tv-content']}>
        <Radio.Group defaultValue="null" onChange={handleChooseTv} value={chooseValue}>
          <Space direction="vertical" size={25}>
            {
              tvData.map((v) => (
                <Radio key={v.id} value={v.code}>
                  {v.name.slice(0, -1)}
                </Radio>
              ))
            }
          </Space>
        </Radio.Group>
      </div>
      <Form
        form={form}
        layout="vertical"
        className={[styles['cabinet-design-form'], styles['step-three-tv-form']]}

      >
        <Form.Item
          initialValue={defaultPos.basic?.type}
          name="type"
          label={<Trans>组合类型</Trans>}
          rules={[{ required: true, message: '请选择组合类型' }]}
        >
          <Select>
            {
              cabinetTypes.map((v) => <Select.Option key={v.id} value={v.value}>{v.title}</Select.Option>)
            }
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
});
// 获取state值
const mapStateToProps = (state) => ({
  defaultPos: state.editorReducers.defaultPos,
  cabinetHeights: state.editorReducers.cabinetHeights,
  editData: state.editorReducers.editData,
});


// 改变state的值的方法
const mapDispatchToProps = (dispatch) => ({
  setPosData: (data) => {
    dispatch({ type: 'SET_POS', payload: data });
  },
});

ThreeStep.prototype = {
  defaultPos: PropTypes.object,
  setPosData: PropTypes.func,
  cabinetHeights: PropTypes.array,
  editData: PropTypes.object || null,
};

ThreeStep.defaultProps = {
  defaultPos: {},
  setPosData: () => {},
  cabinetHeights: [],
  editData: {} || null,
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ThreeStep);
