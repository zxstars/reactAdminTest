/*
 * @Description: Description
 * @Author: Xiaohua Zhu
 * @Date: 2022-02-10 13:37:27
 * @LastEditors: Xiaohua Zhu
 * @LastEditTime: 2022-02-23 10:21:26
 */
import React, { useEffect, useState } from 'react';
import {
  Table, Space, Input, Select, Button, Divider, Modal, ConfigProvider, Form, message,
} from 'antd';

import zhCN from 'antd/lib/locale/zh_CN';
import moment from 'moment';
import {
  getActivityList,
  updateActivity,
  addActivity,
  deleteActivity,
  enableActivity,
  disableActivity,
} from '../../api/activityManagement';
import getColumns from './columns';
import ActivityForm from './activityForm';

const { Option } = Select;
const ActivityManagement = () => {
  const [activityList, setActivityList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [id, setID] = useState(null);
  const [pcImgList, setPcImgList] = useState([]);
  const [storeImgList, setStoreImgList] = useState([]);
  const [wideImgList, setWideImgList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchSelect, setSearchSelect] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();

  const { confirm } = Modal;
  // 获取活动列表
  const handleGetActivityList = (status = 0, name = '', backToFirstPage = true, pageSizeSetted = pageSize) => {
    getActivityList({
      status, name, pageNum: backToFirstPage ? 1 : pageNum, pageSize: pageSizeSetted,
    }).then((res) => {
      setLoading(false);
      if (res.success) {
        setActivityList(res.list);
        setTotal(res.total);
        if (backToFirstPage) {
          setPageNum(1);
        }
      }
    });
  };
  // 通过表单校验后的方法
  const onCreate = (values) => {
    setLoading(true);
    const imgType = [{ name: 'pcImg', id: 1 }, { name: 'storeImg', id: 2 }, { name: 'wideImg', id: 3 }];
    const activityImageList = [];
    imgType.forEach((element) => {
      const imgArr = values[element.name];
      if (imgArr?.length > 0) {
        const imgDetail = imgArr[0]?.response ? imgArr[0]?.response.data : imgArr[0];
        activityImageList.push({
          imageUrl: imgDetail.url,
          imageHeight: parseInt(imgDetail.height, 10),
          imageWidth: parseInt(imgDetail.width, 10),
          imageType: element.id,
        });
      }
    });
    // 判断所填写的表单是编辑还是新增
    if (title === '编辑活动') {
      updateActivity({
        name: values.activityName,
        introduction: values.introduction,
        activityImageList,
        startTime: `${values.activityTime[0].format('YYYY-MM-DD')} 00:00:00`,
        endTime: `${values.activityTime[1].format('YYYY-MM-DD')} 23:59:59`,
        id,
      }).then((res) => {
        if (res.success) {
          message.success('已保存更新');
          handleGetActivityList(0, '', false);
        }
      });
    } else {
      addActivity({
        name: values.activityName,
        introduction: values.introduction,
        activityImageList,
        startTime: `${values.activityTime[0].format('YYYY-MM-DD')} 00:00:00`,
        endTime: `${values.activityTime[1].format('YYYY-MM-DD')} 23:59:59`,
      }).then((res) => {
        if (res.success) {
          message.success('添加成功');
          handleGetActivityList();
        }
      });
    }
    setVisible(false);
  };
  const handlePcImgList = ({ fileList }) => {
    setPcImgList(fileList);
  };
  const handleStoreImgList = ({ fileList }) => {
    setStoreImgList(fileList);
  };
  const handleWideImgList = ({ fileList }) => {
    setWideImgList(fileList);
  };
  const clearImgList = () => {
    setPcImgList([]); setStoreImgList([]); setWideImgList([]);
  };
  // 点击表单确定按钮触发表单验证
  const onOk = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        onCreate(values);
        setID(null);
        clearImgList();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };
  // 搜索按钮
  const onSearch = () => {
    setLoading(true);
    handleGetActivityList(searchSelect, searchText);
  };

  // 重置按钮
  const onReset = () => {
    setSearchSelect(0);
    setSearchText('');
    setLoading(true);
    setPageSize(20);
    handleGetActivityList(0, '', true, 20);
  };


  useEffect(() => {
    setLoading(true);
    handleGetActivityList();
  }, []);

  // 点击表格中的交互按按钮 调用的方法
  const handleActions = (actionType, record, checked) => {
    switch (actionType) {
      // 删除活动
      case 'del':
        confirm({
          title: `确定要删除 ${record.name} 吗`,
          onOk() {
            setLoading(true);
            deleteActivity(record.id).then((res) => {
              if (res.success) {
                handleGetActivityList();
              }
            });
          },
        });
        break;
      // 启用/关闭活动
      case 'switch':
        if (checked) {
          if (record.hasEnable === '1') {
            message.error('当前存在已启用活动项，需先关闭。');
          } else if (moment(record.endTime).isBefore(moment(new Date()))) {
            message.error('无法启用，活动截止时间早于当前时间，需调截止时间');
          } else {
            confirm({
              title: `确定要开启 ${record.name} 吗`,
              onOk() {
                setLoading(true);
                enableActivity(record.id).then((res) => {
                  if (res.success) {
                    handleGetActivityList();
                  }
                });
              },
            });
          }
        } else {
          confirm({
            title: `确定要关闭 ${record.name} 吗`,
            onOk() {
              setLoading(true);
              disableActivity(record.id).then((res) => {
                if (res.success) {
                  handleGetActivityList();
                }
              });
            },
          });
        }
        break;
      // 编辑活动
      case 'edit':
        {
          setTitle('编辑活动');
          setID(record.id);
          let pcImg; let storeImg; let wideImg;
          record.activityList.forEach((element) => {
            const imgUrl = [{
              url: element.imageUrl,
              width: element.imageWidth,
              height: element.imageHeight,
            }];
            switch (element.imageType) {
              case '1':
                setPcImgList(imgUrl);
                pcImg = imgUrl;
                break;
              case '2':
                setStoreImgList(imgUrl);
                storeImg = imgUrl;
                break;
              case '3':
                setWideImgList(imgUrl);
                wideImg = imgUrl;
                break;
              default:
                break;
            }
          });
          const editItem = {
            activityName: record.name,
            activityTime: [moment(record.startTime), moment(record.endTime)],
            introduction: record.introduction,
            pcImg,
            storeImg,
            wideImg,
          };
          form.setFieldsValue(editItem);
          setVisible(true);
        }
        break;
      default:
        break;
    }
  };
  return (
    <ConfigProvider locale={zhCN}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* 查询功能 */}
        <Space size="large">
          <Space>
            活动名称 ：
            <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear />
          </Space>
          <Space>
            状态 ：
            <Select
              getPopupContainer={(triggerNode) => triggerNode.parentElement}
              value={searchSelect}
              onChange={(e) => setSearchSelect(e)}
              style={{ width: 120 }}
            >
              <Option value={0}>全部</Option>
              <Option value={1}>启用中</Option>
              <Option value={2}>未启用</Option>
              <Option value={3}>已结束</Option>
            </Select>
          </Space>
          <Button onClick={onReset}>重置</Button>
          <Button type="primary" onClick={() => onSearch()}>查询</Button>
          <Button
            type="primary"
            onClick={() => {
              setTitle('新增活动');
              form.resetFields();
              setVisible(true);
            }}
          >
            新增
          </Button>
        </Space>
        {/* 查询功能 */}
        <Divider />
        <Table
          bordered
          columns={getColumns(handleActions)}
          dataSource={activityList}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={{
            current: pageNum,
            total,
            pageSize,
            showSizeChanger: true,
            showTotal: (text) => `共 ${text} 条记录`,
            onChange: (pageindex, pageSizeValue) => {
              setLoading(true);
              getActivityList({ pageNum: pageindex, pageSize: pageSizeValue }).then((res) => {
                if (res.success) {
                  setPageNum(pageindex);
                  setPageSize(pageSizeValue);
                  setActivityList(res.list);
                  setLoading(false);
                }
              });
            },
          }}
        />
      </Space>
      {/* 表单组件 */}
      <ActivityForm
        form={form}
        visible={visible}
        title={title}
        onOk={onOk}
        onCancel={() => {
          clearImgList();
          setID(null);
          setVisible(false);
          form.resetFields();
        }}
        pcImgList={pcImgList}
        storeImgList={storeImgList}
        wideImgList={wideImgList}
        handlePcImgList={handlePcImgList}
        handleStoreImgList={handleStoreImgList}
        handleWideImgList={handleWideImgList}
      />
    </ConfigProvider>
  );
};

export default ActivityManagement;
