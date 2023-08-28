import {
  Button, Col, Form, Image, Input, Message, message, Modal, Row, Space,
} from 'antd';
import propTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import '@/pages/commodity/index';
import { createDoorByCode } from '@/api/hotPanel';
import { getmccBycode } from '@/api/homePage';


const Poolaadd = (props) => {
  const [images, setImages] = useState('');
  const [designCode, setDesignCode] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [isShow, setIsShow] = useState(false);

  const {
    AddVisibl, setAddVisibl, record, getList,
  } = props;
  const [form] = Form.useForm();
  const { t } = useTranslation();
  useEffect(() => {
    if (AddVisibl) {
      form.setFieldsValue(record);
    }
  }, [AddVisibl]);
  const handleCancel = () => {
    setIsShow(false);
    setAddVisibl(false);
  };
  const handnleAdd = async () => {
    const params = {
      designCode,
    };
    await createDoorByCode(params).then((res) => {
      if (res.success) {
        Message.success(`${t('新增成功')}`);
        handleCancel();
        getList();
      }
    });
  };


  const handleSearch = () => {
    // 可能由于升级antd版本问题，导致取值有问题
    if (!form.getFieldsValue().designCode) {
      message.error(`${t('请输入设计代码')}`);
      return;
    }

    getmccBycode(form.getFieldsValue().designCode).then((res) => {
      if (res.success) {
        setImages(res.images[1]?.imageUrl);
        setDesignCode(res.designCode);
        // const sizeList = res.size?.split(',');
        // res.size = `${sizeList[0]}宽X${sizeList[1]}高X${sizeList[2]}深 mm`;
        res.size = `${res.realWidth?.leftWidth ? `${`${res.realWidth?.leftWidth}0`}/${`${res.realWidth?.width}0`}`
          : `${res.realWidth?.width}0`}宽、${res.height}高、${res.depth}深 mm`;
        setSize(res.size);
        setPrice(res.price.price);
        setIsShow(true);
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
        title={`${t('新增组合')}`}
        visible={AddVisibl}
        width={550}
        onCancel={handleCancel}
        maskClosable={false}
        destroyOnClose
        footer={null}
      >
        <div>
          <Form form={form} style={{ padding: '0 30px' }} preserve={false} {...layout}>
            <Row>
              <Form.Item
                getValueFromEvent={
                  (event) => event.target.value
                    .replace(/[\u4E00-\u9FA5?？!！￥@#$%^&*()_+\-=）…（—｛｝{}【】[\]、`~.,，。《》<>|/]/g, '')
                }
                name="designCode"
              >
                <Input
                  maxLength={6}
                  placeholder={`${t('请输入设计代码')}`}
                  style={{ width: '220px' }}
                />
              </Form.Item>
              <Button
                type="primary"
                onClick={() => handleSearch()}
                style={{ padding: '0 30px', marginLeft: '20px' }}
              >
                <Trans>查询</Trans>
              </Button>
            </Row>
            {
              isShow ? (
                <Row>
                  <div>
                    <Space size={12}>
                      <Image
                        style={{ width: '180px', marginTop: '8px' }}
                        src={images}
                      />
                    </Space>
                  </div>
                  <div>
                    <div style={{ marginTop: '5px', marginLeft: '20px' }}>
                      <Trans>代码</Trans>
                      ：
                      {designCode}
                    </div>
                    <div style={{ marginTop: '5px', marginLeft: '20px' }}>
                      <Trans>尺寸</Trans>
                      ：
                      {size}

                    </div>
                    <div style={{ marginTop: '5px', marginLeft: '20px' }}>
                      <Trans>价格</Trans>
                      ：
                      {(price) ? `¥${price}` : ''}
                    </div>
                  </div>
                </Row>
              ) : null
            }
            {
              isShow ? (
                <Row>
                  <Col span={24} style={{ textAlign: 'right', marginTop: '8px' }}>
                    <Button key="back" onClick={handleCancel} style={{ marginRight: '5px' }}>
                      <Trans>取消</Trans>
                    </Button>
                    <Button key="submit" type="primary" onClick={() => handnleAdd()}>
                      <Trans>新增</Trans>

                    </Button>
                  </Col>
                </Row>
              ) : null
            }
          </Form>
        </div>
      </Modal>
    </div>
  );
};
Poolaadd.propTypes = {
  AddVisibl: propTypes.bool.isRequired,
  setAddVisibl: propTypes.func.isRequired,
  record: propTypes.any.isRequired,
  getList: propTypes.func.isRequired,

};

export default Poolaadd;
