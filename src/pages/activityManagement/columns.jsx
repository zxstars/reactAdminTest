/*
 * @Description: Description
 * @Author: Xiaohua Zhu
 * @Date: 2022-02-10 17:10:11
 * @LastEditors: Xiaohua Zhu
 * @LastEditTime: 2022-03-18 14:12:51
 */
import {
  Space, Tag, Switch,
} from 'antd';
// import moment from 'moment';

const getColumns = (callback) => {
  const columns = [
    {
      title: '活动名称',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '简介',
      dataIndex: 'introduction',
      align: 'center',
      width: 250,
      render: (text) => (
        <div style={{ textAlign: 'left', wordWrap: 'break-word', wordBreak: 'break-word' }}>
          {text}
        </div>
      ),
    },
    {
      title: '起始日期',
      dataIndex: 'startTime',
      align: 'center',
    },
    {
      title: '截止日期',
      dataIndex: 'endTime',
      align: 'center',
      render: (text) => (
        <div>
          {text}
          {/* {moment(text).isBefore(moment(new Date()))
          && record.status !== '3'
          && <span style={{ color: 'red', fontSize: 12 }}> (已过期)</span>} */}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      render: (status) => {
        switch (status) {
          case '1':
            return '启用中';
          case '2':
            return '未启用';
          case '3':
            return '已结束';
          default:
            return null;
        }
      },
    },
    {
      title: '操作时间',
      dataIndex: 'updateTime',
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      render: (text, record) => (
        <Space size="middle">
          <Tag
            className="tagStyle"
            type="primary"
            color="red"
            onClick={() => callback('del', record)}
          >
            删除
          </Tag>
          <Tag
            className="tagStyle"
            type="primary"
            color="green"
            onClick={() => callback('edit', record)}
          >
            编辑
          </Tag>
        </Space>
      ),
    },
    {
      title: '启用/取消',
      dataIndex: 'enable',
      align: 'center',
      render: (text, record) => (
        <Space size="middle">
          <Switch
            checked={record.enable === '1'}
            onChange={(checked) => callback('switch', record, checked)}
          />
        </Space>
      ),
    },
  ];
  return columns;
};

export default getColumns;
