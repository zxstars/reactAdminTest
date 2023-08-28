
import React, { useState } from 'react';
import {
  Table, Space, Tag, Input, Form, Button, Pagination, ConfigProvider,
} from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import StoreEdit from './StoreEdit';
import '@/pages/storeManagement/index.scss';


export default function Storemangement() {
  const [ModalVisibl, setModalVisibl] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [form] = Form.useForm();
  // 新增、编辑
  const handleEdit = (type) => {
    setModalVisibl(true);
    setModalType(type);
  };
  const onShowSizeChange = (current, pageSize) => {
    console.log(current, pageSize);
  };
  const columns = [
    {
      title: '门店名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a href="#!">{text}</a>,
    },
    {
      title: '门店编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'BU名称',
      dataIndex: 'BUName',
      key: 'BUName',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: '时区',
      dataIndex: 'timeArea',
      key: 'timeArea',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Tag className="tagStyle" color="green" onClick={() => handleEdit('edit')}>
            编辑
          </Tag>
          <Tag className="tagStyle" color="red">
            删除
          </Tag>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      name: '温州体验中心',
      code: '27901',
      BUName: '中国',
      createTime: '2021-7-15',
      updateTime: '2021-7-15',
      timeArea: 'GMT+8',
    },
    {
      key: '2',
      name: '温州体验中心',
      code: '27901',
      BUName: '中国',
      createTime: '2021-7-15',
      updateTime: '2021-7-15',
      timeArea: 'GMT+8',
    },
    {
      key: '3',
      name: '温州体验中心',
      code: '27901',
      BUName: '中国',
      createTime: '2021-7-15',
      updateTime: '2021-7-15',
      timeArea: 'GMT+8',
    },
  ];

  return (
    <div>
      <StoreEdit modalVisibl={ModalVisibl} setModalVisibl={setModalVisibl} modalType={modalType} />
      <div className="header">
        <Form form={form} name="horizontal_login" layout="inline">
          <Form.Item>
            <Input placeholder="请输入搜索内容" style={{ width: 300 }} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
            >
              搜索
            </Button>
          </Form.Item>
        </Form>
        <Button type="primary" onClick={() => handleEdit('add')}>新增</Button>
      </div>
      <ConfigProvider locale={zhCN}>
        <Table columns={columns} dataSource={data} bordered style={{ marginTop: '30px' }} pagination={false} />
      </ConfigProvider>
      <ConfigProvider locale={zhCN}>
        <Pagination
          style={{ marginTop: '20px', textAlign: 'right' }}
          showSizeChanger
          onShowSizeChange={onShowSizeChange}
          defaultCurrent={3}
          total={500}
        />
      </ConfigProvider>
    </div>
  );
}
