import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import {
  Button, Card, List, Tabs,
} from 'antd';
import testGt3 from '@/assets/editor/BestaTest/Besta_test_front_12_def.png';
import styles from '@/pages/editor/editor.module.scss';
import PropTypes from 'prop-types';
import { getAllCabinetStructure } from '@/api/editor';

const { TabPane } = Tabs;

// memo添加渲染判断函数后，会导致父组件数据不能更新
// function areEqual(prevProps, nextProps) {
//   console.log(prevProps, nextProps);
//   if (prevProps.choosePosData?.componentBasic?.uuid === nextProps.choosePosData?.componentBasic?.uuid) {
//     return true;
//   }
//   return false;
// }
const AddStruct = React.memo(({ onChooseStruct, choosePosData }) => {
  const typeList = [
    {
      id: 1,
      name: '含隔板',
      data: [],
    },
    {
      id: 2,
      name: '含抽屉',
      data: [],
    },
    {
      id: 3,
      name: '含玻璃门板',
      data: [],
    },
  ];
  const [allData, setAllData] = useState([]); // 所有数据
  const [cureent, setCurrent] = useState(0); // 内部结构类型tab选择 1-含隔板 2...
  const [chooseCurrent, setChooseCurrent] = useState(null); // 每个类型的内部结构

  // 内部结构切换tab
  const handleChangeTab = (typeCur) => {
    setCurrent(typeCur);
    setChooseCurrent(null);
    const {
      width, height, deep, typeCode,
    } = choosePosData.componentBasic;
    const color = localStorage.getItem('editor-color');
    getAllCabinetStructure({
      width: width * 10,
      height: height * 10,
      depth: deep * 10,
      typeCode,
      color,
      type: typeCur,
    }).then((res) => {
      if (res.list) {
        setAllData([...res.list]);
      }
    });
  };
    // 选择的内部结构
  const handleChooseStruct = (typeInx, strInx, item, type) => {
    if (type === 'all') {
      setChooseCurrent(strInx);
      onChooseStruct(item, strInx);
    } else {
      onChooseStruct(item, strInx);
      setCurrent(typeInx + 1);
      setChooseCurrent(strInx);
    }
  };

  // 获取内部结构
  useEffect(() => {
    if (!choosePosData.componentBasic) {
      return;
    }
    const {
      width, height, deep, typeCode,
    } = choosePosData.componentBasic;
    const color = localStorage.getItem('editor-color');
    getAllCabinetStructure({
      width: width * 10,
      height: height * 10,
      depth: deep * 10,
      typeCode,
      color,
    }).then((res) => {
      if (res.list) {
        setAllData([...res.list]);
        setChooseCurrent(null);
      }
    });
  }, [choosePosData]);

  return (
    <div className={styles['addstruct-content']}>
      <span className={styles['addstruct-conten-title']}>
        <Trans>选择柜体结构</Trans>
      </span>

      <Tabs onChange={handleChangeTab}>
        {
          typeList.map((v, index) => (
            <TabPane
              tab={(
                <Button
                  type="primary"
                  shape="round"
                  className={styles['addstruct-type']}
                  style={cureent - 1 === index ? { border: '1px solid #111111' } : {}}
                >
                  {v.name}
                </Button>
              )}
              key={v.id}
            >
              <List
                grid={{ gutter: 18, column: 3 }}
                style={{
                  height: '70%', overflowY: 'auto', overflowX: 'hidden', minHeight: '600px',
                }}
                dataSource={allData}
                renderItem={(item, eleInx) => (
                  <List.Item
                    key={item.componentBasic.uuid}
                    onClick={() => handleChooseStruct(null, eleInx, item, 'all')}
                  >
                    <Card
                      hoverable
                      style={chooseCurrent === eleInx ? { border: '1px solid #111111' } : {}}
                    >
                      <img
                        src={item.componentBasic ? item.componentBasic.imageUrl : testGt3}
                        width="60px"
                        height="60px"
                        alt="structImg"
                      />
                    </Card>
                  </List.Item>
                )}
              />
            </TabPane>
          ))
        }
      </Tabs>
    </div>
  );
});
// }, areEqual);

AddStruct.prototype = {
  onChooseStruct: PropTypes.func,
};
AddStruct.defaultProps = {
  onChooseStruct: () => {},
};

export default AddStruct;
