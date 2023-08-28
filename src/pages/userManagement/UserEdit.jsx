import {
  Button, Col, Form, Input, Message, Modal, Row, Select, Switch,
} from 'antd';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-irregular-whitespace
import { useTranslation, Trans } from 'react-i18next';
import {
  userSave, userUpdate, getRoleList, getCountrySelect,
} from '@/api/userManagement';

const { Option } = Select;

const UserEdit = (props) => {
  const {
    modalVisibl, setModalVisibl, modalType, record, currentPage,
  } = props;
  const [form] = Form.useForm();
  const [country, setCountry] = useState([]);
  const [role, setRole] = useState([]);
  const [defaultSwitch, setDefaultSwitch] = useState(false);
  // eslint-disable-next-line no-irregular-whitespace
  const { t } = useTranslation();
  useEffect(() => {
    getRoleList().then((res) => {
      if (res.success) {
        const list = [];
        res.list.map((item) => {
          list.push(item);
        });
        setRole(list);
      }
    });
    getCountrySelect().then((res) => {
      if (res.success) {
        const countryData = [];
        res.list.map((item) => {
          countryData.push(item);
        });
        setCountry(countryData);
      }
    });
    // 编辑时给switch组件赋值
    if (modalType === 'add') {
      setDefaultSwitch(false);
    } else {
      const { status } = record;
      const switchData = status === '1';
      setDefaultSwitch(switchData);
    }
    // 编辑时给输入框赋值
    form.setFieldsValue(record);
  }, [modalVisibl]);

  const handleCancel = () => {
    form.resetFields();
    setModalVisibl(false);
  };

  // 提交
  const handleOk = () => {
    const { status } = form.getFieldsValue();
    let newStatus = '0';
    if (status === '0' || !status) {
      newStatus = '0';
    } else if (status === undefined) {
      newStatus = '0';
    } else if (status) {
      newStatus = '1';
    }
    const params = {
      ...form.getFieldsValue(),
      status: newStatus,
    };
    if (modalType === 'add') {
      userSave(params).then((res) => {
        if (res.success) {
          Message.success(`${t('创建成功')}`);
          props.getList(1);
          setModalVisibl(false);
        }
      });
    } else {
      params.id = record.id;
      userUpdate(params).then((res) => {
        if (res.success) {
          Message.success(`${t('修改成功')}`);
          props.getList(currentPage);
          setModalVisibl(false);
        }
      });
    }
  };

  const onFinish = () => {
    handleOk();
  };

  const onChange = (checked) => {
    console.log(checked);
  };
  return (

    <div>
      <Modal
        title={modalType === 'add' ? `${t('新增用户')}` : `${t('编辑')}`}
        visible={modalVisibl}
        onCancel={handleCancel}
        maskClosable={false}
        destroyOnClose
        footer={null}
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          form={form}
          style={{ padding: '0 10px' }}
          onFinish={onFinish}
          preserve={false}
        >
          <Form.Item
            name="username"
            label={`${t('用户名')}`}
            rules={[
              {
                message: `${t('禁止输入空格')}`,
                pattern: /^[^\s]*$/,
              },
              {
                message: `${t('用户名只能是字母+数字+_')}`,
                pattern: /^[0-9a-zA-Z_]{1,}$/,
              },
              { required: true, message: `${t('请输入用户名')}` },
            ]}
          >
            <Input disabled={modalType !== 'add'} maxLength="20" placeholder={`${t('请输入用户名')}`} />
          </Form.Item>
          <Form.Item name="roleId" label={`${t('角色')}`} rules={[{ required: true, message: `${t('请选择角色')}` }]}>
            <Select disabled={modalType !== 'add'} placeholder={`${t('请选择角色')}`}>
              {
                role.map((item) => <Option key={item.id} value={item.id}>{item.roleName}</Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item name="countryId" label={`${t('BU名称')}`} rules={[{ required: true, message: `${t('请选择BU名称')}` }]}>
            <Select placeholder={`${t('请选择BU名称')}`}>
              {
                country.map((item) => <Option key={item.id} value={item.id}>{item.countryName}</Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item name="status" label={`${t('启用')}`}>
            <Switch defaultChecked={defaultSwitch} onChange={onChange} />
          </Form.Item>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button key="back" onClick={handleCancel} style={{ marginRight: '5px' }}>
                <Trans>取消</Trans>
              </Button>
              <Button key="submit" type="primary" htmlType="submit">
                <Trans>完成</Trans>
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default UserEdit;

UserEdit.defaultProps = {
  modalVisibl: false,
  setModalVisibl: () => { },
  modalType: 'add',
  record: {},
  getList: () => { },
  currentPage: 1,
};

UserEdit.propTypes = {
  modalVisibl: PropTypes.bool,
  setModalVisibl: PropTypes.func,
  modalType: PropTypes.string,
  record: PropTypes.object,
  getList: PropTypes.func,
  currentPage: PropTypes.number,
};
