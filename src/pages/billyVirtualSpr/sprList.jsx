import {
  Button, Form, Input, Modal, Row, DatePicker, Select, message, ConfigProvider, Pagination, Spin, Message,
} from 'antd';
import style from '@/pages/billyVirtualSpr/index.module.scss';
import { Trans, useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import SprTable from '@/pages/billyVirtualSpr/sprTable';
import propTypes from 'prop-types';
import zhCN from 'antd/lib/locale/zh_CN';
import {
  deleteVSPR, exportExcel, getVSPRList, getVSPRNodeList, pushDTC,
} from '@/api/billyVirtualSpr';
import utils from '@/utils/util';

const { confirm } = Modal;
const { RangePicker } = DatePicker;


const SprList = (props) => {
  const { onFromSprTable, activeKey } = props;
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [startCombinationTime, setStartCombinationTime] = useState('');
  const [endCombinationTime, setEndCombinationTime] = useState('');
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [spin, setSpin] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [nodeList, setNodeList] = useState([]);
  const getList = (page, pageSize) => {
    setSpin(true);
    if (!page) {
      page = currentPage;
    }
    if (!pageSize) {
      pageSize = size;
    }

    const data = {
      language: 'zh',
      bu: 'cn',
      startTime: startCombinationTime,
      endTime: endCombinationTime,
      pageSize,
      pageNum: page,
      designCode: form.getFieldsValue().designCode,
      status: form.getFieldsValue().status,
    };
    console.log('data', data);
    getVSPRList(data).then((res) => {
      console.log('getVSPRList', res);
      if (res.list) {
        setTotal(res.total);
        setDataSource(res.list.map((item, index) => ({
          index: index + 1,
          key: item.id,
          designCode: item.designCode,
          imageUrl3d: item.imageUrl3d,
          size: `${item.realWidth?.leftWidth ? `${item.realWidth?.leftWidth}/${item.realWidth?.width}`
            : item.realWidth?.width}宽、${item.height}高、${item.depth}深`,
          scene: item.scene,
          tag: item.tag,
          sort: item.sort,
          dataIndex: index,
          createTime: item.createTime,
          images: item.images,
          dtcPushStatus: item.dtcPushStatus,
          renderStatus: item.renderStatus,
          id: item.id,
        })));
      } else {
        setSize(20);
        setTotal(0);
      }
    }).finally(() => {
      setSpin(false);
    });
    getVSPRNodeList(data).then((res) => {
      console.log('getVSPRNodeList', res);
      setNodeList(res.list);
    });
  };
  const onChange = (page, pageSize) => {
    setCurrentPage(page);
    setSize(pageSize);
    getList(page, pageSize);
  };
  useEffect(async () => {
    if (activeKey === '2') {
      getList(1, 20);
    } else {
      form.resetFields();
    }
  }, [activeKey]);

  const onFinish = () => {
    setCurrentPage(1);
    getList();
  };

  const onChangeStart = (momentList, momentStr) => {
    setStartCombinationTime(momentStr[0]);
    setEndCombinationTime(momentStr[1]);
  };
  const onPush = () => {
    console.log('selectedRowKeys', selectedRows);
    const isPush = selectedRows.find((row) => {
      if (row.dtcPushStatus === 1) {
        return true;
      }
      if (row.renderStatus !== 2 || (!row.images.length > 0)) {
        return true;
      }
    });
    if (isPush) {
      // 无法推送
      confirm({
        title: '无法推送,可能未包含高清渲染图或重复推送，请重新勾选',
        onOk() {
        },
        okText: '确认',
        cancelText: '取消',
      });
    } else {
      pushDTC({ ids: selectedRows.map((row) => row.id) }).then((res) => {
        console.log(res);
        message.warning('消息推动成功');
      }).catch((e) => {
        console.log('e', e);
        message.warning('消息推动失败');
      });
    }
  };

  const onDownload = () => {
    exportExcel({ ids: selectedRows.map((row) => row.id) }).then((response) => {
      if (response.data instanceof Blob) {
        utils.down(response.data, response.filename);
      }
    }).catch(() => {
      message.error('导出失败');
    });
  };

  // eslint-disable-next-line no-unused-vars
  const handleDelete = (id) => {
    setSpin(true);
    deleteVSPR({ id }).then((res) => {
      console.log('res', res);
      if (res.success) {
        Message.success('移除成功');
        getList();
      }
    }).finally(() => {
      setSpin(false);
    });
  };

  return (
    <div className={style.addInterior}>
      <Form
        name="complex-form"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={onFinish}
        form={form}
      >
        <Row className={style.heard}>
          <div>
            <Form.Item
              getValueFromEvent={
                (event) => event.target.value
                  .replace(/[\u4E00-\u9FA5?？!！￥@#$%^&*()_+\-=）…（—｛｝{}【】[\]、`~.,，。《》<>|/]/g, '')
}
              className={style.label}
              name="designCode"
              label="设计代码"
            >
              <Input allowClear placeholder="请输入" maxLength={6} />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name="status"
              label="高清渲染状态:"
              labelCol={{ span: 12 }}

            >
              <Select
                placeholder={`${t('请选择')}`}
                className={style.category}
                style={{ width: '162px' }}
                defaultValue="0"
              >
                <>
                  <Select.Option value="0" key="0">{`${t('所有')}`}</Select.Option>
                  <Select.Option value="1" key="1">{`${t('是')}`}</Select.Option>
                  <Select.Option value="2" key="2">{`${t('否')}`}</Select.Option>
                </>
              </Select>
            </Form.Item>
          </div>
          <div>
            <Form.Item
              className={style.label}
              name="date"
              label="日期"
              labelCol={{ span: 7 }}
              initialValue={['', '']}
            >
              <RangePicker
                getPopupContainer={(triggerNode) => triggerNode.parentElement}
                onChange={onChangeStart}
                placeholder={['开始日期', '截止日期']}
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
              <Button onClick={() => {
                form.resetFields();
                getList(1, 20);
                setStartCombinationTime('');
                setEndCombinationTime('');
              }}
              >
                <Trans>重置</Trans>
              </Button>
            </Form.Item>
          </div>
          <div>
            <Form.Item label=" " colon={false}>
              <Button type="primary" htmlType="Submit">
                <Trans>查询</Trans>
              </Button>
            </Form.Item>
          </div>
        </Row>
      </Form>
      <div className={style.download}>
        <Button onClick={onPush}>
          推送至DTC
        </Button>
        <Button onClick={onDownload}>
          下载
        </Button>
      </div>
      <div>
        <Spin tip="Loading..." spinning={spin}>
          <ConfigProvider locale={zhCN}>
            <SprTable
              dataSource={dataSource}
              nodeList={nodeList}
              setDataSource={setDataSource}
              onFromSprTable={onFromSprTable}
              handleDelete={handleDelete}
              setSelectedRows={setSelectedRows}
            />
          </ConfigProvider>
        </Spin>
      </div>
      <ConfigProvider locale={zhCN}>
        <Pagination
          style={{ marginTop: '20px', textAlign: 'right' }}
          pageSize={size}
          onChange={onChange}
          showSizeChanger
          defaultPageSize={20}
          defaultCurrent={1}
          current={currentPage}
          showTotal={(count) => `共 ${count} 条记录`}
          total={total}
        />
      </ConfigProvider>
    </div>
  );
};

SprTable.propTypes = {
  onFromSprTable: propTypes.func.isRequired,
};

export default SprList;

