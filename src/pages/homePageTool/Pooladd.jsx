/* eslint-disable no-restricted-properties */
import {
  DeleteOutlined, LoadingOutlined,
} from '@ant-design/icons';
import {
  Button, Col, Divider, Form, Input, Message, Modal, Row, Select, Upload,
} from 'antd';
import Cookies from 'js-cookie';
// import ImgCrop from 'antd-img-crop';
import React, { useEffect, useState } from 'react';
import propTypes from 'prop-types';
import { Trans, useTranslation } from 'react-i18next';

import style from '@/pages/homePageTool/index.module.scss';
import { updateHomeByCode } from '@/api/homePage';

// const uploadUrl = `${process.env.REACT_APP_BASE_REQUEST_URL}/display/home/upload/image`;
const uploadUrl = `${process.env.REACT_APP_BASE_REQUEST_URL}/display/home/upload/image`;
const { Option } = Select;
const fileType = ['png', 'jpeg', 'jpg'];
const fileSize = 26214400;
const onPreview = async (file) => {
  let src = file.url;
  if (!src) {
    src = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file.originFileObj);
      reader.onload = () => resolve(reader.result);
    });
  }
  const image = new Image();
  image.src = src;
  const imgWindow = window.open(src);
  imgWindow.document.write(image.outerHTML);
};


