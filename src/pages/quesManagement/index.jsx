import React, { useState, useEffect } from 'react';
import {
  Table, Button, Pagination, Spin, message, Modal, Tag, ConfigProvider,
} from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import QuestionEdit from './QuestionEdit';
import { questionList, questionDelete } from '../../api/quesManagement';
import qustyle from './index.module.scss';

const { confirm } = Modal;
export default function Quesmanage() {
  const [ModalVisibl, setModalVisibl] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [size, setSize] = useState(20);
  const [record, setRecord] = useState(null);
  const editInfor = (type, recordItem) => {
    setModalVisibl(true);
    setModalType(type);
    if (type === 'edit') {
      setRecord(recordItem);
    } else {
      setRecord([]);
    }
  };
  const [quesList, setQuesList] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [spin, setSpin] = useState(false);
  const getList = (page, pageSize) => {
    if (!pageSize) {
      pageSize = size;
    }
    if (!page) {
      page = currentPage;
    }
    setSpin(true);
    questionList({ pageSize, pageNum: page }).then((res) => {
      if (res.list) {
        res.list.map((item) => {
          item.key = item.id;
          item.numcount = item.answers.length;
        });
        setQuesList(res.list);
        setTotal(res.total);
      } else {
        setQuesList([]);
        setTotal(0);
      }
    }).finally(() => {
      setSpin(false);
    });
  };
  useEffect(() => {
    setModalVisibl(false);
    getList(1);
    const info = localStorage.getItem('loginInfo');
    console.log(info);
  }, []);
  const onChange = (page, pageSize) => {
    setCurrentPage(page);
    if (pageSize !== size) {
      page = 1;
      setCurrentPage(1);
    }
    setSize(pageSize);
    getList(page, pageSize);
  };
  // const onShowSizeChange = (current, pageSize) => {

  // };
  // 删除
  const handleDelete = (id) => {
    setSpin(true);
    questionDelete(id).then((res) => {
      if (res.success) {
        message.success('删除成功');
        getList(1);
      }
    }).finally(() => {
      setSpin(false);
    });
  };
  const addList = () => {
    getList();
  };
  const showConfirm = (id) => {
    confirm({
      title: '确定要删除吗?',
      onOk() {
        handleDelete(id);
      },
      onCancel() {},
    });
  };
  const columns = [
    {
      title: '问题',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: '回复',
      dataIndex: 'numcount',
      key: 'numcount',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      render: (el, itemRecord) => (
        <>
          <Tag color="green" className="tagStyle" onClick={() => editInfor('edit', itemRecord)}>编辑回复</Tag>


          <Tag color="red" className="tagStyle" onClick={() => showConfirm(itemRecord.id)}>删除问题</Tag>
        </>
      ),
    },
  ];
  const data = quesList;
  return (
    <div>
      <QuestionEdit
        modalVisibl={ModalVisibl}
        modalType={modalType}
        getList={addList}
        // setRecord={setRecord}
        setModalVisibl={setModalVisibl}
        record={record}
      />
      <div className={qustyle.header}>
        <Button type="primary" onClick={() => editInfor('add', record)}>新增</Button>
      </div>
      <Spin tip="Loading..." spinning={spin}>
        <ConfigProvider locale={zhCN}>
          <Table columns={columns} dataSource={data} bordered style={{ marginTop: '30px' }} pagination={false} />
        </ConfigProvider>
      </Spin>
      <ConfigProvider locale={zhCN}>
        <Pagination
          style={{ marginTop: '20px', textAlign: 'right' }}
          onChange={onChange}
          // onShowSizeChange={onShowSizeChange}
          showTotal={(count) => `共 ${count} 条记录`}
          showSizeChanger
          defaultPageSize={20}
          current={currentPage}
          defaultCurrent={1}
          total={total}
        />
      </ConfigProvider>
    </div>
  );
}

