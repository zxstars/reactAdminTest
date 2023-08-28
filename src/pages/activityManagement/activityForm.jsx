/* eslint-disable max-len */
/*
 * @Description: Description
 * @Author: Xiaohua Zhu
 * @Date: 2022-02-11 09:09:38
 * @LastEditors: Xiaohua Zhu
 * @LastEditTime: 2022-02-18 14:53:49
 */
import {
  Modal, Form, Input, Upload, Space,
  // message,
  DatePicker,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import propTypes from 'prop-types';
// import 'moment/locale/zh-cn';
import Cookies from 'js-cookie';

const { TextArea } = Input;
const ActivityCreateForm = ({
  form,
  visible,
  title,
  onCancel,
  onOk,
  pcImgList,
  storeImgList,
  wideImgList,
  handlePcImgList,
  handleStoreImgList,
  handleWideImgList,
}) => {
  const { RangePicker } = DatePicker;
  const uploadUrl = `${process.env.REACT_APP_BASE_REQUEST_URL}/activity/upload/image`;
  const publicToken = Cookies.get('Authorization');
  const uploadHearder = { Authorization: publicToken };
  const ImgSize = {
    pc: { width: 238, height: 486, name: '小屏' },
    store: { width: 430, height: 740, name: '大屏' },
    wide: { width: 1324, height: 864, name: '详情' },
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }

    return e && e.fileList;
  };
  const beforeUpload = async (originFileObj) => {
    const reader = new FileReader();
    reader.readAsDataURL(originFileObj);
    await new Promise((resolve) => {
      reader.onload = (fileData) => {
        const img = new Image();
        img.src = fileData.target.result;
        img.onload = () => {
          resolve();
          // if (img.width !== size.width || img.height !== size.height) {
          //   message.warn(`不符合${size.name}图片要求(宽:${size.width} 高:${size.height})`);
          // }
        };
      };
    });
  };

  return (
    <Modal
      visible={visible}
      title={title}
      onCancel={onCancel}
      onOk={onOk}
    >
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        name="form_in_modal"
      >
        <Form.Item
          name="activityName"
          label="活动名称"
          rules={[
            {
              required: true,
              message: '请输入活动名称',
            },
            {
              max: 15,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="introduction"
          label="活动简介"
          rules={[{ max: 250 }]}
        >
          <TextArea type="textarea" />
        </Form.Item>
        <Form.Item label="活动图片">
          <Space align="start">
            <div>
              <Form.Item
                name="pcImg"
                getValueFromEvent={normFile}
                style={{ marginBottom: 0 }}
                rules={[{
                  required: true,
                  message: '请上传图片',
                }]}
              >
                <Upload
                  name="file"
                  action={uploadUrl}
                  headers={uploadHearder}
                  fileList={pcImgList}
                  onChange={handlePcImgList}
                  beforeUpload={(e) => beforeUpload(e, ImgSize.pc)}
                  listType="picture-card"
                >
                  {pcImgList.length >= 1 ? null : <PlusOutlined />}
                </Upload>
              </Form.Item>
              <span style={{ color: 'red', fontFamily: 'SimSun, sans-serif' }}>*</span>
              <span>
                <span> 小屏</span>
                <br />
                <span>(476*972)</span>
              </span>
            </div>

            <div>
              <Form.Item
                name="storeImg"
                getValueFromEvent={normFile}
                style={{ marginBottom: 0 }}
                rules={[{
                  required: true,
                  message: '请上传图片',
                }]}
              >
                <Upload
                  name="file"
                  action={uploadUrl}
                  headers={uploadHearder}
                  fileList={storeImgList}
                  onChange={handleStoreImgList}
                  beforeUpload={(e) => beforeUpload(e, ImgSize.store)}
                  listType="picture-card"
                >
                  {storeImgList.length >= 1 ? null : <PlusOutlined />}
                </Upload>
              </Form.Item>
              <span style={{ color: 'red', fontFamily: 'SimSun, sans-serif' }}>*</span>
              <span> 大屏</span>
              <br />
              <span>(860*1480)</span>
            </div>
            <div>
              <Form.Item
                name="wideImg"
                getValueFromEvent={normFile}
                style={{ marginBottom: 0 }}
              >
                <Upload
                  name="file"
                  action={uploadUrl}
                  headers={uploadHearder}
                  fileList={wideImgList}
                  onChange={handleWideImgList}
                  beforeUpload={(e) => beforeUpload(e, ImgSize.wide)}
                  listType="picture-card"
                >
                  {wideImgList.length >= 1 ? null : <PlusOutlined />}
                </Upload>
              </Form.Item>
              <span>详情</span>
              <br />
              <span>(2648*1728)</span>
            </div>
          </Space>
        </Form.Item>
        <Form.Item
          name="activityTime"
          label="活动时间"
          rules={[
            {
              type: 'array',
              required: true,
              message: '请选择时间范围',
            },
          ]}
        >
          <RangePicker format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
ActivityCreateForm.propTypes = {
  form: propTypes.object.isRequired,
  visible: propTypes.bool.isRequired,
  title: propTypes.string.isRequired,
  onCancel: propTypes.func.isRequired,
  onOk: propTypes.func.isRequired,
  pcImgList: propTypes.array.isRequired,
  storeImgList: propTypes.array.isRequired,
  wideImgList: propTypes.array.isRequired,
  handlePcImgList: propTypes.func.isRequired,
  handleStoreImgList: propTypes.func.isRequired,
  handleWideImgList: propTypes.func.isRequired,
};
export default ActivityCreateForm;
