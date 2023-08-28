/* eslint-disable react/jsx-indent */
/* eslint-disable no-restricted-properties */
import { mccTemplateUpdate } from '@/api/mccManagerment';
import {
  CloseOutlined, DeleteOutlined, LoadingOutlined, PlusOutlined,
} from '@ant-design/icons';
import {
  Button, Col, Divider, Form, Input, Message, Modal, Row, Upload,
} from 'antd';
import Cookies from 'js-cookie';
// import ImgCrop from 'antd-img-crop';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

const uploadUrl = `${process.env.REACT_APP_BASE_REQUEST_URL}/mcc/template/upload/image`;
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
  const { t } = useTranslation();
  const { modalVisibl, setModalVisibl, record } = props;
  const [realCase, setRealCase] = useState('0');
  // eslint-disable-next-line no-unused-vars
  const [PublicToken, setPublicToken] = useState('');
  const [uploadHeardes, setUploadHeardes] = useState({});
  const [imageOne, setImageOne] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageTwo, setImageTwo] = useState({});
  const [loadingTwo, setLoadingTwo] = useState(false);
  const [imageThree, setImageThree] = useState({});
  const [loadingThree, setLoadingThree] = useState(false);
  const [imageFour, setImageFour] = useState({});
  const [loadingFour, setLoadingFour] = useState(false);
  const [imageFive, setImageFive] = useState({});
  const [loadingFive, setLoadingFive] = useState(false);
  const [imageSix, setImageSix] = useState({});
  const [loadingSix, setLoadingSix] = useState(false);
  const [form] = Form.useForm();
  const handleCancel = () => {
    form.resetFields();
    setImageOne({});
    setImageTwo({});
    setImageThree({});
    setImageFour({});
    setImageFive({});
    setImageSix({});
    setModalVisibl(false);
  };
  useEffect(() => {
    if (modalVisibl) {
      form.setFieldsValue(record);
      const publicToken = Cookies.get('Authorization');
      const uploadHearde = { Authorization: publicToken };
      setPublicToken(publicToken);
      setUploadHeardes(uploadHearde);
      if (record.images && record.images.length > 0) {
        record.images.map((e) => {
          switch (e.sort) {
            case 1: setImageOne(e); break;
            case 2: setImageTwo(e); break;
            case 3: setImageThree(e); break;
            case 4: setImageFour(e); break;
            case 5: setImageFive(e); break;
            case 6: setImageSix(e); break;
            default: break;
          }
        });
        setRealCase(record.realCase);
      }
      if (record.tags.length === 0) {
        record.tags.push({ tagName: '' });
      }
    }
  }, [modalVisibl]);
  // const checkChange = async (e) => {
  //   if (e.target.checked) {
  //     setRealCase('1');
  //   } else {
  //     setRealCase('0');
  //     await form.validateFields();
  //   }
  // };
  const removeItem = () => {
    const formItem = {
      ...form.getFieldsValue(),
    };
    // console.log(formItem);
    // console.log(record);
    if (formItem.tags.length === 2) {
      formItem.tags = formItem.tags.splice(0, 1);
      // console.log(record.tags);
    }
    record.tags = formItem.tags;
    form.setFieldsValue(record);
  };
  const handleOk = async () => {
    const images = [];
    if (imageOne.imageUrl) {
      images.push(imageOne);
    }
    if (imageTwo.imageUrl) {
      images.push(imageTwo);
    }
    if (imageThree.imageUrl) {
      images.push(imageThree);
    }
    if (imageFour.imageUrl) {
      images.push(imageFour);
    }
    if (imageFive.imageUrl) {
      images.push(imageFive);
    }
    if (imageSix.imageUrl) {
      images.push(imageSix);
    }
    let real = realCase;
    if (!realCase) {
      real = '0';
    }
    const params = {
      id: record.id,
      ...form.getFieldsValue(),
      images,
      language: 'zh',
      realCase: real,
    };
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
        Message.error('标签2非空时，标签1不能为空');
        return;
      }
      if (params.tags[0].tagName === '') {
        params.tags = [];
      }
    }

    mccTemplateUpdate(params).then((res) => {
      if (res.success) {
        Message.success('修改成功');
        props.getList();
        handleCancel();
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
    if (status === 'done') {
      // Get this response
      setLoading(false);
      const { response } = info.file;
      if (response && !response.success) {
        if (!response.success) {
          Message.error(response.errorMsg);
        } else {
          Message.error(`${fileName} 文件上传失败`);
        }
      }

      if (response && response.success) {
        const img = {
          imageUrl: response.data.url,
          imageWidth: response.data.width,
          imageHeight: response.data.height,
          imageDefault: '1',
          sort: 1,
        };
        setImageOne(img);
      }
    } else if (status === 'error') {
      Message.error(`${fileName} 文件上传失败`);
      setLoading(false);
    }
  };


  const onChangeTwo = (info) => {
    const { status } = info.file;
    if (status === 'uploading') {
      setLoadingTwo(true);
    }
    const fileName = info.file.name;
    if (status === 'done') {
      // Get this response
      setLoadingTwo(false);
      const { response } = info.file;
      if (response && !response.success) {
        if (!response.success) {
          Message.error(response.errorMsg);
        } else {
          Message.error(`${fileName} 文件上传失败`);
        }
      }

      if (response && response.success) {
        const img = {
          imageUrl: response.data.url,
          imageWidth: response.data.width,
          imageHeight: response.data.height,
          imageDefault: '0',
          sort: 2,
        };
        setImageTwo(img);
      }
    } else if (status === 'error') {
      Message.error(`${fileName} 文件上传失败`);
      setLoadingTwo(false);
    }
  };

  const onChangeThree = (info) => {
    const { status } = info.file;
    if (status === 'uploading') {
      setLoadingThree(true);
    }
    const fileName = info.file.name;
    if (status === 'done') {
      // Get this response
      setLoadingThree(false);
      const { response } = info.file;
      if (response && !response.success) {
        if (!response.success) {
          Message.error(response.errorMsg);
        } else {
          Message.error(`${fileName} 文件上传失败`);
        }
      }

      if (response && response.success) {
        const img = {
          imageUrl: response.data.url,
          imageWidth: response.data.width,
          imageHeight: response.data.height,
          imageDefault: '0',
          sort: 3,
        };
        setImageThree(img);
      }
    } else if (status === 'error') {
      Message.error(`${fileName} 文件上传失败`);
      setLoadingThree(false);
    }
  };

  const onChangeFour = (info) => {
    const { status } = info.file;
    if (status === 'uploading') {
      setLoadingFour(true);
    }
    const fileName = info.file.name;
    if (status === 'done') {
      // Get this response
      setLoadingFour(false);
      const { response } = info.file;
      if (response && !response.success) {
        if (!response.success) {
          Message.error(response.errorMsg);
        } else {
          Message.error(`${fileName} 文件上传失败`);
        }
      }

      if (response && response.success) {
        const img = {
          imageUrl: response.data.url,
          imageWidth: response.data.width,
          imageHeight: response.data.height,
          imageDefault: '0',
          sort: 4,
        };
        setImageFour(img);
      }
    } else if (status === 'error') {
      Message.error(`${fileName} 文件上传失败`);
      setLoadingFour(false);
    }
  };

  const onChangeFive = (info) => {
    const { status } = info.file;
    if (status === 'uploading') {
      setLoadingFive(true);
    }
    const fileName = info.file.name;
    if (status === 'done') {
      // Get this response
      setLoadingFive(false);
      const { response } = info.file;
      if (response && !response.success) {
        if (!response.success) {
          Message.error(response.errorMsg);
        } else {
          Message.error(`${fileName} 文件上传失败`);
        }
      }

      if (response && response.success) {
        const img = {
          imageUrl: response.data.url,
          imageWidth: response.data.width,
          imageHeight: response.data.height,
          imageDefault: '0',
          sort: 5,
        };
        setImageFive(img);
      }
    } else if (status === 'error') {
      Message.error(`${fileName} 文件上传失败`);
      setLoadingFive(false);
    }
  };

  const onChangeSix = (info) => {
    const { status } = info.file;
    if (status === 'uploading') {
      setLoadingSix(true);
    }
    const fileName = info.file.name;
    if (status === 'done') {
      // Get this response
      setLoadingSix(false);
      const { response } = info.file;
      if (response && !response.success) {
        if (!response.success) {
          Message.error(response.errorMsg);
        } else {
          Message.error(`${fileName} 文件上传失败`);
        }
      }

      if (response && response.success) {
        const img = {
          imageUrl: response.data.url,
          imageWidth: response.data.width,
          imageHeight: response.data.height,
          imageDefault: '0',
          sort: 6,
        };
        setImageSix(img);
      }
    } else if (status === 'error') {
      Message.error(`${fileName} 文件上传失败`);
      setLoadingSix(false);
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
  const removeImgTwo = (e) => {
    e.stopPropagation();
    setImageTwo({});
    Message.error('已删除,请重新上传');
  };
  const removeImgThree = (e) => {
    e.stopPropagation();
    setImageThree({});
    Message.error('已删除,请重新上传');
  };
  const removeImgFour = (e) => {
    e.stopPropagation();
    setImageFour({});
    Message.error('已删除,请重新上传');
  };
  const removeImgFive = (e) => {
    e.stopPropagation();
    setImageFive({});
    Message.error('已删除,请重新上传');
  };
  const removeImgSix = (e) => {
    e.stopPropagation();
    setImageSix({});
    Message.error('已删除,请重新上传');
  };

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
  const uploadButtonTwo = (
    <div>
      {loadingTwo ? <LoadingOutlined /> : <><Trans>上传图片</Trans></>}
    </div>
  );
  const uploadButtonThree = (
    <div>
      {loadingThree ? <LoadingOutlined /> : <><Trans>上传图片</Trans></>}
    </div>
  );
  const uploadButtonFour = (
    <div>
      {loadingFour ? <LoadingOutlined /> : <><Trans>上传图片</Trans></>}
    </div>
  );
  const uploadButtonFive = (
    <div>
      {loadingFive ? <LoadingOutlined /> : <><Trans>上传图片</Trans></>}
    </div>
  );
  const uploadButtonSix = (
    <div>
      {loadingSix ? <LoadingOutlined /> : <><Trans>上传图片</Trans></>}
    </div>
  );
  return (


    <div>
      <Modal
        title={`${t('编辑描述')}`}
        visible={modalVisibl}
        onCancel={handleCancel}
        destroyOnClose
        maskClosable={false}
        onFinish={onFinish}
        footer={null}
      >
        <div>
          <Form form={form} style={{ padding: '0 30px' }} preserve={false} onFinish={onFinish} {...layout}>
            <Form.List name="tags">
              {(fields, { add }) => (
                <>
                  {fields.map((field, index, arr) => (
                    index > 0 ? (
                      <div>
                        <Form.Item
                          {...field}
                          label={`标签${index + 1}`}
                          name={[field.name, 'tagName']}
                          fieldKey={[field.fieldKey, 'tagName']}
                          key={[field.key, 'tagName']}
                        >
                          <Row>
                            <Col span={22}>
                              <Input
                                placeholder="输入6个字符（包括英文，汉字，数字，空格)"
                                style={{ width: '100 %' }}
                                maxLength={6}
                                defaultValue={(Object.keys(record).length
                                  && record.tags[index]) ? record.tags[index].tagName : ''}
                              />
                            </Col>
                            <Col span={2}>
                              <Button
                                style={{
                                  marginLeft: '10px', borderRadius: '8px',
                                }}
                                value="small"
                                onClick={() => removeItem()}
                                icon={<CloseOutlined />}
                              />
                            </Col>
                          </Row>
                        </Form.Item>
                      </div>
                    ) : (
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
                            label={`标签${index + 1}`}
                            name={[field.name, 'tagName']}
                            fieldKey={[field.fieldKey, 'tagName']}
                            key={[field.key, 'tagName']}
                          >
                            <Row>
                              <Col span={22}>
                                <Input
                                  placeholder="输入6个字符（包括英文，汉字，数字，空格)"
                                  style={{ width: '100 %' }}
                                  maxLength={6}
                                  defaultValue={Object.keys(record).length ? record.tags[index].tagName : ''}
                                />
                              </Col>
                              <Col span={2}>
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
                                    console.log(formItem);
                                    console.log(fields);
                                  }}
                                  icon={<PlusOutlined />}
                                />
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
            <Form.Item name="briefIntroduction" label={`${t('简介')}`}>
              <Input placeholder={`${t('请输入简介')}`} maxLength={12} style={{ width: '314px', marginLeft: '2px' }} />
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
                {imageOne.imageUrl ? (
                  <div>
                    <img
                      src={imageOne.imageUrl}
                      alt="avatar"
                      style={{
                        width: '104px', height: '104px', position: 'relative', top: '11px',
                      }}
                    />
                    <DeleteOutlined
                      style={{
                        position: 'relative', top: '-90px', color: 'red', right: '-40px',
                      }}
                      onClick={removeImg}
                    />

                  </div>
                ) : uploadButtonOne}
              </Upload>
              <Upload
                action={uploadUrl}
                listType="picture-card"
                showUploadList={false}
                headers={uploadHeardes}
                beforeUpload={beforeUpload}
                onPreview={onPreview}
                onChange={onChangeTwo}
                style={{ display: 'inline' }}
              >
                {imageTwo.imageUrl ? (
                  <div>
                    <img
                      src={imageTwo.imageUrl}
                      alt="avatar"
                      style={{
                        width: '104px', height: '104px', position: 'relative', top: '11px',
                      }}
                    />
                    <DeleteOutlined
                      style={{
                        position: 'relative', top: '-90px', color: 'red', right: '-40px',
                      }}
                      onClick={removeImgTwo}
                    />

                  </div>
                ) : uploadButtonTwo}
              </Upload>
              <Upload
                action={uploadUrl}
                listType="picture-card"
                showUploadList={false}
                headers={uploadHeardes}
                beforeUpload={beforeUpload}
                onPreview={onPreview}
                onChange={onChangeThree}
                style={{ display: 'inline' }}
              >
                {imageThree.imageUrl ? (
                  <div>
                    <img
                      src={imageThree.imageUrl}
                      alt="avatar"
                      style={{
                        width: '104px', height: '104px', position: 'relative', top: '11px',
                      }}
                    />
                    <DeleteOutlined
                      style={{
                        position: 'relative', top: '-90px', color: 'red', right: '-40px',
                      }}
                      onClick={removeImgThree}
                    />

                  </div>
                ) : uploadButtonThree}
              </Upload>
            </div>
            <div style={{ display: 'flex' }}>
              <Upload
                action={uploadUrl}
                listType="picture-card"
                showUploadList={false}
                headers={uploadHeardes}
                beforeUpload={beforeUpload}
                onPreview={onPreview}
                onChange={onChangeFour}
                style={{ display: 'inline' }}
              >
                {imageFour.imageUrl ? (
                  <div>
                    <img
                      src={imageFour.imageUrl}
                      alt="avatar"
                      style={{
                        width: '104px', height: '104px', position: 'relative', top: '11px',
                      }}
                    />
                    <DeleteOutlined
                      style={{
                        position: 'relative', top: '-90px', color: 'red', right: '-40px',
                      }}
                      onClick={removeImgFour}
                    />

                  </div>
                ) : uploadButtonFour}
              </Upload>
              <Upload
                action={uploadUrl}
                listType="picture-card"
                showUploadList={false}
                headers={uploadHeardes}
                beforeUpload={beforeUpload}
                onPreview={onPreview}
                onChange={onChangeFive}
                style={{ display: 'inline' }}
              >
                {imageFive.imageUrl ? (
                  <div>
                    <img
                      src={imageFive.imageUrl}
                      alt="avatar"
                      style={{
                        width: '104px', height: '104px', position: 'relative', top: '11px',
                      }}
                    />
                    <DeleteOutlined
                      style={{
                        position: 'relative', top: '-90px', color: 'red', right: '-40px',
                      }}
                      onClick={removeImgFive}
                    />

                  </div>
                ) : uploadButtonFive}
              </Upload>
              <Upload
                action={uploadUrl}
                listType="picture-card"
                showUploadList={false}
                headers={uploadHeardes}
                maskClosable={false}
                beforeUpload={beforeUpload}
                onPreview={onPreview}
                onChange={onChangeSix}
                style={{ display: 'inline' }}
              >
                {imageSix.imageUrl ? (
                  <div>
                    <img
                      src={imageSix.imageUrl}
                      alt="avatar"
                      style={{
                        width: '104px', height: '104px', position: 'relative', top: '11px',
                      }}
                    />
                    <DeleteOutlined
                      style={{
                        position: 'relative', top: '-90px', color: 'red', right: '-40px',
                      }}
                      onClick={removeImgSix}
                    />

                  </div>
                ) : uploadButtonSix}
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

export default CombineEdit;
