import React, { useEffect } from 'react';
import {
  Modal, Button, Form, Input, Message, Row, Col,
} from 'antd';
import PropTypes from 'prop-types';
import JSEncrypt from 'jsencrypt';
import { rsaPublicKey } from '@/config';
import { putPasswordUpdate } from '../api/login';

const UpdatePassword = (props) => {
  const { modalVisibl } = props;
  const [form] = Form.useForm();
  useEffect(() => {
  }, [modalVisibl]);

  // 验证密码是否符合规范
  const checkPassWord = (rule, value) => {
    const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$%#&])[A-Za-z\d$@$%#&]{7,}/;
    const objRegExp = new RegExp(reg, 'g');
    if (value && !objRegExp.test(value)) {
      return Promise.reject(new Error('密码不符合规范，请重新输入'));
    }
    return Promise.resolve();
  };

  // 验证新密码是否一致
  const diffPassWord = (rule, value) => {
    const { newPassword } = form.getFieldsValue();
    if (value && newPassword && newPassword !== value) {
      return Promise.reject(new Error('两次密码输入不一致，请重新输入'));
    }
    return Promise.resolve();
  };

  // 提交
  const handleOk = async () => {
    const data = form.getFieldsValue();
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(rsaPublicKey);
    data.newPassword = encrypt.encrypt(data.newPassword);
    data.oldPassword = encrypt.encrypt(data.oldPassword);
    data.confirmPassword = encrypt.encrypt(data.confirmPassword);
    const res = await putPasswordUpdate({ ...data });
    if (res.success) {
      Message.success('密码修改成功,请重新登录');
      // eslint-disable-next-line react/destructuring-assignment
      props.handleCancel();
      // eslint-disable-next-line react/destructuring-assignment
      props.loginOut();
    }
  };

  const onFinish = () => {
    handleOk();
  };

  const handleCancel = () => {
    // eslint-disable-next-line react/destructuring-assignment
    props.handleCancel();
  };

  return (
    <div>
      <Modal
        title="修改密码"
        visible={modalVisibl}
        onCancel={handleCancel}
        maskClosable={false}
        destroyOnClose
        footer={null}
      >
        <Form
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
          form={form}
          style={{ padding: '0 10px' }}
          onFinish={onFinish}
          preserve={false}
        >
          <Form.Item name="oldPassword" rules={[{ required: true, message: '旧密码不能为空' }]}>
            <Input type="password" placeholder="请输入旧密码" />
          </Form.Item>
          <p>注:密码至少7位，包含一个数字，大小写字母及一个特殊字符（@,$,&,%,#）</p>
          <Form.Item
            name="newPassword"
            rules={[{ required: true, message: '新密码不能为空' }, { required: false, validator: checkPassWord }]}
          >
            <Input type="password" placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: '新密码不能为空' }, { required: true, validator: diffPassWord }]}
          >
            <Input type="password" placeholder="请再次输入新密码" />
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

export default UpdatePassword;

UpdatePassword.defaultProps = {
  modalVisibl: false,
  handleCancel: () => {},
};

UpdatePassword.propTypes = {
  modalVisibl: PropTypes.bool,
  handleCancel: PropTypes.func,
};
