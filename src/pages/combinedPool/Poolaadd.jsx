import {
  Button, Col, Form, Image, Input, Modal, Row, Space,
} from 'antd';
import React, { useEffect, useRef } from 'react';
import '../commodity/index';


const Poolaadd = (props) => {
  const codeVal = useRef();
  const {
    AddVisibl, setAddVisibl, record,
  } = props;
  const [form] = Form.useForm();
  useEffect(() => {
    if (AddVisibl) {
      form.setFieldsValue(record);
    }
  }, [AddVisibl]);

  const handleOk = async () => {
    // const params = {
    //   ...form.getFieldsValue(),
    //   language: 'zh',
    //   // designCode: record.designCode,
    // };
  };
  const handleCancel = () => {
    setAddVisibl(false);
  };
  const onFinish = () => {
    handleOk();
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
        title="新增组合"
        visible={AddVisibl}
        maskClosable={false}
        onCancel={handleCancel}
        destroyOnClose
        footer={null}
      >
        <div>
          <Form form={form} style={{ padding: '0 30px' }} onFinish={onFinish} preserve={false} {...layout}>
            <Row>
              <Input ref={codeVal} style={{ width: '50%' }} />
              <Button
                type="primary"
                htmlType="Submit"
                style={{ padding: '0 30px', marginLeft: '20px' }}
              >
                查询
              </Button>
            </Row>
            <Row>
              <div>
                <Space size={12}>
                  <Image
                    style={{ width: '200px', marginTop: '8px' }}
                    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?"
                  />
                </Space>
              </div>
              <div>
                <div style={{ marginTop: '5px', marginLeft: '20px' }}>组合编号：520XX</div>
                <div style={{ marginTop: '5px', marginLeft: '20px' }}>组合尺寸：1.2m*200m</div>
                <div style={{ marginTop: '5px', marginLeft: '20px' }}>组合价格：¥18888.00</div>
              </div>
            </Row>
            <Row>
              <Col span={24} style={{ textAlign: 'right', marginTop: '8px' }}>
                <Button key="back" onClick={handleCancel} style={{ marginRight: '5px' }}>
                  取消
                </Button>
                <Button key="submit" type="primary" htmlType="submit">
                  新增
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Poolaadd;
