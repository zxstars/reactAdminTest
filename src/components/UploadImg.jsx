import React, { useState } from 'react';
import {
  Modal, Button, Upload,
} from 'antd';

const UploadImg = (props) => {
  const { modalVisibl, setisModalVisibl } = props;
  const handleOk = () => {
    setisModalVisibl(false);
  };
  const handleCancel = () => {
    setisModalVisibl(false);
  };
  const [fileList, setFileList] = useState([
    {
      uid: '-1',
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },
  ]);

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

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
  return (
    <div>
      <Modal
        title="图片上传"
        visible={modalVisibl}
        maskClosable={false}
        onCancel={handleCancel}
        footer={[
          <Button key="submit" type="primary" onClick={handleOk}>
            完成
          </Button>,
        ]}
      >
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={onChange}
          onPreview={onPreview}
        >
          {fileList.length < 6 && '+ 上传图片'}
        </Upload>
      </Modal>
    </div>
  );
};

export default UploadImg;
