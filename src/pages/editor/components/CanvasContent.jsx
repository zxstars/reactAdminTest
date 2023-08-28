
import React from 'react';
import {
  cabinetUnitWidth,
  canvasMargin,
  TwentyblankSpace,
  blankSpace,
  legHeight,
} from '@/config/const';
import { handleComplegPosX } from '../service';
import styles from '../editor.module.scss';

/**
 * @param object* mobileOriginPos  截屏后的坐标
 * @param object* posData  画布数据(TemplateJson)
 * @param Array* allCabinetHeight   画布柜体高度数组
 * @param number* stepCurrent  步骤
 * @param number posInx  选中的柜体的下标
 * @param func handleMouseDown 拖拽柜体移动事件
 * @param number doorInx 选中单元下标
 * @param hook setPosInx 设置选中的柜体的下标
 * @param hook setCopy 设置显示复制柜体删除按钮
 * @param hook setDoorChoose 设置选中柜体的门板下标
 * @param hook setDoorChoose 设置选中柜体的门板下标
 * @param ReduxAction setCabinetCurrentset 设置选中柜体的下标
 * @param ReduxAction setCabinetCurrentDoorset 设置选中柜体门板的下标
 * @param func handleTvMouseDown 拖拽电视机移动事件
 * @description 画布渲染组件
 */
export default ({
  mobileOriginPos,
  posData,
  allCabinetHeight,
  posInx,
  stepCurrent,
  handleMouseDown,
  doorInx,
  setPosInx,
  setCopy,
  setDoorChoose,
  setCabinetCurrentset,
  setCabinetCurrentDoorset,
  handleTvMouseDown,
}) => (
  <>
    {/* 顶板 */}
    {
      posData.basic ? posData.basic.topPanel.map((v, vx) => (
        <div
          role="none"
          key={`${v.uuid}`}
          id={`db${vx}`}
        >
          {
            v.componentBasic.map((item, index) => (
              <img
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: `${item.proportion?.y
                    - (mobileOriginPos ? mobileOriginPos?.originStartP.y : 0)
                    + canvasMargin || 'auto'}px`,
                  left: `${item.proportion?.x
                    - (mobileOriginPos ? mobileOriginPos?.originStartP.x : 0)
                    + canvasMargin || 0}px`,
                  zIndex: 1001,
                }}
                width={item.width}
                key={item?.uuid || index}
                src={item?.notInstall ? '' : item.imageUrl}
                alt=""
              />
            ))
          }
        </div>
      )) : ''
    }
    {/* 柜体 */}
    {
      posData.frames ? posData.frames.map((item, index) => (
        <div
          role="none"
          key={`${item.componentBasic?.uuid}${index}`}
          id={`gt${index}`}
          style={{
            position: 'absolute',
            cursor: 'pointer',
            width: `${item.componentBasic.width}px`,
            height: `${allCabinetHeight[index]}px`,
            top: `${item.componentBasic.proportion.y
              - (mobileOriginPos ? mobileOriginPos?.originStartP.y : 0)
              + canvasMargin || 'auto'}px`,
            left: `${item.componentBasic.proportion.x
              - (mobileOriginPos ? mobileOriginPos?.originStartP.x : 0)
              + canvasMargin || 0}px`,
            zIndex: `${1000 - item.componentBasic?.proportion?.y || 1000}`,
          }}
          className={
            posInx === index
             && typeof doorInx === 'object'
             && stepCurrent === 0 ? styles.maxZindex : ''
          }
        >
          <img
            alt=""
            role="none"
            src={item.componentBasic.imageUrl}
            id={`gtc${index}`}
            style={{
              position: 'absolute',
              width: `${item.componentBasic.width}px`,
              height: `${allCabinetHeight[index]}px`,
            }}
            onMouseDown={(e) => handleMouseDown(e, item, index)}
            className={[
              posInx === index
               && typeof doorInx === 'object'
               && stepCurrent === 0 ? styles['cabinet-select'] : '',
            ]}
          />
          {/* 门板和抽屉和单元  */}
          {
            stepCurrent > 0 && item.units.length
              ? item.units.map((v, vx) => {
                if (!Object.keys(v).length) {
                  return '';
                }
                return (
                  <div
                    key={`door${vx}`}
                    role="none"
                    style={{
                      position: 'absolute',
                      width: `${cabinetUnitWidth}px`,
                      height: `calc(100% - ${item.componentBasic.deep === 20
                        ? TwentyblankSpace : blankSpace}px)`,
                      left: `${cabinetUnitWidth * (vx)}px`,
                      top: 'auto',
                      bottom: '0px',
                      zIndex: `${item.componentBasic.proportion.x}`,

                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setPosInx(index);
                      setCopy(true);
                      setDoorChoose(vx);
                      setCabinetCurrentset(index);
                      setCabinetCurrentDoorset(vx);
                    }}
                    className={posInx === index && doorInx === vx ? styles['cabinet-select'] : ''}
                  >
                    {
                      v.door.map((ele, eleInx) => (
                        <img
                          key={ele.componentBasic?.uuid + eleInx}
                          alt=""
                          src={ele.componentBasic.imageUrl}
                          style={{
                            position: 'absolute',
                            width: `${ele.componentBasic.width}px`,
                            left: '0px',
                            top: 'auto',
                            bottom: `${ele.height}px`,
                            padding: posInx === index && doorInx === vx ? '1px 3px 1px 1px' : '',
                          }}
                        />
                      ))
                    }
                  </div>
                );
              }) : ''
          }
        </div>
      )) : ''
    }
    {/* 桌角 */}
    {
      posData.basic ? posData.basic.legs.map((v, vx) => (
        <div
          role="none"
          key={`${v.uuid + vx}`}
          id={`db${vx}`}
        >
          {
            v.componentBasic.map((item, index) => (
              <img
                height={item?.height || legHeight}
                key={`${item.uuid + index}`}
                src={item.imageUrl}
                alt=""
                style={{
                  position: 'absolute',
                  left: `${handleComplegPosX(item, index, v.componentBasic.length, mobileOriginPos)}px`,
                  top: 'auto',
                  bottom: '0',
                  zIndex: '1002',
                  transform: index > 0 && (index + 1) % 2 === 0 ? 'rotateY(180deg)' : '',
                  transformOrigin: index > 0 && (index + 1) % 2 === 0 ? 'left' : '',
                }}
              />
            ))
          }
        </div>
      )) : ''
    }
    {/* 电视机 */}
    {
      posData.propping ? posData.propping.map((item, index) => (
        <div
          role="none"
          key={`${item.id}`}
          id="tvDom"
          style={{
            position: 'absolute',
            cursor: 'pointer',
            width: `${item.width}px`,
            height: `${item.height}px`,
            top: `${item.proportion.y
              - (mobileOriginPos ? mobileOriginPos?.originStartP.y : 0)
              + canvasMargin || 'auto'}px`,
            left: `${item.proportion.x
              - (mobileOriginPos ? mobileOriginPos?.originStartP.x : 0)
               + canvasMargin || 0}px`,
            zIndex: 1001,
          }}
        >
          <img
            alt=""
            role="none"
            id={`tv${index}`}
            src={item.imageUrl}
            style={{
              position: 'absolute',
              width: `${item.width}px`,
              height: `${item.height}px`,
              zIndex: 3003,
            }}
            onMouseDown={(e) => handleTvMouseDown(e, item, index)}
          />
        </div>
      )) : ''
    }
  </>
);
