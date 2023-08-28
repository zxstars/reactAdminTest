import {
  Form, Modal, Select, Table,
} from 'antd';

import propTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import style from '@/pages/homePageTool/index.module.scss';
import { getSceneInternal } from '@/api/billyVirtualSpr';
import utils from '@/utils/util';

const { Option } = Select;

const EditModal = (props) => {
  const {
    editVisible, setEditVisible, editValues, setEditIsChange,
    dataSource, setDataSource, areaType, setAreaType, setDataIsChange,
  } = props;
  const [boxSelectValue, setBoxSelectValue] = useState([]);
  const [form] = Form.useForm();
  // 全部的场景下的商品信息
  const [defaultAreaType, setDefaultAreaType] = useState('');
  const [defaultDataSource, setDefaultDataSource] = useState([]);
  const [sceneInternal, setSceneInternal] = useState([]);
  const [internalTypeObject] = useState({
    1: '杯子',
    2: '杯子+咖啡壶',
    3: '背包',
    4: '便携式蓝牙音箱',
    5: '餐具',
    6: '储物盒',
    7: '花瓶',
    8: '花瓶+香烛',
    9: '画框',
    10: '镜子',
    11: '蜡烛台',
    12: '闹钟',
    13: '闹钟+书籍',
    14: '闹钟+植被',
    15: '书籍',
    16: '书籍+储物盒',
    17: '玩具',
    18: '文件盒',
    19: '香烛',
    20: '鞋子',
    21: '植被',
    22: '植被+储物盒',
    23: '装饰品',
    24: '装饰品+书籍',
    25: '装饰品+植被',
  });


  const onChangeArea = (e) => {
    setAreaType(e);
    dataSource.forEach((item) => {
      Object.keys(item).forEach((key) => {
        item[key].internalValueItem = '';
        item[key].allInternalValueItem = [];
        item[key].internalName = '';
      });
    });
    console.log('defaultDataSource', defaultDataSource);
    console.log('dataSource', dataSource);
    console.log('defaultAreaType', defaultAreaType);
    console.log('areaType', areaType);
  };

  // eslint-disable-next-line max-len
  const getSelectBox = (text) => boxSelectValue.find((item) => item.type === Number(areaType))?.internalInfoVOList.map((item) => {
    if (text.height * 1000 > item.height) {
      return {
        value: item.internalType,
        key: Math.random(),
        label: internalTypeObject[item.internalType],
      };
    }
  }).filter((item) => item);


  const getBoxSelectValue = () => {
    getSceneInternal().then((re) => {
      if (re.success) {
        const boxSelectValueList = [];
        setSceneInternal(re.list);
        console.log(' re.list', re.list);
        // 去重场景下的商品信息
        re.list.forEach((internalValueItem) => {
          // eslint-disable-next-line no-shadow
          const test = [];
          const iVOList = internalValueItem?.internalInfoVOList.filter((item) => {
            if (!test.find(((value) => item.internalType === value))) {
              test.push(item.internalType);
              return true;
            }
            return false;
          });
          boxSelectValueList.push({
            internalInfoVOList: iVOList,
            id: internalValueItem.id,
            name: internalValueItem.name,
            type: internalValueItem.type,
          });
        });
        console.log('boxSelectValueList', boxSelectValueList);
        setBoxSelectValue(boxSelectValueList);
      }
    });
  };

  const getColumns = () => {
    const columns = editValues.map((item, e) => (
      {
        title: `第${e + 1}列`,
        dataIndex: `${e + 1}index`,
        minWidth: 300,
        onCell: (record) => {
          if (record[`${e + 1}index`].isBlank) {
            return {
              style: { borderBottom: 0, minWidth: '200px' },
            };
          }
          if (record[`${e + 1}index`].height * 1000 > 120) {
            return {
              style: { borderTop: '1px solid #f0f0f0', minWidth: '200px' },
            };
          }
          return {
            style: { borderTop: '1px solid #f0f0f0', background: '#fafafa', minWidth: '200px' },
          };
        },
        render: (text, record) => {
          if (!record[`${e + 1}index`].isBlank) {
            if (text.height * 1000 > 120) {
              return (
                <div>
                  <Select
                    allowClear
                    bordered={false}
                    size="large"
                    style={{ width: '100%' }}
                    defaultValue={text.internalName}
                    key={Math.random()}
                    onSelect={(key) => {
                      // eslint-disable-next-line max-len,no-shadow
                      record[`${e + 1}index`].internalValueItem = boxSelectValue.find((item) => item.id === Number(areaType)).internalInfoVOList.find((item) => item.internalType === Number(key));
                      record[`${e + 1}index`].internalName = internalTypeObject[text.internalValueItem.internalType];
                      // eslint-disable-next-line max-len,no-shadow
                      record[`${e + 1}index`].allInternalValueItem = sceneInternal.find((item) => item.id === Number(areaType)).internalInfoVOList.filter((item) => item.internalType === Number(key) && text.height * 1000 > item.height);
                    }}
                    onClear={() => {
                      record[`${e + 1}index`].internalValueItem = {};
                      record[`${e + 1}index`].allInternalValueItem = [];
                      record[`${e + 1}index`].internalName = '';
                    }}
                    options={getSelectBox(text)}
                  />
                </div>
              );
            }
            return (
              <div style={{ height: '38px' }} />
            );
          }
        },
      }
    ));
    console.log('columns', columns);
    return columns;
  };

  // useEffect(() => {
  //
  // }, []);

  useEffect(() => {
    if (editVisible) {
      console.log('dataSource', dataSource);
      setDefaultAreaType(areaType);
      setDefaultDataSource(utils.deepClone(dataSource));
      getBoxSelectValue();
      form.setFieldsValue({
        area: {
          1: '书柜',
          2: '展示柜',
          3: '鞋柜',
          4: '玄关柜',
          5: '餐边柜',
          6: '储物柜',
        }[areaType],
      });
      setEditIsChange(true);
    }
  }, [editVisible]);


  const handleCancel = () => {
    setDataSource(defaultDataSource);
    setAreaType(defaultAreaType);
    setEditVisible(false);
  };

  const handleOk = () => {
    setEditIsChange(JSON.stringify(defaultDataSource) === JSON.stringify(dataSource));
    const data = {
      type: 'init',
      name: boxSelectValue.find((item) => item.id === Number(areaType)).name,
      data: dataSource.map((dataSourceItem) => Object.values(dataSourceItem).map((e) => {
        if (e.isBlank) {
          return undefined;
        }
        return e;
      })),
    };
    console.log('data', data);

    const childFrameObj = document.getElementById('myFrame');
    childFrameObj.contentWindow.postMessage(data, '*');
    setEditVisible(false);
    setDataIsChange(true);
  };

  return (
    <div className={style}>
      <Modal
        title="设计内饰"
        visible={editVisible}
        onCancel={handleCancel}
        okText="确认"
        cancelText="取消"
        onOk={handleOk}
        destroyOnClose
        width={1000}
      >
        <Form form={form}>
          <Form.Item
            name="area"
            label="选择场景"
            labelAlign="left"
            labelCol={{ span: 4 }}
          >
            <Select
              placeholder="请选择"
              className={style.category}
              style={{ width: '300px' }}
              value={areaType}
              onChange={onChangeArea}
            >
              <>
                <Option value="1" key="1">书柜</Option>
                <Option value="2" key="2">展示柜</Option>
                <Option value="3" key="3">鞋柜</Option>
                <Option value="4" key="4">玄关柜</Option>
                <Option value="5" key="5">餐边柜</Option>
                <Option value="6" key="6">储物柜</Option>
              </>
            </Select>
          </Form.Item>
          <Form.Item
            name="internal"
            label="选择内饰"
            labelAlign="left"
            labelCol={{ span: 4 }}
          >
            <Table
              dataSource={dataSource}
              bordered
              columns={getColumns()}
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};


EditModal.prototype = {
  editVisible: propTypes.bool.isRequired,
  setEditVisible: propTypes.func.isRequired,
  setAreaType: propTypes.func.isRequired,
  editValues: propTypes.object.isRequired,
  dataSource: propTypes.object.isRequired,
  areaType: propTypes.string.isRequired,
};

export default EditModal;
