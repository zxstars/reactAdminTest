import {
  Button, ConfigProvider, Form, message, Modal, Pagination, Space, Spin, Switch, Table, Tag, Message,
} from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-irregular-whitespace
import { useTranslation, Trans } from 'react-i18next';
import {
  putPasswordReset, queryUserList, userDelete, userDisable, userEnable,
} from '../../api/userManagement';
import UserEdit from './UserEdit';
import './index.scss';

const { confirm } = Modal;

export default function UserManage() {
  const [ModalVisibl, setModalVisibl] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [userList, setUserList] = useState([]);
  const [record, setRecord] = useState(null);
  const [total, setTotal] = useState(10);
  const [size, setSize] = useState(20);
  const [num, setNumber] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [spin, setSpin] = useState(false);
  const [form] = Form.useForm();
  // eslint-disable-next-line no-irregular-whitespace
  const { t } = useTranslation();
  const getList = (page, pageSize, isDelete) => {
    setNumber(page);
    if (!pageSize) {
      pageSize = size;
    }
    queryUserList({ pageSize, pageNum: page }).then((res) => {
      if (res.success) {
        if (isDelete === 'delete') {
          let deletePage = page;
          if (!res.list) {
            deletePage = page - 1;
            setCurrentPage(page - 1);
          }
          getList(deletePage, pageSize);
          return;
        }
        res.list.map((item) => {
          const newItem = item;
          newItem.key = item.id;
          return false;
        });
        setUserList(res.list);
        setTotal(res.total);
      }
    }).finally(() => {
      setSpin(false);
    });
  };
  useEffect(() => {
    getList(1);
  }, []);

  // 新增、编辑
  const handleEdit = (type, item) => {
    setModalVisibl(true);
    setModalType(type);
    if (type === 'edit') {
      setRecord(item);
    } else {
      setRecord({});
    }
  };

  // 重置
  const handleReset = (id) => {
    setSpin(true);
    putPasswordReset({ id }).then((res) => {
      if (res.success) {
        message.success(`${t('重置成功')}`);
        getList(currentPage, size);
      }
    }).finally(() => {
      setSpin(false);
    });
  };

  // 删除
  const handleDelete = (id) => {
    setSpin(true);
    userDelete(id).then((res) => {
      if (res.success) {
        message.success(`${t('删除成功')}`);
        setCurrentPage(1);
        getList(1, size, 'delete');
      }
    }).finally(() => {
      setSpin(false);
    });
  };

  const showConfirm = (id) => {
    confirm({
      title: `${t('确定要删除吗')}?`,
      okText: `${t('确认')}`,
      cancelText: `${t('取消')}`,
      onOk() {
        handleDelete(id);
      },
      onCancel() { },
    });
  };

  const onChange = (page, pageSize) => {
    setSize(pageSize);
    setCurrentPage(page);
    getList(page, pageSize);
  };
  const changeStatus = (item) => {
    console.log('item', item);
    setSpin(true);
    if (item.status === '1') {
      userDisable(item.id).then((res) => {
        if (res.success) {
          Message.success(`${t('关闭用户成功')}`);
        }
      }).finally(() => {
        setSpin(false);
        getList(currentPage);
      });
    } else {
      userEnable(item.id).then((res) => {
        if (res.success) {
          Message.success(`${t('开启用户成功')}`);
        }
      }).finally(() => {
        setSpin(false);
        getList(currentPage);
      });
    }
  };
  const columns = [
    {
      title: `${t('用户名')}`,
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: `${t('角色')}`,
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: `${t('所属BU')}`,
      dataIndex: 'countryName',
      key: 'countryName',
    },
    {
      title: `${t('状态')}`,
      key: 'status',
      dataIndex: 'status',
      render: (el, item) => (
        <Switch checked={item.status !== '0'} onChange={() => changeStatus(item)} />
      ),
    },
    {
      title: `${t('创建时间')}`,
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: `${t('更新时间')}`,
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: `${t('操作')}`,
      key: 'action',
      render: (el, item) => (
        <Space size="middle">
          <Tag className="tagStyle" color="blue" onClick={() => handleReset(item.id)}>
            <Trans>重置</Trans>
          </Tag>
          <Tag className="tagStyle" color="green" onClick={() => handleEdit('edit', item)}>
            <Trans>编辑</Trans>
          </Tag>
          <Tag className="tagStyle" color="red" onClick={() => showConfirm(item.id)}>
            <Trans>删除</Trans>
          </Tag>
        </Space>
      ),
    },
  ];

  const data = userList;
  return (
    <div>
      <UserEdit
        modalVisibl={ModalVisibl}
        setModalVisibl={setModalVisibl}
        modalType={modalType}
        getList={getList}
        setRecord={setRecord}
        record={record}
        currentPage={currentPage}
      />
      <div className="header">
        <Form form={form} name="horizontal_login" layout="inline" />
        <Button type="primary" onClick={() => handleEdit('add')}><Trans>新增</Trans></Button>
      </div>
      <Spin tip="Loading..." spinning={spin}>
        <ConfigProvider locale={zhCN}>
          <Table columns={columns} dataSource={data} bordered style={{ marginTop: '30px' }} pagination={false} />
        </ConfigProvider>
      </Spin>
      <ConfigProvider locale={zhCN}>
        <Pagination
          showSizeChanger="false"
          style={{ marginTop: '20px', textAlign: 'right' }}
          defaultCurrent={1}
          current={num}
          pageSize={size}
          // pageNum={page}
          showTotal={(count) => `${t('共')} ${count} ${t('条记录')}`}
          onChange={onChange}
          total={total}
        />
      </ConfigProvider>

    </div>
  );
}