const CombineEdit = (props) => {
  const {
    // eslint-disable-next-line react/prop-types
    modalVisibl, setModalVisibl, record, getList,
  } = props;

  // eslint-disable-next-line no-unused-vars
  const [PublicToken, setPublicToken] = useState('');
  const [uploadHeardes, setUploadHeardes] = useState({});
  const [imageOne, setImageOne] = useState({});
  const [loading, setLoading] = useState(false);
  const handleCancel = () => {
    // eslint-disable-next-line no-use-before-define
    form.resetFields();
    setImageOne({});
    setModalVisibl(false);
  };
  const [form] = Form.useForm();
  useEffect(() => {
    if (modalVisibl) {
      form.setFieldsValue(record);
      const publicToken = Cookies.get('Authorization');
      const uploadHearde = { Authorization: publicToken };
      setPublicToken(publicToken);
      setUploadHeardes(uploadHearde);
      setImageOne(record.displayHomeImage);
    }
  }, [modalVisibl]);


  const handleOk = async () => {
    const params = {
      id: record.id,
      sort: form.getFieldsValue().sort ? Number(form.getFieldsValue().sort) : undefined,
      title: form.getFieldsValue().title,
      area: Number(form.getFieldsValue().area),
      displayImageUrl: imageOne?.imageUrl,
      language: 'zh',
    };
    if (params.sort !== undefined) {
      if (params.sort < 0 || params.sort > 9999 || !/^[1-9]+[0-9]*$/.test(params.sort)) {
        Message.error('排序为1~9999的整数');
        return;
      }
    }

    if (!/^[\u4E00-\u9FA5A-Za-z*?\s]+$/.test(params.briefIntroduction)) {
      Message.error('简介只能中文，英文以及空格');
      return;
    }
    if (!params.displayImageUrl) {
      Message.error('图片不可以为空');
      return;
    }

    updateHomeByCode(params).then((res) => {
      if (res.success) {
        Message.success('修改成功');
        getList();
        handleCancel();
        setModalVisibl(false);
      }
    });
  };
  const onFinish = () => {
    handleOk();
  };


  const formatFileSize = (size, digits = 2) => {
    if (!size) {
      return '';
    }

    const num = 1024.00; // byte

    if (size < num) {
      return `${size}B`;
    }
    if (size < Math.pow(num, 2)) {
      return `${(size / num).toFixed(digits)}K`; // kb
    }
    if (size < Math.pow(num, 3)) {
      return `${(size / Math.pow(num, 2)).toFixed(digits)}M`; // M
    }
    if (size < Math.pow(num, 4)) {
      return `${(size / Math.pow(num, 3)).toFixed(digits)}G`; // G
    }
    return `${(size / Math.pow(num, 4)).toFixed(digits)}T`; // T
  };
  const formarSize = formatFileSize(fileSize);

  const onChange = (info) => {
    const { status } = info.file;
    if (status === 'uploading') {
      setLoading(true);
    }
    const fileName = info.file.name;
    // const iUrl = info.file.imageUrl;
    // console.log('24545', fileName, iUrl);
    if (status === 'done') {
      // Get this response
      setLoading(false);
      const { response } = info.file;
      if (response && !response.success) {
        if (!response.success) {
          Message.error(response.errorMsg);
        } else {
          Message.error(`${fileName} 文件上传失败,大小请勿超过25M`);
        }
      }

      if (response && response.success) {
        const img = {
          imageUrl: response.data.url,
          imageWidth: response.data.width,
          imageHeight: response.data.height,
          sort: 0,
        };
        setImageOne(img);
      }
    } else if (status === 'error') {
      Message.error(`${fileName} 文件上传失败,大小请勿超过25M`);
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isRightType = fileType.includes(file.type.split('/')[1]);
    if (!isRightType) {
      Message.error(`请上传${fileType}格式的图片`);
    }
    const isLtSize = file.size < fileSize;
    if (!isLtSize) {
      Message.error(`请上传小于${formarSize}的图片`);
    }
    return isRightType && isLtSize;
  };
  const removeImg = (e) => {
    e.stopPropagation();
    setImageOne({});
    Message.error('已删除,请重新上传');
  };
  const { t } = useTranslation();

  const layout = {
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 20,
    },
  };
  const uploadButtonOne = (
    <div>
      {loading ? <LoadingOutlined /> : <><Trans>请上传主图</Trans></>}
    </div>
  );

  return (


    <div>
      <Modal
        title={`${t('编辑')}`}
        visible={modalVisibl}
        onCancel={handleCancel}
        maskClosable={false}
        destroyOnClose
        footer={null}
      >
        <div>
          <Form form={form} style={{ padding: '0 30px' }} preserve={false} onFinish={onFinish} {...layout}>
            <Form.Item
              name="title"
              label={`${t('标题')}`}
              rules={[
                {
                  required: true,
                  message: '标题不可为空',
                },
              ]}
            >
              <Input placeholder="12个字符" maxLength={12} style={{ width: '314px', marginLeft: '2px' }} />
            </Form.Item>
            <Form.Item name="area" label={`${t('区域')}`}>
              <Select
                placeholder={`${t('请选择')}`}
                className={style.category}
                style={{ width: '314px', marginRight: '20px' }}
              >
                <>
                  <Option value={1} key="1">{`${t('书柜')}`}</Option>
                  <Option value={2} key="2">{`${t('展示柜')}`}</Option>
                  <Option value={3} key="3">{`${t('鞋柜/玄关柜')}`}</Option>
                  <Option value={4} key="4">{`${t('餐边储物柜')}`}</Option>
                </>
              </Select>
            </Form.Item>
            <Form.Item
              name="sort"
              label="排序"
              // rules={[{
              //   pattern: new RegExp(/^[1-9]\d*$/, 'g'),
              //   message: '请输入1-9999数字!',
              // }]}
            >
              <Input style={{ width: '314px' }} placeholder="请输入1-9999数字" maxLength="4" min={0} max={9999} />
            </Form.Item>

            <Divider />
            <div style={{ display: 'flex' }}>
              <Upload
                action={uploadUrl}
                listType="picture-card"
                showUploadList={false}
                headers={uploadHeardes}
                beforeUpload={beforeUpload}
                onPreview={onPreview}
                onChange={onChange}
                style={{ display: 'inline' }}
              >
                {imageOne?.imageUrl ? (
                  <div>
                    <img
                      src={imageOne?.imageUrl}
                      alt="avatar"
                      style={{
                        width: '104px', height: '104px', position: 'relative', top: '11px',
                      }}
                    />
                    <DeleteOutlined
                      style={{
                        position: 'relative', top: '-90px', color: 'red', right: '-40px',
                        // position: 'relative', top: '-40px', color: 'red', right: '-20px',
                      }}
                      onClick={removeImg}
                    />

                  </div>
                ) : uploadButtonOne}
              </Upload>
            </div>
            <Divider />
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
CombineEdit.propTypes = {
  modalVisibl: propTypes.bool.isRequired,
  setModalVisibl: propTypes.func.isRequired,
  record: propTypes.any.isRequired,
  getList: propTypes.func.isRequired,
  tabsType: propTypes.string.isRequired,
};

export default CombineEdit;
