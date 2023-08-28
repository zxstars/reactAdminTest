import {
  Button, Form, Input, message, Modal, Row, Tabs,
} from 'antd';
import style from '@/pages/billyVirtualSpr/index.module.scss';
import { Trans } from 'react-i18next';
import { useLayoutEffect, useState } from 'react';
import EditModal from '@/pages/billyVirtualSpr/editModal';
import SprList from '@/pages/billyVirtualSpr/sprList';
import {
  // eslint-disable-next-line no-unused-vars
  addVSPR, getTemplateJson, getVSPRById, replacement,
} from '@/api/billyVirtualSpr';
import { getLayerConfig } from '@/utils/spr';
import { Prompt } from 'react-router-dom';

const { confirm } = Modal;

let test1;
export default function BillyVirtualSpr() {
  const [form] = Form.useForm();
  const [showEdit, setShowEdit] = useState(false);
  const [showRefresh, setShowRefresh] = useState(false);
  const [editIsChange, setEditIsChange] = useState(true);

  const [activeKey, setActiveKey] = useState('1');
  const [areaType, setAreaType] = useState('1');
  const [nowDesignCode, setNowDesignCode] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [id, setId] = useState(0);
  // eslint-disable-next-line max-len
  const [iframeUrl, setIframeUrl] = useState(process.env.NODE_ENV === 'development' ? 'http://localhost:3002/offline/propping/' : 'https://billy-offline-web-qa.aidesign.ingka-dt.cn/offline/propping/');
  const [showReplace, setShowReplace] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [isHaveSave, setIsHaveSave] = useState(false);
  const [isHaveUpdated, setIsHaveUpdated] = useState(false);
  const [isHaveReplace, setIsHaveReplace] = useState(false);
  const [editValues, setEditValues] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [dataIsChange, setDataIsChange] = useState(false);
  // const [datas, setDatas] = useState({});


  // eslint-disable-next-line no-nested-ternary
  const url = localStorage.getItem('iframeSrc')
    ? localStorage.getItem('iframeSrc')
    : process.env.NODE_ENV === 'development'
      ? 'http://localhost:3002/offline/propping/'
      : 'https://billy-offline-web-qa.aidesign.ingka-dt.cn/offline/propping/';

  const clearVSPR = () => {
    form.resetFields();
    // eslint-disable-next-line no-nested-ternary
    setIframeUrl(localStorage.getItem('iframeSrc')
      ? localStorage.getItem('iframeSrc')
      : process.env.NODE_ENV === 'development'
        ? 'http://localhost:3002/offline/propping/'
        : 'https://billy-offline-web-qa.aidesign.ingka-dt.cn/offline/propping/');
    setDataSource([]);
    // setDatas({});
  };

  const handleChangeTab = (key) => {
    if (key === '2' && dataIsChange) {
      console.log('dataSource', dataSource);
      setShowReplace(false);
      confirm({
        title: '您即将离开当前页面，所做操作不会保存，确实要离开吗？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          setActiveKey(key);
          form.resetFields();
          clearVSPR();
          setDataIsChange(false);
          setShowRefresh(false);
          setDataIsChange(false);
        },
      });
    } else {
      setActiveKey(key);
      form.resetFields();
      clearVSPR();
      setShowEdit(false);
      setShowRefresh(false);
      setDataIsChange(false);
    }
  };

  const getLayersList = (templateJson) => {
    const newFrames = getLayerConfig(templateJson);
    console.log('newFrames', newFrames);
    setEditValues(newFrames);
    // eslint-disable-next-line max-len
    const LayersList = newFrames.map((itemLayers) => itemLayers.layers.map((item) => ({ ...item, layersNumber: itemLayers.layersNumber })));
    console.log('LayersList', LayersList);
    const maxNum = Math.max.apply(null, LayersList.map((item) => item.length));
    const Layers = [];
    for (let i = 0; i < maxNum; i++) {
      const itemObj = {};
      LayersList.forEach((item, index) => {
        itemObj[`${index + 1}index`] = item[i] || { isBlank: true };
        itemObj[`${index + 1}index`].key = `${index + 1}index`;
      });
      Layers.unshift(itemObj);
    }
    console.log('Layers', Layers);
    setDataSource(Layers);
  };

  const onFinishTemplateJson = () => {
    const data = form.getFieldsValue();
    if (!data.designCode) {
      // eslint-disable-next-line no-nested-ternary
      setIframeUrl(localStorage.getItem('iframeSrc')
        ? localStorage.getItem('iframeSrc')
        : process.env.NODE_ENV === 'development'
          ? 'http://localhost:3002/offline/propping/'
          : 'https://billy-offline-web-qa.aidesign.ingka-dt.cn/offline/propping/');
    } else {
      setShowEdit(false);
      setShowRefresh(false);
      test1 = {};
      getTemplateJson(data).then((re) => {
        console.log('re', re);
        if (re.success) {
          getLayersList(re.templateJson);
          setIframeUrl(url + data.designCode);
          setShowEdit(true);
          setShowRefresh(true);
        }
      }).catch((e) => {
        console.log(e);
        message.warning('当前设计代码不存在/无法支持，请重新输入！');
      });
    }
  };


  // 查询
  const onFinish = () => {
    if (dataIsChange) {
      confirm({
        title: '当前操作，将清空所有操作？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          setNowDesignCode(form.getFieldsValue().designCode);
          onFinishTemplateJson();
        },
      });
    } else {
      setNowDesignCode(form.getFieldsValue().designCode);
      onFinishTemplateJson();
    }
  };

  // 编辑
  const onEdit = () => {
    console.log('dataSource', dataSource);
    setEditVisible(true);
  };

  // 替换
  const onReplace = () => {
    console.log('areaType', areaType);
    confirm({
      title: '确认替换当前方案？',
      onOk() {
        const childFrameObj = document.getElementById('myFrame');
        childFrameObj.contentWindow.postMessage({
          type: 'replace',
          designCode: nowDesignCode,
          areaType,
          dataSource,
        }, '*');
        if (!isHaveReplace) {
          window.addEventListener('message', (event) => {
            const { data, type } = event.data;
            if (type === 'replace') {
              replacement({
                id,
                // internalIndexJson: { internalIndexJson: dataSource },
                internalIndexJson: { internalIndexJson: data.dataSource },
                templateJson: data.template,
                node: data.nodes,
                filepath: data.image,
                designCode: data.designCode,
                scene: Number(data.areaType),
              }).then((res) => {
                if (res.success) setActiveKey('2');
              });
            }
          }, false);
          console.log('dataSource', dataSource);
        }
        setIsHaveReplace(true);
        setDataIsChange(false);
      },
      okText: '确认',
      cancelText: '取消',
    });
  };


  // 保存
  const onSave = () => {
    confirm({
      title: '确认保存当前方案？',
      onOk() {
        const childFrameObj = document.getElementById('myFrame');
        childFrameObj.contentWindow.postMessage({
          type: 'save',
          designCode: nowDesignCode,
          areaType,
          dataSource,
        }, '*');

        if (!isHaveSave) {
          window.addEventListener('message', (event) => {
            const { data, type } = event.data;
            if (type === 'save') {
              addVSPR({
                internalIndexJson: { internalIndexJson: data.dataSource },
                templateJson: data.template,
                node: data.nodes,
                filepath: data.image,
                designCode: data.designCode,
                scene: Number(data.areaType),
              }).then((res) => {
                if (res.success) setActiveKey('2');
              });
            }
          }, false);
          console.log('dataSource', dataSource);
          setDataIsChange(false);
        }
        setIsHaveSave(true);
      },
      okText: '确认',
      cancelText: '取消',
    });
  };
  const onRefresh = () => {
    const childFrameObj = document.getElementById('myFrame');
    childFrameObj.contentWindow.postMessage({ type: 'refresh' }, '*');
  };

  // 管理列表里点击编辑
  const onFromSprTable = (record) => {
    setShowReplace(true);
    setActiveKey('1');
    console.log('record', record);

    setAreaType(String(record.scene));
    setDataSource(record.dataSource);
    setId(record.id);
    const newFrames = getLayerConfig(record.templateJson);
    console.log('newFrames', newFrames);
    setEditValues(newFrames);
    setIframeUrl(url + record.designCode);
    setNowDesignCode(record.designCode);
    const datas = {
      type: 'init',
      name: record.sceneName,
      data: record.dataSource.map((dataSourceItem) => Object.values(dataSourceItem).map((e) => {
        if (e.isBlank) {
          return undefined;
        }
        return e;
      })),
    };
    test1 = datas;
    if (!isHaveUpdated) {
      window.addEventListener('message', (event) => {
        const { type } = event.data;
        console.log('type', type);
        if (type === 'loaded') {
          const childFrameObj = document.getElementById('myFrame');
          childFrameObj.contentWindow.postMessage(test1, '*');
        }
      }, false);
      console.log('dataSource', dataSource);
    }
    setIsHaveUpdated(true);
  };

  useLayoutEffect(() => {
    // 必须是iframe加载完成后才可以向子域发送数据
    const childFrameObj = document.getElementById('myFrame');

    let showButton = false;
    if (childFrameObj.attachEvent) {
      childFrameObj.attachEvent('onload', () => {
      });
    } else {
      childFrameObj.onload = () => {
        // 加载完以后的回调
        console.log('加载完以后的回调aaa');

        if (showButton) {
          setShowEdit(true);
          setShowRefresh(true);
        }
        showButton = true;
      };
    }
    // eslint-disable-next-line no-nested-ternary
    setIframeUrl(localStorage.getItem('iframeSrc')
      ? localStorage.getItem('iframeSrc')
      : process.env.NODE_ENV === 'development'
        ? 'http://localhost:3002/offline/propping/'
        : 'https://billy-offline-web-qa.aidesign.ingka-dt.cn/offline/propping/');
  }, []);
  return (
    <>
      {' '}
      <div>
        <Tabs
          onChange={handleChangeTab}
          activeKey={activeKey}
          type="card"
          items={[
            {
              label: '新增内饰',
              key: '1',
              children: (
                <div className={style.addInterior}>
                  <Form
                    name="complex-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                    form={form}
                  >
                    <Row>
                      <div>
                        <Form.Item
                          getValueFromEvent={
                            (event) => event.target.value
                              .replace(/[\u4E00-\u9FA5?？!！￥@#$%^&*()_+\-=）…（—｛｝{}【】[\]、`~.,，。《》<>|/]/g, '')
                            }
                          name="designCode"
                          label="设计代码"
                        >
                          <Input
                            maxLength={6}
                            placeholder="请输入设计代码"
                            // style={{ width: '220px' }}
                          />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item label=" " colon={false}>
                          {' '}
                          <Button onClick={() => {
                            confirm({
                              title: '当前操作将清空所有操作',
                              onOk() {
                                form.resetFields();
                              },
                              okText: '确认',
                              cancelText: '取消',
                            });
                          }}
                          >
                            <Trans>重置</Trans>
                          </Button>
                        </Form.Item>
                      </div>
                      <div>
                        <Form.Item label=" " colon={false}>
                          <Button type="primary" htmlType="Submit">
                            <Trans>查询</Trans>
                          </Button>
                        </Form.Item>
                      </div>
                    </Row>
                  </Form>
                  <div>
                    <div className={style.btn3d} style={{ display: showEdit ? 'flex' : 'none' }}>
                      <Button type="primary" onClick={onEdit}>
                        <Trans>编辑</Trans>
                      </Button>
                      <Button
                        style={{ display: showReplace ? 'block' : 'none' }}
                        type="primary"
                        disabled={editIsChange}
                        onClick={onReplace}
                      >
                        <Trans>替换</Trans>
                      </Button>
                      <Button
                        style={{ display: showRefresh && showEdit ? 'block' : 'none' }}
                        type="primary"
                        onClick={onRefresh}
                      >
                        <Trans>刷新</Trans>
                      </Button>
                      <Button type="primary" onClick={onSave}>
                        <Trans>保存</Trans>
                      </Button>
                    </div>

                    {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
                    <iframe
                      id="myFrame"
                      width="100%"
                      height={964}
                      frameBorder={1}
                      scrolling="no"
                      referrerPolicy="no-referrer"
                      allow="true"
                      src={iframeUrl}
                    />
                  </div>
                </div>
              ),
            },
            {
              label: '管理列表',
              key: '2',
              children: (
                <SprList
                  onFromSprTable={onFromSprTable}
                  activeKey={activeKey}
                />
              ),
            },
          ]}
        />

      </div>
      <div>
        <EditModal
          editVisible={editVisible}
          editIsChange={editIsChange}
          dataSource={dataSource}
          setEditVisible={setEditVisible}
          setEditIsChange={setEditIsChange}
          setDataIsChange={setDataIsChange}
          setDataSource={setDataSource}
          nowDesignCode={nowDesignCode}
          editValues={editValues}
          areaType={areaType}
          setAreaType={setAreaType}
        />
        <Prompt when={dataIsChange} message="您确定要离开该页面吗?" />
      </div>
    </>
  );
}
