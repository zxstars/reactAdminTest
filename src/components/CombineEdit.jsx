import React, { useState } from 'react';
import {
  Modal, Button, Form, Input, Tag, Tooltip,
} from 'antd';
import Styles from '../pages/commodity/index.css';

const CombineEdit = (props) => {
  const { modalVisibl, setModalVisibl } = props;
  const [tagList] = useState(['耐用材质环保', '2耐用材质环保']);
  const handleOk = () => {
    setModalVisibl(false);
  };
  const handleCancel = () => {
    setModalVisibl(false);
  };
  const [form] = Form.useForm();

  return (
    <div>
      <Modal
        title="标签修改"
        visible={modalVisibl}
        onCancel={handleCancel}
        maskClosable={false}
        footer={[
          <Button key="submit" type="primary" onClick={handleOk}>
            完成
          </Button>,
        ]}
      >
        <Form form={form} style={{ padding: '0 30px' }}>
          <Form.Item>
            <Form.Item
              noStyle
            >
              <Input style={{ width: 325 }} />
            </Form.Item>
            <Tooltip style={{ marginLeft: '10px' }}>
              <Button type="primary" style={{ marginLeft: '20px' }}>新增</Button>
            </Tooltip>

          </Form.Item>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            {
            tagList.map((item) => (
              <Tag
                color="success"
                className={Styles.tags}
                closable
                key={item}
              >
                {item}
              </Tag>
            ))
          }
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CombineEdit;
