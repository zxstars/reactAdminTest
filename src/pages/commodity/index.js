/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import EditTags from '@/pages/commodity/EditTags';
import {
  Button, ConfigProvider, Form, Input, Message, Modal, Pagination, Row, Select, Space, Spin, Table, Tag,
} from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { useTranslation, Trans } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import {
  productDown, productList, productSelectList, productUp,
} from '../../api/productManagement';
import style from './index.module.scss';


const { confirm } = Modal;
const { Option } = Select;
export default function Commodity() {
  const [proList, setProList] = useState([]);
  const [showUpDown, setShowUpDown] = useState(false);
  const [selectList, setSelectList] = useState([]);
  const [form] = Form.useForm();
  const [total, setTotal] = useState(20);
  const [spin, setSpin] = useState(false);
  const [record, setRecord] = useState({});
  const [size, setSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInfo, setSearchInfo] = useState({});
  const { t } = useTranslation();
  const getList = async (page, pageSize, values) => {
    if (!page) {
      page = currentPage;
    }
    setSpin(true);
    if (!pageSize) {
      pageSize = size;
    }
    const params = values ? {
      pageSize, pageNum: page, bu: 'cn', language: 'zh', ...values,
    } : {
        pageSize, pageNum: page, bu: 'cn', language: 'zh', ...searchInfo,
      };
    productList(params).then((res) => {
      if (res.list) {
        res.list.map((item) => {
          item.key = item.id;
          if (item.images && item.images.length > 0) {
            item.img = item.images[0];
          }
          item.productPrices = {};
          if (item.countryPrices && item.countryPrices.length > 0) {
            item.countryPrices.map((p) => {
              switch (p.retailPriceType) {
                case '1': item.productPrices.price = p.price; break;
                case '2': item.productPrices.discountPrice = p.price; break;
                case '3': item.productPrices.ikeaFamilyPrice = p.price; break;
                default: item.productPrices.linePrice = p.price;
              }
            });
          }
        });
        setProList(res.list);
        setTotal(res.total);
      } else {
        setProList([]);
        setTotal(0);
      }
    }).finally(() => {
      setSpin(false);
    });
  };

  const getSelectList = async () => {
    const params = {
      language: 'zh',
    };
    await productSelectList(params).then((res) => {
      setSelectList(res.list);
    });
  };
  useEffect(async () => {
    //  setModalVisibl(false);
    const roles = JSON.parse(localStorage.getItem('admin-tool-base-info')).roles || [];
    if (roles.length > 0) {
      roles.map((item) => {
        if (item === 'COUNTRY_ADMIN') {
          setShowUpDown(true);
        }
      });
    }
    getList(1, size);
    await getSelectList();
  }, []);


  const [ModalVisibl, setModalVisibl] = useState(false);
  const editTags = (recordItem) => {
    const e = JSON.parse(JSON.stringify(recordItem));
    e.tags = e.tags.filter((value) => value.type === '1');
    setRecord(e);
    setModalVisibl(true);
  };
  const handleOpration = (id, status) => {
    if (status === '1') {
      productDown(id).then((res) => {
        if (res.success) {
          Message.success(`${t('下架成功')}`);
          getList();
        }
      });
    } else {
      productUp(id).then((res) => {
        if (res.success) {
          Message.success(`${t('上架成功')}`);
          getList();
        }
      });
    }
  };
  // 分页
  const onChange = (page, pageSize) => {
    setCurrentPage(page);
    if (pageSize !== size) {
      page = 1;
      setCurrentPage(1);
    }
    setSize(pageSize);

    getList(page, pageSize);
  };
  const onFinish = () => {
    const values = { ...form.getFieldsValue() };
    setSearchInfo({ ...values });
    setCurrentPage(1);
    getList(1, size, values);
  };

  const showConfirm = (id, status) => {
    const title = status === '1' ? `${t('确认要下架吗')}？` : `${t('确认要上架吗')}？`;
    confirm({
      title,
      okText: `${t('确认')}`,
      cancelText: `${t('取消')}`,
      onOk() {
        handleOpration(id, status);
      },
      onCancel() { },
    });
  };
  const columns = [
    {
      title: `${t('商品图片')}`,
      dataIndex: 'img',
      key: 'img',
      render: (el, recordItem) => (
        <>
          {' '}
          {recordItem.img ? (<img src={recordItem.img.imageUrl} alt="" width="100px" />) : <></>}
        </>
      ),
    },
    {
      title: `${t('全球编号')}`,
      dataIndex: 'itemNoGlobal',
      key: 'itemNoGlobal',
    },
    {
      title: `${t('商品名称')}`,
      dataIndex: 'globalName',
      key: 'globalName',
    },
    {
      title: `${t('商品类别')}`,
      key: 'typeName',
      dataIndex: 'typeName',
    },
    {
      title: `${t('商品货号')}`,
      key: 'itemNoLocal',
      dataIndex: 'itemNoLocal',
    },
    {
      title: `${t('商品价格')}`,
      key: 'productPrices',
      dataIndex: 'productPrices',
      render: ({ price, discountPrice, ikeaFamilyPrice }) => (
        <div style={{ fontSize: '12px' }}>
          {
            price ? (
              <p>
                {`￥${price}`}
              </p>
            ) : (<></>)
          }
          {
            discountPrice ? (
              <p>
                {`${t('优惠价')}:￥${discountPrice}`}
              </p>
            ) : (<></>)
          }
          {
            ikeaFamilyPrice ? (
              <p>
                {`${t('会员价')}:￥${ikeaFamilyPrice}`}
              </p>
            ) : (<></>)
          }
          {
            ikeaFamilyPrice ? (
              <p>
                {`${t('划线价')}:￥${ikeaFamilyPrice}`}
              </p>
            ) : (<></>)
          }
        </div>
      ),
    },

    {
      title: `${t('标签')}`,
      key: 'tags',
      dataIndex: 'tags',
      render: (tags) => (
        <>
          {
            // eslint-disable-next-line react/destructuring-assignment
            tags.map((tag) => {
              const color = tag.type === '1' ? 'green' : 'red';
              return (
                <Tag color={color} key={tag.id}>
                  {tag.tagName}
                </Tag>
              );
            })
          }
        </>
      ),
    },
    {
      title: `${t('简介')}`,
      key: 'simpleIntroduction',
      dataIndex: 'simpleIntroduction',
    },
    {
      title: `${t('介绍')}`,
      key: 'recommend',
      dataIndex: 'recommend',
    },
    {
      title: `${t('操作')}`,
      key: 'action',
      render: (itemRecord) => (
        <>
          {
            showUpDown ? (
              <Space size="middle">
                <Tag
                  type="primary"
                  className="tagStyle"
                  color="green"
                  onClick={() => editTags(itemRecord)}
                >
                  <Trans>编辑</Trans>

                </Tag>
                {
                  // eslint-disable-next-line react/destructuring-assignment
                  itemRecord.status === '1' ? (
                    <Tag
                      type="primary"
                      className="tagStyle"
                      color="red"
                      onClick={() => showConfirm(itemRecord.id, itemRecord.status)}
                    >
                      <Trans>下架</Trans>
                    </Tag>
                  ) : (
                      <Tag
                        type="primary"
                        className="tagStyle"
                        color="red"
                        onClick={() => showConfirm(itemRecord.id, itemRecord.status)}
                      >
                        <Trans>上架</Trans>
                      </Tag>
                    )
                }

              </Space>
            ) : (<></>)

          }

        </>
      ),
    },
  ];
  const list = selectList;

  const data = proList;
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
            <div>
              <Form.Item name="globalName" label={`${t('商品名称')}:`}>
                <Input allowClear placeholder={`${t('请输入')}`} />
              </Form.Item>
            </div>
            <div className={style.type}>
              <div>
                <Form.Item name="typeCode" label={`${t('商品类别')}`}>
                  <Select
                    placeholder={`${t('请选择')}`}
                    className={style.category}
                    style={{ width: '162px' }}
                    allowClear
                  >
                    <>
                      {
                       list ? list.map((i) => (
                          <Option key={i.typeCode} value={i.typeCode}>{i.typeName}</Option>
                        )) : <></>
                      }
                    </>
                  </Select>
                </Form.Item>
              </div>
            </div>
            <div className={style.shop}>
              <div>
                <Form.Item name="itemNoLocal" label={`${t('商品货号')}:`} className={style.goodsaaaa}>
                  <Input allowClear placeholder={`${t('请输入')}`} maxLength={8} />
                </Form.Item>
              </div>
            </div>
            <div>
              <Form.Item label=" " colon={false}>
                <Button onClick={() => {
                  form.resetFields();
                  setSearchInfo({});
                  setCurrentPage(1);
                  getList(1, size, {});
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
      </div>

      <EditTags
        modalVisibl={ModalVisibl}
        setModalVisibl={setModalVisibl}
        getList={getList}
        setRecord={setRecord}
        record={record}
        currentPage={currentPage}
      />
      <Spin tip="Loading..." spinning={spin}>
      <ConfigProvider locale={zhCN}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
          rowClassName={(recordItem) => (recordItem.status === '1' ? '' : style.dark)}
          style={{ marginTop: '30px' }}
        />
      </ConfigProvider>
      </Spin>
      <ConfigProvider locale={zhCN}>
        <Pagination
          style={{ marginTop: '20px', textAlign: 'right' }}
          showSizeChanger="false"
          onChange={onChange}
          showTotal={(count) => `${t('共')} ${count} ${t('条记录')}`}
          pageSize={size}
          defaultCurrent={1}
          current={currentPage}
          total={total}
        />
      </ConfigProvider>
    </>
  );
}
