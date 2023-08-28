/* eslint-disable react/destructuring-assignment */
import {
  Button,
  ConfigProvider,
  Form,
  // eslint-disable-next-line no-unused-vars
  Input,
  Message,
  Modal,
  Pagination,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Switch,
} from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';

import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Poolaadd from './Poolaadd';
import Pooladd from './Pooladd';
import style from './index.module.scss';
import {
  deleteHome, downHome, getHomeList, upHome,
} from '@/api/homePage';

const { Option } = Select;
const { confirm } = Modal;

export default function HomePageTool() {
  const { t } = useTranslation();
  const [ModalVisibl, setModalVisibl] = useState(false);
  const [AddVisibl, setAddVisibl] = useState(false);
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [tabsType] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [spin, setSpin] = useState(false);
  const [move, setMove] = useState(false);
  const [, setMovee] = useState(false);
  const [moveee, setMoveee] = useState(false);
  const [record, setRecord] = useState([]);
  const [size, setSize] = useState(20);
  const [mccList, setMccList] = useState([]);

  const getList = (page, pageSize) => {
    setSpin(true);
    if (!page) {
      page = currentPage;
    }
    if (!pageSize) {
      pageSize = size;
    }
    // eslint-disable-next-line no-undef
    getHomeList({
      language: 'zh',
      bu: 'cn',
      pageSize,
      pageNum: page,
      ...form.getFieldsValue(),
    }).then((res) => {
      if (res.list) {
        res.list.forEach((item) => {
          item.key = item.id;
          if (item.displayHomeImage && item.displayHomeImage.length > 0) {
            item.displayHomeImage = item.displayHomeImage[0];
          }
          // const downLength = (item.downLength1 || 0) + (item.downLength2 || 0) + (item.downLength3 || 0);
          // const topLength = (item.topLength1 || 0) + (item.topLength2 || 0) + (item.topLength3 || 0);
          // const topLengthSize = topLength ? ` x ${topLength / 100}m顶柜` : '';
          // item.size = `${downLength / 100}m底柜 ${topLengthSize}`;
          item.size = `${item.realWidth?.leftWidth ? `${item.realWidth?.leftWidth}/${item.realWidth?.width}`
            : item.realWidth?.width}宽、${item.height}高、${item.depth}深`;

          switch (item.shapeType) {
            case 1: item.shapeType = '一字柜'; break;
            case 2: item.shapeType = '转角柜'; break;
            default: item.shapeType = '';
          }
          // const detail = {
          //   ownerRequest: item.ownerRequest,
          //   ownerEvaluate: item.ownerEvaluate,
          //   designerSay: item.designerSay,
          // };
          // item.detail = detail;
        });
        setMccList(res.list);
        setTotal(res.total);
      } else {
        setMccList([]);
        setTotal(0);
      }
    }).finally(() => {
      setSpin(false);
    });
  };
  const onChange = (page, pageSize) => {
    setCurrentPage(page);
    setSize(pageSize);

    getList(page, pageSize);
  };
  useEffect(async () => {
    const roles = JSON.parse(localStorage.getItem('admin-tool-base-info')).roles || [];
    if (roles.length > 0) {
      roles.forEach((item) => {
        if (item === 'COUNTRY_ADMIN') {
          setMove(true);
          setMovee(false);
          setMoveee(true);
        }
        if (item === 'STORE_ADMIN') {
          setMovee(true);
          setMoveee(false);
        }
      });
    }
    // getList(1, 20);
  }, []);

  const handleDelete = (id) => {
    setSpin(true);
    // eslint-disable-next-line no-undef
    deleteHome(id).then((res) => {
      if (res.success) {
        Message.success('删除成功');
        getList();
      }
    }).finally(() => {
      setSpin(false);
    });
  };


  useEffect(() => {
    setCurrentPage(1);
    setSize(20);
    getList(1, 20);
  }, [tabsType]);


  const showConfirmTest = (id) => {
    confirm({
      title: '确定要删除吗？',
      onOk() {
        handleDelete(id);
      },
      onCancel() { },
    });
  };

  const pooladd = (itemRecord) => {
    const e = JSON.parse(JSON.stringify(itemRecord));
    // e.tags = e.tags.filter((value) => value.type === '1');
    setRecord(e);
    setModalVisibl(true);
  };
  const poolaadd = (pool) => {
    setRecord(pool);
    setAddVisibl(true);
  };

  const onFinish = () => {
    setCurrentPage(1);
    getList(1);
  };

  const handleActions = (recordItem, checked) => {
    if (checked) {
      if (recordItem.title && recordItem.displayHomeImage) {
        confirm({
          title: '是否上架案例？',
          onOk() {
            upHome(recordItem.id).then((res) => {
              if (res.success) {
                getList();
                // recordItem.status = 1;
              }
            });
          },
        });
      } else {
        Modal.error({
          title: '错误提示',
          content: '缺少图片或标题',
          okText: '确定',
        });
      }
    } else {
      confirm({
        title: '确定下架案例？',
        onOk() {
          downHome(recordItem.id).then((res) => {
            if (res.success) {
              getList();
            }
          });
        },
      });
    }
  };

  const popularColumns = [
    {
      title: `${t('组合图片')}`,
      dataIndex: 'displayHomeImage',
      key: 'displayHomeImage',
      render: (el, itemRecord) => (
        <>
          {' '}
          {itemRecord.displayHomeImage ? (
            <>
              <img
                src={itemRecord.displayHomeImage.imageUrl}
                alt=""
                className={style.image}
              />
              <div style={{ height: '20px', width: '100%', backgroundColor: `${itemRecord.colorCode}` }} />
            </>
          ) : <></>}
        </>
      ),
    },
    {
      title: `${t('设计代码')}`,
      dataIndex: 'designCode',
      key: 'designCode',
    },
    {
      title: `${t('组合形状')}`,
      dataIndex: 'shapeType',
      key: 'shapeType',
    },
    {
      title: `${t('区域')}`,
      dataIndex: 'area',
      key: 'area',
      render: (status) => {
        switch (status) {
          case 1:
            return '书柜';
          case 2:
            return '展示柜';
          case 3:
            return '鞋柜/玄关柜';
          case 4:
            return '餐边储物柜';
          case 5:
            return '展示柜';
          default:
            return null;
        }
      },
    },
    {
      title: `${t('尺寸')}`,
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: `${t('排序')}`,
      dataIndex: 'sort',
      key: 'sort',
    },
    {
      title: `${t('框体颜色')}`,
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: `${t('价格')}`,
      key: 'price',
      dataIndex: 'price',
      // eslint-disable-next-line react/prop-types,no-unused-vars
      render: ({ price, discountPrice, ikeaFamilyPrice }) => (
        <div style={{ fontSize: '12px' }}>
          {
            price ? (
              <p>
                {`￥${price}`}
              </p>
            ) : (<></>)
          }
          {/* { */}
          {/*  discountPrice ? ( */}
          {/*    <p> */}
          {/*      {`${t('优惠价')}:￥${discountPrice}`} */}
          {/*    </p> */}
          {/*  ) : (<></>) */}
          {/* } */}
          {/* { */}
          {/*  ikeaFamilyPrice ? ( */}
          {/*    <p> */}
          {/*      {`${t('会员价')}:￥${ikeaFamilyPrice}`} */}
          {/*    </p> */}
          {/*  ) : (<></>) */}
          {/* } */}
        </div>
      ),
    },
    {
      title: `${t('标题')}`,
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: `${t('操作')}`,
      key: 'action',
      render: (itemRecord) => (
        <>
          {
            move ? (
              <p style={{ cursor: 'pointer' }}>
                <Tag
                  type="primary"
                  color="green"
                  onClick={() => pooladd(itemRecord)}
                >
                  <Trans>编辑</Trans>
                </Tag>

              </p>
            ) : (<></>)
          }
          {
            move ? (
              <p style={{ cursor: 'pointer' }}>
                <Tag
                  type="primary"
                  color="red"
                  onClick={() => showConfirmTest(itemRecord.id)}
                >
                  <Trans>删除</Trans>
                </Tag>
              </p>
            ) : (<></>)
          }
        </>
      ),
    },
    {
      title: '上架/下架',
      dataIndex: 'status',
      align: 'status',
      // eslint-disable-next-line no-shadow,no-unused-vars
      render: (el, item) => (
        <>
          <Switch
            onChange={(checked) => {
              handleActions(item, checked);
            }}
            checked={item.status === 1}
          />
        </>
      ),
    },

  ];
  // eslint-disable-next-line no-unused-vars
  const onInput = (e) => {
    form.setFieldsValue({
      ...form.getFieldsValue(),
      designCode: e.target.value.replace(/[^0-9a-zA-z\u4e00-\u9fa5]/g, ''),
    });
  };

  const data = mccList;
  const getLanguage = () => (t('请选择') === '请选择' ? zhCN : enUS);
  return (
    <>
      <div className={style.heard}>
        <Form
          name="complex-form"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
          form={form}
        >
          <Row>
            <div className={style.type}>
              <div>
                <Form.Item name="shapeType" label={`${t('组合形状')}`}>
                  <Select
                    placeholder={`${t('请选择')}`}
                    className={style.category}
                    style={{ width: '162px' }}
                    allowClear
                    getPopupContainer={(triggerNode) => triggerNode.parentElement}
                    defaultValue=""
                  >
                    <>
                      <Option value="1" key="1">{`${t('一字柜')}`}</Option>
                      <Option value="2" key="2">{`${t('转角柜')}`}</Option>
                      <Option value="" key="3">{`${t('所有')}`}</Option>
                    </>
                  </Select>
                </Form.Item>
              </div>
            </div>
            <div className={style.shop}>
              <div>
                <Form.Item
                  name="designCode"
                  label={`${t('设计代码')}`}
                  getValueFromEvent={
                    (event) => event.target.value
                      .replace(/[\u4E00-\u9FA5?？!！￥@#$%^&*()_+\-=）…（—｛｝{}【】[\]、`~.,，。《》<>|/]/g, '')
                  }
                >
                  <Input
                    allowClear
                    placeholder={`${t('请输入')}`}
                    maxLength={6}
                  />
                </Form.Item>
              </div>
            </div>
            <div className={style.type}>
              <div>
                <Form.Item name="area" label={`${t('区域')}`}>
                  <Select
                    placeholder={`${t('请选择')}`}
                    className={style.category}
                    style={{ width: '162px', marginRight: '20px' }}
                    defaultValue=""
                    allowClear
                  >
                    <>
                      <Option value="1" key="1">{`${t('书柜')}`}</Option>
                      <Option value="2" key="2">{`${t('展示柜')}`}</Option>
                      <Option value="3" key="3">{`${t('鞋柜/玄关柜')}`}</Option>
                      <Option value="4" key="4">{`${t('餐边储物柜')}`}</Option>
                      <Option value="" key="5">{`${t('所有')}`}</Option>
                    </>
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div>
              <Form.Item label=" " colon={false}>

                {' '}
                <Button onClick={() => {
                  form.resetFields();
                  setCurrentPage(1);
                  getList(1);
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
            <div>
              <Form.Item label=" " colon={false}>
                {
                  moveee ? (

                    <Button type="primary" onClick={() => poolaadd(record)}>
                      <Trans>新增</Trans>
                    </Button>
                  ) : (<></>)
                }
              </Form.Item>
            </div>
          </Row>
        </Form>
      </div>
      <div>
        <Pooladd
          modalVisibl={ModalVisibl}
          setModalVisibl={setModalVisibl}
          tabsType={tabsType}
          getList={getList}
          record={record}
        />
        <Poolaadd
          AddVisibl={AddVisibl}
          setAddVisibl={setAddVisibl}
          getList={getList}
          record={record}
        />
        <Spin tip="Loading..." spinning={spin}>
          <ConfigProvider locale={getLanguage()}>
            <Table
              columns={popularColumns}
              dataSource={data}
              pagination={false}
              bordered
              rowClassName={(itemRecord) => (itemRecord.status === '1' ? '' : style.dark)}
            />
          </ConfigProvider>
        </Spin>
        <ConfigProvider locale={getLanguage()}>
          <Pagination
            style={{ marginTop: '20px', textAlign: 'right' }}
            pageSize={size}
            onChange={onChange}
            showSizeChanger
            defaultPageSize={20}
            defaultCurrent={1}
            current={currentPage}
            showTotal={(count) => `${t('共')} ${count} ${t('条记录')}`}
            total={total}
          />
        </ConfigProvider>
      </div>
    </>
  );
}

