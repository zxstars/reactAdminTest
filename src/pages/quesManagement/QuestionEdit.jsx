import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button, Col, Divider, Form, Input, Message, Modal, Row,
} from 'antd';
import React, { useEffect } from 'react';
import { questionSave, questionUpdate } from '@/api/quesManagement';
// const tailLayout = {
//   wrapperCol: { offset: 3, span: 12 },
// };
const { TextArea } = Input;
const QuestionEdit = (props) => {
  const {
    modalVisibl, setModalVisibl, modalType, record,
  } = props;
  const { answers = [] } = record || {};
  if (answers.length === 0) {
    answers.push({ answer: '' });
  }
  const [form] = Form.useForm();
  const handleCancel = () => {
    form.resetFields();
    setModalVisibl(false);
  };
  const handleOk = () => {
    const params = {
      ...form.getFieldsValue(),
    };
    params.answers = params.answers.filter((item) => item && item.answer.replace(/(^\s*)|(\s*$)/g, ''));
    params.answers = params.answers.map((item) => {
      item.answer = item.answer.split('').splice(0, 150).join('');
      return item;
    });
    if (modalType === 'add') {
      questionSave(params).then((res) => {
        if (res.success) {
          Message.success('新增成功');
          props.getList('add');
          handleCancel();
        }
      });
    } else {
      params.id = record.id;
      questionUpdate(params).then((res) => {
        if (res.success) {
          Message.success('编辑成功');
          props.getList('edit');
          handleCancel();
        }
      });
    }
  };
  const addItem = () => {
    const params = {
      ...form.getFieldsValue(),
    };
    record.answers = params.answers;
    record.answers.push({ answer: '' });
    form.setFieldsValue(record);
  };
  const removeItem = (index) => {
    // const params = {
    //   ...form.getFieldsValue(),
    // };
    // console.log('record.tags', params.answers, index);
    if (record.answers.length >= 2) {
      record.answers.splice(index, 1);
      // form.setFieldsValue(JSON.parse(JSON.stringify(record)));
    } else {
      form.setFieldsValue(record);
    }
  };
  const onFinish = () => {
    handleOk();
  };
  useEffect(() => {
    if (modalVisibl) {
      if (modalType === 'add') {
        console.log('recordadd', modalVisibl);
      } else {
        form.setFieldsValue(JSON.parse(JSON.stringify(record)));
      }
    }
  }, [modalVisibl, record, answers]);
  return (
    <div className>
      <Modal
        title={modalType === 'add' ? '新增' : '问题维护'}
        visible={modalVisibl}
        destroyOnClose
        maskClosable={false}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
          onFinish={onFinish}
          preserve={false}
          initialValues={{ answers: [{ answer: '' }] }}
        >
          <Form.Item
            name="question"
            label="问题"
            rules={[{
              required: true,
              message: '请输入问题',
            }]}
          >
            <Input style={{ width: '378px' }} maxLength={50} placeholder="问题最多为50字" />
          </Form.Item>
          <Form.Item
            name="sort"
            label="排序"
            rules={[{
              required: true,
              pattern: new RegExp(/^[1-9]\d*$/, 'g'),
              message: '请输入1-9999数字!',
            }]}
          >
            <Input style={{ width: '378px' }} maxLength="4" />
          </Form.Item>
          <Divider />
          <Form.List name="answers">
            {(fields, { remove }) => (
              <>
                {fields.map((field, index) => (
                  //  console.log(key, name, fieldKey, ...restField)
                  index > 0 ? (
                    <Form.Item
                      {...field}
                      label="回复"
                      name={[field.name, 'answer']}
                      fieldKey={[field.fieldKey, 'answer']}
                      key={[field.key, 'answer']}
                    >
                      <Row>
                        <Col span={22}>
                          <TextArea
                            placeholder="答案最多为150字"
                            style={{ width: '100 %' }}
                            maxLength={150}
                            autoSize
                            // eslint-disable-next-line max-len
                            defaultValue={(Object.keys(record).length && record.answers[index]) ? record.answers[index].answer : ''}
                          />
                        </Col>
                        <Col span={2}>
                          <Button
                            style={{
                              marginLeft: '10px', borderRadius: '8px',
                            }}
                            value="small"
                            onClick={() => {
                              removeItem(index);
                              remove(field.name);
                            }}
                            icon={<CloseOutlined />}
                          />
                        </Col>
                      </Row>
                    </Form.Item>
                  ) : (
                    <Form.Item
                      {...field}
                      label="回复"
                      rules={[{ required: true, message: '请填写至少一条回复' }]}
                      name={[field.name, 'answer']}
                      fieldKey={[field.fieldKey, 'answer']}
                      key={[field.key, 'answer']}
                    >
                      <Row>
                        <Col span={22}>
                          <TextArea
                            placeholder="答案最多为150字"
                            style={{ width: '100 %' }}
                            maxLength={150}
                            autoSize
                            defaultValue={Object.keys(record).length ? record.answers[index].answer : ''}
                          />
                        </Col>
                        <Col span={2}>
                          {/* <Tooltip style={{ marginLeft: '8px' }}> */}
                          <Button
                            style={{
                              marginLeft: '10px',
                              borderRadius: '8px',
                            }}
                            value="small"
                            onClick={() => {
                              if (fields.length > 9) {
                                //   const success = () => {
                                //     message.success('回复最多添加10条');
                                //   };
                                Message.error('回复最多添加10条');
                              } else {
                                addItem();
                              }
                            }}
                            icon={<PlusOutlined />}
                          />
                          {/* </Tooltip> */}
                        </Col>
                      </Row>
                    </Form.Item>
                  )

                ))}
              </>
            )}
          </Form.List>
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

export default QuestionEdit;
