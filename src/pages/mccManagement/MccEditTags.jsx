import {
  mccUpdate,
} from '@/api/mccManagerment';
import {
  Button, Form, Input, Message, Modal,
} from 'antd';
import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

const CombineEdit = (props) => {
  const { modalVisibl, setModalVisibl, record } = props;

  const handleCancel = () => {
    setModalVisibl(false);
  };
  const [form] = Form.useForm();
  useEffect(() => {
    if (modalVisibl) {
      form.setFieldsValue(record);
    }
  }, [modalVisibl]);
  const { t } = useTranslation();
  const handleOk = async () => {
    const params = {
      id: record.id,
      ...form.getFieldsValue(),
    };
    params.sort = Number(params.sort);
    if (!params.sort || params.sort < 0 || params.sort > 9999 || !/^[1-9]+[0-9]*$/.test(params.sort)) {
      Message.error(`${t('排序为')}1~9999${t('的整数')}`);
      return;
    }
    mccUpdate(params).then((res) => {
      if (res.success) {
        Message.success(`${t('修改成功')}`);
        props.getList();
        setModalVisibl(false);
      }
    });
  };
  const layout = {
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 20,
    },
  };
  return (
    <div>
      <Modal
        title={`${t('排序设置')}`}
        visible={modalVisibl}
        maskClosable={false}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            <Trans>取消</Trans>
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            <Trans>保存</Trans>
          </Button>,
        ]}
      >
        <Form form={form} style={{ padding: '0 30px' }} {...layout}>
          <Form.Item name="sort" label={`${t('排序')}`}>
            <Input placeholder={`0~9999${t('整数')}`} style={{ width: 325 }} min={0} max={9999} maxLength={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CombineEdit;
