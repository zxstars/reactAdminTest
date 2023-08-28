import { deleteMcc, getMccList } from '@/api/mccManagerment';
import {
  Button, ConfigProvider, Form, Input, Message, Modal, Pagination, Row, Select, Spin, Table, Tag,
} from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MccEditTags from './MccEditTags';
import style from './index.module.scss';

const { Option } = Select;
const { confirm } = Modal;

export default function Mccnanagement() {
  const { t } = useTranslation();
  const [ModalVisibl, setModalVisibl] = useState(false);
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [spin, setSpin] = useState(false);
  const [move, setMove] = useState(false);
  const [movee, setMovee] = useState(false);
  const [record, setRecord] = useState(null);
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
    getMccList({
      language: 'zh', bu: 'cn', pageSize, pageNum: page, ...form.getFieldsValue(),
    }).then((res) => {
      if (res.list) {
        res.list.map((item) => {
          item.key = item.id;
          if (item.images && item.images.length > 0) {
            item.img = item.images[0];
            // item.status = 1;
          }
          // const downLength = (item.downLength1 | 0) + (item.downLength2 | 0) + (item.downLength3 | 0);
          // const topLength = item.topLength1 | 0 + item.topLength2 | 0;
          const { width } = item;
          const { height } = item;
          const { depth } = item;

          // item.size = `${downLength / 100}m底柜 * ${topLength / 100}顶柜`;
          item.size = `${(width ? `宽${width}` : '')
          + (depth ? ` x 深${depth}` : '') + (height ? ` x 高${height}` : '')}厘米`;
          switch (item.shape) {
            case '1': item.shape = '一字型'; break;
            case '2': item.shape = '二字型'; break;
            case '3': item.shape = '半包型'; break;
            case '4': item.shape = '全包型'; break;
            default: item.shape = '特殊型';
          }
          const detail = {
            ownerRequest: item.ownerRequest,
            ownerEvaluate: item.ownerEvaluate,
            designerSay: item.designerSay,
          };
          item.detail = detail;
          item.case = item.realCase ? '是' : '否';
          item.category = item.caseType === '1' ? '新厨房装修' : '旧厨房改造';
          item.mccColors = item.doorColors.length
            ? item.doorColors.reduce((pre, next) => pre + (next ? `/${next}` : '')) : '';
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
    //  setModalVisibl(false);
    const roles = JSON.parse(localStorage.getItem('admin-tool-base-info')).roles || [];
    if (roles.length > 0) {
      roles.map((item) => {
        if (item === 'COUNTRY_ADMIN') {
          setMove(true);
          setMovee(true);
        }
      });
    }
    getList(1, 20);
  }, []);

  const handleDelete = (id) => {
    setSpin(true);
    deleteMcc(id).then((res) => {
      if (res.success) {
        Message.success('移除成功');
        getList();
      }
    }).finally(() => {
      setSpin(false);
    });
  };

  const showConfirm = (id) => {
    confirm({
      title: '确定要移除吗?',
      onOk() {
        handleDelete(id);
      },
      onCancel() { },
    });
  };

  const editTags = (recordItem) => {
    setRecord(recordItem);
    setModalVisibl(true);
  };

  const onFinish = () => {
    setCurrentPage(1);
    getList(1, 20);
  };

  const columns = [
    {
      title: `${t('组合图片')}`,
      dataIndex: 'img',
      key: 'img',
      render: (el, recordItem) => (
        <>
          {' '}
          {recordItem.img ? (
            <img
              src={recordItem.img.imageUrl}
              alt=""
              className={style.image}
            />
          ) : <></>}
        </>
      ),
    },
    {
      title: `${t('组合编码')}`,
      dataIndex: 'designCode',
      key: 'designCode',
    },
    {
      title: `${t('尺寸')}`,
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: `${t('组合形状')}`,
      dataIndex: 'shape',
      key: 'shape',
    },

    {
      title: `${t('门板颜色')}`,
      dataIndex: 'mccColors',
      key: 'mccColors',
    },

    {
      title: `${t('标签')}`,
      key: 'tags',
      dataIndex: 'tags',
      render: (tags) => (
        <>
          {
            tags
              // eslint-disable-next-line react/destructuring-assignment
              ? tags.map((tag) => {
                const color = tag.type === '1' ? 'green' : 'red';
                return (
                  <Tag color={color} key={tag.id}>
                    {tag.tagName}
                  </Tag>
                );
              }) : (<></>)
          }
        </>
      ),
    },
    {
      title: `${t('价格')}`,
      key: 'mccPrice',
      dataIndex: 'mccPrice',
      render: ({ price, discountPrice, ikeaFamilyPrice }) => (
        <div style={{ fontSize: '12px' }}>
          {
          price ? (
            <p>
              {`原价:￥${price}`}
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
        </div>
      ),
    },
    {
      title: `${t('创建时间')}`,
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: `${t('排序')}`,
      key: 'sort',
      dataIndex: 'sort',
    },
    {
      title: `${t('简介')}`,
      key: 'briefIntroduction',
      dataIndex: 'briefIntroduction',
    },
    {
      title: `${t('操作')}`,
      key: 'action',
      render: (el, recordItem) => (
        <>

          {
            // eslint-disable-next-line max-len
            move ? (<p><Tag type="primary" color="green" className="tagStyle" onClick={() => editTags(recordItem)}><Trans>排序</Trans></Tag></p>) : (<></>)
          }
          {
            // eslint-disable-next-line max-len
            movee ? (<p><Tag type="primary" className="tagStyle" color="red" onClick={() => showConfirm(recordItem.id)}><Trans>移除MCC</Trans></Tag></p>) : (<></>)
          }

        </>
      ),
    },
  ];

  const data = mccList;

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
                <Form.Item name="shape" label={`${t('形状类型')}`}>
                  <Select
                    placeholder={`${t('请选择')}`}
                    className={style.category}
                    style={{ width: '162px' }}
                    allowClear
                  >
                    <>
                      <Option value="1" key="1">
                        {`${t('一字型')}`}
                      </Option>
                      <Option value="2" key="2">
                        {`${t('二字型')}`}
                      </Option>
                      <Option value="3" key="3">{`${t('半包型')}`}</Option>
                      <Option value="4" key="3">
                        {`${t('全包型')}`}
                      </Option>
                      <Option value="5" key="3">{`${t('特殊型')}`}</Option>
                    </>
                  </Select>
                </Form.Item>
              </div>
            </div>
            <div className={style.shop}>
              <div>
                <Form.Item name="designCode" label={`${t('组合编码')}`} className={style.goodsaaaa}>
                  <Input allowClear maxLength={6} placeholder={`${t('请输入')}`} />
                </Form.Item>
              </div>
            </div>
            <div>
              <Form.Item label=" " colon={false}>
                <Button onClick={() => {
                  form.resetFields();
                  setCurrentPage(1);
                  getList();
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
      <div>
        <MccEditTags
          modalVisibl={ModalVisibl}
          setModalVisibl={setModalVisibl}
          getList={getList}
          record={record}
        />
        {/* <MccUpload modalVisibl={isModalVisibl} setisModalVisibl={setisModalVisibl} /> */}
        <Spin tip="Loading..." spinning={spin}>
          <ConfigProvider locale={zhCN}>
            <Table
              columns={columns}
              rowClassName={(recordItem) => (recordItem.status === '1' ? '' : style.dark)}
              dataSource={data}
              pagination={false}
              bordered
              style={{ marginTop: '20px' }}
            />
          </ConfigProvider>
        </Spin>
        <ConfigProvider locale={zhCN}>
          <Pagination
            style={{ marginTop: '20px', textAlign: 'right' }}
            pageSize={size}
            onChange={onChange}
            showSizeChanger
            defaultPageSize={20}
            defaultCurrent={1}
            current={currentPage}
            showTotal={(count) => `共 ${count} 条记录`}
            total={total}
          />
        </ConfigProvider>
      </div>
    </>
  );
}
