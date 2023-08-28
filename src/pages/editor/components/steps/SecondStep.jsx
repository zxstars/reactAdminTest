import React, {
  useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  List, Card, Empty,
} from 'antd';
import arrowBack from '@/assets/editor/door/arrow-back.png';
import nextStepArrow from '@/assets/editor/door/next-step-arrow.png';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getDoorColorLists, getDoorInfoLists } from '@/api/editor';
import { multiple } from '@/config/const';
import Parts from './Parts';
import styles from '../../editor.module.scss';

const doorListTitle = new Map();
doorListTitle.set(1, '高光门板');
doorListTitle.set(2, '哑光门板');
doorListTitle.set(3, '功能门板');
doorListTitle.set(4, '木色门板');
doorListTitle.set(5, '艺术门板');
const SecondStep = ({
  defaultPos, chooseCabinetCurrent, chooseCabinetDoorCurrent, setPosData,
}) => {
  const { t } = useTranslation();
  const [doorList, setDoorList] = useState([]); // 门板数据
  const [isChoosePart, setPart] = useState(true); // 配件选择
  const [doorTypeInx, seDoorTypeInx] = useState(null); // 门板类型
  const [doorInx, seDoorInx] = useState(null); // 门板类型下门板
  const partsRef = useRef(); // part子组件调用
  const chooseDoorRef = useRef(); // part子组件调用
  const noDoorStatus = useRef(false); // 没有门板的默认状态
  // 选择门板颜色
  const handleChooseDoor = (e, typeInx, inx, item) => {
    e.stopPropagation();
    e.preventDefault();
    chooseDoorRef.current = item;
    const doorLists = defaultPos.frames[chooseCabinetCurrent]
      ?.units[chooseCabinetDoorCurrent]?.door || [];
    const typeCodeList = doorLists.map((v) => ({
      width: v.componentBasic.width * multiple,
      height: v.componentBasic.height * multiple,
      depth: v.componentBasic.deep * multiple,
      typeCode: v.componentBasic.typeCode,
    }));

    if (!typeCodeList.length) {
      return;
    }
    getDoorInfoLists({
      language: 'zh',
      id: item.id,
      colorName: item.colorName,
      appearanceInfos: typeCodeList,

    }).then((res) => {
      if (res.list) {
        const newPosData = JSON.parse(JSON.stringify(defaultPos));
        // newPosData.frames[chooseCabinetCurrent].units[chooseCabinetDoorCurrent].door = res.list;
        newPosData.frames[chooseCabinetCurrent].units[chooseCabinetDoorCurrent]?.door.forEach((v, vx) => {
          // v.componentBasic = res.list[vx];
          v.componentBasic = {
            ...res.list[vx],
            drawerPanelFlag: v.componentBasic.drawerPanelFlag,
          };
        });
        setPosData({
          ...newPosData,
        });
      }
    });
    seDoorTypeInx(typeInx);
    seDoorInx(inx);
  };

  // 更换门板
  // eslint-disable-next-line no-unused-vars
  const handleChangeDoorColor = () => {
    const doorLists = defaultPos.frames[chooseCabinetCurrent]
      ?.units[chooseCabinetDoorCurrent].door;
    const typeCodeList = doorLists.map((v) => ({
      width: v.componentBasic.width * multiple,
      height: v.componentBasic.height * multiple,
      depth: v.componentBasic.deep * multiple,
      typeCode: v.componentBasic.typeCode,
    }));

    getDoorInfoLists({
      language: 'zh',
      id: chooseDoorRef.current.id,
      colorName: chooseDoorRef.current.colorName,
      appearanceInfos: typeCodeList,

    }).then((res) => {
      if (res.list) {
        const newPosData = JSON.parse(JSON.stringify(defaultPos));
        // newPosData.frames[chooseCabinetCurrent].units[chooseCabinetDoorCurrent].door = res.list;
        newPosData.frames[chooseCabinetCurrent].units[chooseCabinetDoorCurrent].door.forEach((v, vx) => {
          v.componentBasic = res.list[vx];
        });
        setPosData({
          ...newPosData,
        });
      }
    });
  };

  // 打开配件选择
  const handleChooseParts = () => {
    setPart(false);
  };
  // 关闭配件选择
  const handleBackChooseDoor = () => {
    setPart(true);
  };

  // 获取门板颜色列表
  const handleDoorColrList = (query) => {
    getDoorColorLists({
      language: 'zh',
      ...query,
    }).then((res) => {
      if (res.list) {
        setDoorList(res.list);
      }
    });
  };

  useEffect(() => {
    handleDoorColrList({
      typeCode: '',
    });
  }, []);

  useEffect(() => {
    if (chooseCabinetCurrent === null || chooseCabinetDoorCurrent === null) {
      seDoorTypeInx(null);
      seDoorInx(null);
      return;
    }
    // const { typeCode } = defaultPos.frames[chooseCabinetCurrent]
    //   ?.units[chooseCabinetDoorCurrent].door[0]?.componentBasic;
    const doorLists = defaultPos.frames[chooseCabinetCurrent]
      ?.units[chooseCabinetDoorCurrent]?.door || [];
    const typeCodeList = doorLists.map((v) => v.componentBasic.typeCode);
    if (typeCodeList.length) {
      noDoorStatus.current = false;
    } else {
      noDoorStatus.current = true;
    }
    handleDoorColrList({
      typeCode: typeCodeList.toString(),
    });
  }, [chooseCabinetCurrent, chooseCabinetDoorCurrent]);


  return (
    <>
      <span className={styles['step-title']}>
        {`${t('第二步')}: ${t('颜色与配件')}`}
      </span>
      {
        isChoosePart ? (
          <>
            <span className={styles['step-descript-title']}>
              {`${t('请点击柜体并选择门板颜色')}`}
            </span>
            <div className={styles['step-two-content']}>
              <>
                {
                  doorList.length ? doorList.map((v, vx) => (
                    <List
                      header={(
                        <div className={styles['step-two-content-title']}>
                          {
                            doorListTitle.get(v.groupType)
                          }
                        </div>
                      )}
                      key={v.groupType}
                    >
                      <Card bordered={false}>
                        {
                          v.colors.length ? v.colors.map((item, inx) => (
                            <Card.Grid
                              // className={}
                              key={item.id}
                              hoverable={false}
                              onClick={(e) => (chooseCabinetDoorCurrent === null
                                ? '' : handleChooseDoor(e, vx, inx, item))}
                              //
                              className={{
                                [styles.active]: doorTypeInx === vx && doorInx === inx,
                                [styles['second-step-door-defalut']]: chooseCabinetDoorCurrent === null
                                 || noDoorStatus.current,
                              }}
                            >
                              <img disabled src={item.imageUrl} width="60" height="60" alt="" />
                            </Card.Grid>
                          )) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          )
                        }
                      </Card>
                    </List>
                  )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

                }
              </>
            </div>
            {/* <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
            >
              <Button
                type="primary"
                disabled={chooseCabinetDoorCurrent == null}
                className={[styles['normal-btn'], styles['first-next-step-btn'], styles['second-step-door-ok']]}
                onClick={handleChangeDoorColor}
              >
                {t('确定')}
              </Button>
            </div> */}
            <div
              // className={[styles['second-step-door-next'], doorInx !== nul? styles['point-active'] : null].join(' ')}
              // onClick={doorInx !== null ? handleChooseParts : null}
              className={[styles['second-step-door-next'], styles['point-active']].join(' ')}
              onClick={handleChooseParts}
              // onClick={handleChooseParts}
              role="none"
            >
              {/* <span className={[doorInx !== null ? '' : styles.disabled]}>{t('已选好颜色,开始选配件')}</span> */}
              <span>{t('已选好颜色,开始选配件')}</span>
              <img src={nextStepArrow} alt="" />
            </div>
          </>
        ) : (
          <>
            <img src={arrowBack} alt="" onClick={handleBackChooseDoor} role="none" />
            <Parts ref={partsRef} />
          </>
        )
      }

    </>
  );
};


// 获取state值
const mapStateToProps = (state) => ({
  chooseCabinetCurrent: state.editorReducers.chooseCabinetCurrent,
  chooseCabinetDoorCurrent: state.editorReducers.chooseCabinetDoorCurrent,
  defaultPos: state.editorReducers.defaultPos,
});

// 改变state的值的方法
const mapDispatchToProps = (dispatch) => ({
  setPosData: (data) => {
    dispatch({ type: 'SET_POS', payload: data });
  },
});
SecondStep.prototype = {
  chooseCabinetCurrent: PropTypes.number,
  chooseCabinetDoorCurrent: PropTypes.number,
  defaultPos: PropTypes.object,
};

SecondStep.defaultProps = {
  chooseCabinetCurrent: 0,
  chooseCabinetDoorCurrent: 0,
  defaultPos: {},
};


export default connect(mapStateToProps, mapDispatchToProps)(SecondStep);
