import {
  Button, Divider, Form, Input, Modal, Row, Col, Message,
} from 'antd';
import React, { useEffect } from 'react';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation, Trans } from 'react-i18next';
import './index';
import {
  productUpdate,
} from '../../api/productManagement';


const EditTags = (props) => {
  const {
    modalVisibl, setModalVisibl, record,
  } = props;
  const [form] = Form.useForm();
  // const [tagList] = useState(['耐用材质环保', '耐用材质环保']);
  // const [tags, setTags] = useState([]);
  const { t } = useTranslation();
  useEffect(() => {
    if (modalVisibl) {
      // const ts = record.tags;
      if (record.tags.length === 0) {
        record.tags.push({ tagName: '' });
      }
      // 编辑时给输入框赋值
      form.setFieldsValue(record);
    }
  }, [modalVisibl]);
  // const add = () => {
  //   const ts = tags;
  //   if (ts.length === 2) {
  //     Message.warn('标签数量不能大于2');
  //     return;
  //   }
  //   ts.push({ tagName: '' });
  //   setTags(ts);
  // };
  // const cut = () => {
  //   const ts = tags;
  //   const t = ts.slice(0, ts.length - 1);
  //   setTags(t);
  // };
  const handleOk = async () => {
    const params = {
      ...form.getFieldsValue(),
      language: 'zh',
      id: record.id,
    };
    if (params.tags.length > 2) {
      Message.error(`${t('最多添加两个标签')}`);
      return;
    }
    if (params.tags.length === 1 && params.tags[0].tagName === '') {
      params.tags = [];
    } else if (params.tags.length === 2) {
      if (!params.tags[1] || params.tags[1].tagName.replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '') === '') {
        params.tags.splice(1, 1);
        // eslint-disable-next-line max-len
      } else if (params.tags[0].tagName.replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '') === '' && params.tags[1].tagName.replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '') === '') {
        params.tags = [];
        // eslint-disable-next-line max-len
      } else if (params.tags[0].tagName.replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '') === '' && params.tags[1].tagName.replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '') !== '') {
        Message.error(`${t('标签1不能为空')}`);
        return;
      }
      if (params.tags[0].tagName === '') {
        params.tags = [];
      }
    }
    await productUpdate(params).then((res) => {
      if (res.success) {
        Message.success(`${t('修改成功')}`);
        // eslint-disable-next-line react/destructuring-assignment
        props.getList();
        setModalVisibl(false);
      } else {
        Message.error(res.errorMsg);
      }
    });
  };
  const removeItem = () => {
    // if (record.tags.length === 2) {
    //   record.tags.splice(1, 1);
    //   form.setFieldsValue(record);
    // } else {
    //   form.setFieldsValue(record);
    // }

    const formItem = {
      ...form.getFieldsValue(),
    };
    if (formItem.tags.length === 2) {
      formItem.tags = formItem.tags.splice(0, 1);
    }
    record.tags = formItem.tags;
    form.setFieldsValue(record);
  };
  const handleCancel = () => {
    setModalVisibl(false);
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
        title={`${t('编辑商品')}`}
        visible={modalVisibl}
        onCancel={handleCancel}
        maskClosable={false}
        destroyOnClose
        footer={null}
      >
        <div>
          <Form form={form} style={{ padding: '0 30px' }} onFinish={onFinish} preserve={false} {...layout}>
            <Form.List name="tags">
              {(fields, { add }) => (
                <>
                  {fields.map((field, index, arr) => (
                    index > 0 ? (
                      <Form.Item
                        {...field}
                        label={`${t('标签')}${index + 1}`}
                        name={[field.name, 'tagName']}
                        fieldKey={[field.fieldKey, 'tagName']}
                        key={[field.key, 'tagName']}
                      >
                        <Row>
                          <Col span={22}>
                            <Input
                              style={{ width: '100 %' }}
                              maxLength={6}
                              // eslint-disable-next-line max-len
                              defaultValue={(Object.keys(record).length && record.tags[index]) ? record.tags[index].tagName : ''}
                            />
                          </Col>
                          <Col span={2}>
                            <Button
                              style={{
                                marginLeft: '10px', borderRadius: '8px',
                              }}
                              value="small"
                              onClick={() => removeItem(field.name)}
                              icon={<CloseOutlined />}
                            />
                          </Col>
                        </Row>
                      </Form.Item>
                    ) : (
                        // eslint-disable-next-line react/jsx-indent
                        <div>
                          <span style={{
                            color: 'red',
                            display: index === 0 && arr.length > 1 ? 'flex' : 'none',
                            position: 'absolute',
                            marginLeft: '10px',
                            marginTop: '6px',
                          }}
                          >
                            *
                          </span>
                          <Form.Item
                            {...field}
                            label={`${t('标签')}${index + 1}`}
                            name={[field.name, 'tagName']}
                            fieldKey={[field.fieldKey, 'tagName']}
                            key={[field.key, 'tagName']}
                          >
                            <Row>
                              <Col span={22}>
                                <Input
                                  style={{ width: '100 %' }}
                                  maxLength={6}
                                  defaultValue={Object.keys(record).length ? record.tags[index].tagName : ''}
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
                                    const formItem = {
                                      ...form.getFieldsValue(),
                                    };
                                    if (fields.length > 1) {
                                      Message.error(`${t('最多可添加2个标签')}`);
                                    } else if (formItem.tags[0].tagName === '') {
                                      Message.error(`${t('标签1有数据后标签2才可以添加')}`);
                                    } else {
                                      add();
                                    }
                                  }}
                                  icon={<PlusOutlined />}
                                />
                                {/* </Tooltip> */}
                              </Col>
                            </Row>
                          </Form.Item>
                        </div>
                        // eslint-disable-next-line indent
                      )
                  ))}
                </>
              )}
            </Form.List>

            <Divider />
            <Form.Item name="simpleIntroduction" label={`${t('简介')}`}>
              <Input placeholder={`${t('请输入简介')}`} maxLength={12} style={{ width: '300px', marginLeft: '18px' }} />
            </Form.Item>
            <Form.Item name="recommend" label={`${t('介绍')}`}>
              <Input placeholder={`${t('请输入介绍')}`} maxLength={30} style={{ width: '300px', marginLeft: '18px' }} />
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
        </div>
      </Modal>
    </div>
  );
};

export default EditTags;
