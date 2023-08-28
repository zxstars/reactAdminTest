import React, { useEffect, useState } from 'react';
import {
  Modal, Button, Form, Input, Select, Row, Col, Message,
} from 'antd';
import { getCountrySelect, postStoreSave, putStoreUpdate } from '@/api/storeManagement';

const { Option } = Select;

const StoreEdit = (props) => {
  const {
    modalVisibl, setModalVisibl, modalType, record,
  } = props;
  const [form] = Form.useForm();
  const [country, setCountry] = useState([]);
  // 合并请求后的处理
  const arrData = (resList) => {
    const list = [];
    resList.map((item) => {
      list.push(item);
    });
    return list;
  };
  // 获取门店选择列表
  const countrySelect = async () => {
    const res = await getCountrySelect();
    if (res.success) {
      setCountry(arrData(res.list));
    }
  };

  useEffect(() => {
    countrySelect();
    // 编辑时给输入框赋值
    form.setFieldsValue(record);
  }, [modalVisibl]);

  const handleCancel = () => {
    setModalVisibl(false);
  };

  // 提交
  const handleOk = () => {
    const params = {
      ...form.getFieldsValue(),
    };
    if (modalType === 'add') {
      postStoreSave(params).then((res) => {
        if (res.success) {
          props.getList(1);
          setModalVisibl(false);
        }
      });
    } else {
      params.id = record.id;
      putStoreUpdate(params).then((res) => {
        if (res.success) {
          Message.success('修改成功');
          props.getList();
          setModalVisibl(false);
        }
      });
    }
  };

  const onFinish = () => {
    handleOk();
  };

  return (
    <div>
      <Modal
        title={modalType === 'add' ? '新增门店' : '编辑'}
        visible={modalVisibl}
        maskClosable={false}
        onCancel={handleCancel}
        footer={[]}
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          form={form}
          style={{ padding: '0 10px' }}
          onFinish={onFinish}
        >
          <Form.Item name="storeName" label="门店名称" rules={[{ required: true, message: '请输入门店名称' }]}>
            <Input placeholder="请输入门店名称" />
          </Form.Item>
          <Form.Item name="storeCode" label="门店编码" rules={[{ required: true, message: '请输入门店编码' }]}>
            <Input placeholder="请输入门店编码" />
          </Form.Item>
          <Form.Item name="countryId" label="BU名称" rules={[{ required: true, message: '请选择BU名称' }]}>
            <Select placeholder="请选择BU名称">
              {
                country.map((item) => <Option key={item.id} value={item.id}>{item.countryName}</Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item name="timeZone" label="时区" rules={[{ required: true, message: '请选择时区' }]}>
            <Select placeholder="请选择时区">
              <Option value="GMT +8">GMT +8</Option>
            </Select>
          </Form.Item>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button key="back" onClick={handleCancel} style={{ marginRight: '5px' }}>
                取消
              </Button>
              <Button key="submit" type="primary" htmlType="submit">
                完成
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default StoreEdit;

