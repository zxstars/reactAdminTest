import {
  Button,
  ConfigProvider,
  Form,
  Input,
  Message,
  Modal,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
} from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
// import MccEditTags from './MccEditTags';
import style from './index.module.scss';
import Poolaadd from './Poolaadd';
import {
  deleteDoor, downDoor, getDoorList, upDoor,
} from '@/api/hotPanel';


const { Option } = Select;
const { confirm } = Modal;

export default function HotPanel() {
  const { t } = useTranslation();
  const [AddVisibl, setAddVisibl] = useState(false);

  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [spin, setSpin] = useState(false);
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
    const data = {
      language: 'zh', bu: 'cn', pageSize, pageNum: page, ...form.getFieldsValue(),
    };
    if (!data.color) {
      delete data.color;
    }
    getDoorList(data).then((res) => {
      if (res.list) {
        res.list.map((item) => {
          item.key = item.id;
          item.height += 'mm';
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
          // setMove(true);
          // setMovee(true);
        }
      });
    }
    getList(1, 20);
  }, []);

  const handleDelete = (id) => {
    setSpin(true);
    deleteDoor(id).then((res) => {
      if (res.success) {
        Message.success('移除成功');
        getList();
      }
    }).finally(() => {
      setSpin(false);
    });
  };

  // eslint-disable-next-line no-unused-vars
  const showConfirm = (id) => {
    confirm({
      title: '确定要删除吗?',
      onOk() {
        handleDelete(id);
      },
      onCancel() { },
    });
  };
  // 点击表格中的交互按按钮 调用的方法
  // eslint-disable-next-line no-shadow
  const handleActions = (record, checked) => {
    if (checked) {
      confirm({
        title: '是否上架案例？',
        onOk() {
          upDoor(record.id).then((res) => {
            if (res.success) {
              getList();
            }
          });
        },
      });
    } else {
      confirm({
        title: '确定下架案例？',
        onOk() {
          downDoor(record.id).then((res) => {
            if (res.success) {
              getList();
            }
          });
        },
      });
    }
  };


  const poolaadd = (pool) => {
    setRecord(pool);
    setAddVisibl(true);
  };

  const onFinish = () => {
    setCurrentPage(1);
    getList(1);
  };

  const columns = [
    {
      title: `${t('门板图片')}`,
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (el, recordItem) => (
        <>
          {' '}
          {
            <img
              src={recordItem?.imageUrl}
              alt=""
              className={style.image}
            />
          }
        </>
      ),
    },
    {
      title: `${t('设计代码')}`,
      dataIndex: 'designCode',
      key: 'designCode',
    },

    {
      title: `${t('框体高度')}`,
      dataIndex: 'height',
      key: 'height',
    },
    {
      title: `${t('框体颜色')}`,
      dataIndex: 'color',
      key: 'color',
      render: (status) => {
        switch (status) {
          case 'WHITE':
            return '白色';
          case 'DARK_BROWN':
            return '深褐色';
          case 'BEIGE':
            return '仿橡木';
          case 'BROWN':
            return '褐色';
          default:
            return null;
        }
      },
    },

    {
      title: `${t('操作')}`,
      key: 'action',
      // eslint-disable-next-line no-unused-vars
      render: (el, recordItem) => (
        <Space size="middle">
          <p style={{ cursor: 'pointer' }}>
            <Tag
              type="primary"
              className="tagStyle"
              color="red"
              onClick={() => showConfirm(recordItem.id)}
            >
              <Trans>删除</Trans>
            </Tag>
          </p>

        </Space>
      ),
    },
    {
      title: `${t('上架/下架')}`,
      key: 'status',
      dataIndex: 'status',
      render: (el, item) => (
        <Switch
          checked={item.status === 1}
          onChange={(checked) => handleActions(item, checked)}
        />
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
                <Form.Item name="height" label={`${t('框体高度')}`}>
                  <Select
                    placeholder={`${t('请选择')}`}
                    className={style.category}
                    style={{ width: '162px' }}
                    allowClear
                    defaultValue=""
                  >
                    <>
                      <Option value="1060" key="106">{`${t('1060mm')}`}</Option>
                      <Option value="2020" key="202">{`${t('2020mm')}`}</Option>
                      <Option value="2370" key="237">{`${t('2370mm')}`}</Option>
                      <Option value="2720" key="272">{`${t('2720mm')}`}</Option>
                      <Option value="" key="5">{`${t('所有')}`}</Option>

                    </>
                  </Select>
                </Form.Item>
              </div>
            </div>
            <div className={style.type}>
              <div>
                <Form.Item name="color" label={`${t('框体颜色')}`}>
                  <Select
                    placeholder={`${t('请选择')}`}
                    className={style.category}
                    style={{ width: '162px' }}
                    allowClear
                    defaultValue=""
                  >
                    <>
                      <Option value="WHITE" key="WHITE">{`${t('白色')}`}</Option>
                      <Option value="DARK_BROWN" key="DARK_BROWN">{`${t('深褐色')}`}</Option>
                      <Option value="BEIGE" key="BEIGE">{`${t('仿橡木')}`}</Option>
                      <Option value="BROWN" key="BROWN">{`${t('褐色')}`}</Option>
                      <Option value="" key="5">{`${t('所有')}`}</Option>

                    </>
                  </Select>
                </Form.Item>
              </div>
            </div>
            <div className={style.shop}>
              <div>
                <Form.Item
                  getValueFromEvent={
                    (event) => event.target.value
                      .replace(/[\u4E00-\u9FA5?？!！￥@#$%^&*()_+\-=）…（—｛｝{}【】[\]、`~.,，。《》<>|/]/g, '')
}
                  name="designCode"
                  label={`${t('设计代码')}`}
                  className={style}
                >
                  <Input
                    allowClear
                    maxLength={6}
                    placeholder={`${t('请输入')}`}
                  />
                </Form.Item>
              </div>
            </div>
            <div>
              <Form.Item label=" " colon={false}>
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
                <Button type="primary" onClick={() => poolaadd(record)}>
                  <Trans>新增</Trans>
                </Button>
              </Form.Item>
            </div>
          </Row>
        </Form>
      </div>
      <div>

        <Poolaadd
          AddVisibl={AddVisibl}
          setAddVisibl={setAddVisibl}
          getList={getList}
          record={record}
        />
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
