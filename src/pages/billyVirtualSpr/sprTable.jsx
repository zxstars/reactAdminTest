import {
  Button,
  Form, Image, Input, Modal, Space, Table, Tag,
} from 'antd';
import React, {
  useEffect, useRef, useState,
} from 'react';
import style from '@/pages/billyVirtualSpr/index.module.scss';
import propTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { UndoOutlined } from '@ant-design/icons';
import { getVSPRById, updateSort } from '@/api/billyVirtualSpr';

const { confirm } = Modal;

const SprTable = (tableProps) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const {
    dataSource, setDataSource, onFromSprTable, handleDelete, setSelectedRows, nodeList,
  } = tableProps;
  const [iconBtnLoading, setIconBtnLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const EditableContext = React.createContext(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    useEffect(() => {
      if (editing) {
        inputRef.current.focus();
      }
    }, [editing]);
    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    };
    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({
          ...record,
          ...values,
        });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };
    let childNode = children;
    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}

        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      ) : (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div
          className={style['editable-cell-value-wrap']}
          style={{ paddingRight: 24, height: 32 }}
          onClick={toggleEdit}
        >
          {children}
        </div>
      );
    }
    return <td {...restProps}>{childNode}</td>;
  };
  const onRePush = (itemRecord) => {
    const imgNode = nodeList.find((item) => item.id === itemRecord.id);
    console.log('itemRecord', itemRecord);
    console.log('imgNode', imgNode);
    setIconBtnLoading(true);
  };

  const callback = (type, record) => {
    switch (type) {
      case 'del':
        confirm({
          title: '确认删除当前方案？',
          onOk() {
            handleDelete(record.id);
          },
          okText: '确认',
          cancelText: '取消',
        });
        return;
      case 'edit':
        // onFromSprTable(record);
        console.log('record', record);
        getVSPRById({ id: record.id }).then((res) => {
          console.log('res', res);
          onFromSprTable({
            scene: record.scene,
            id: record.id,
            designCode: res.oldDesignCode,
            dataSource: res.internalIndexJson.internalIndexJson,
            templateJson: res.templateJson,
            sceneName: {
              1: '书柜',
              2: '展示柜',
              3: '鞋柜',
              4: '玄关柜',
              5: '餐边柜',
              6: '储物柜',
            }[record.scene],
          });
        });
        return;
      default:
        return null;
    }
  };
  const onSelectChange = (newSelectedRowKeys, selectedRows) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(selectedRows);

    console.log('selectedRows changed: ', selectedRows);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record) => ({
      disabled: !record.tag,
    }),
  };

  const defaultColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: '设计代码',
      dataIndex: 'designCode',
      key: 'designCode',
    },
    {
      title: '3D图片',
      dataIndex: 'imageUrl3d',
      key: 'imageUrl3d',
      render: (el, itemRecord) => (
        <>
          {' '}
          {itemRecord.imageUrl3d ? (
            <>
              <Image
                className={style.image}
                src={itemRecord.imageUrl3d}
              />

              <div style={{ height: '20px', width: '100%' }} />
            </>
          ) : <></>}
        </>
      ),
    },
    {
      title: '尺寸',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: `${t('区域')}`,
      dataIndex: 'scene',
      key: 'scene',
      render: (status) => {
        switch (status) {
          case 1:
            return '书柜';
          case 2:
            return '展示柜';
          case 3:
            return '鞋柜';
          case 4:
            return '玄关柜';
          case 5:
            return '餐边柜';
          case 6:
            return '储物柜';
          default:
            return null;
        }
      },
    },

    {
      title: '标签',
      dataIndex: 'tag',
      key: 'tag',
      width: '10%',
      editable: true,
    },

    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: '10%',
      editable: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: `${t('高清渲染图')}`,
      dataIndex: 'images',
      key: 'images',
      // eslint-disable-next-line no-unused-vars
      render: (el, itemRecord) => {
        switch (itemRecord.renderStatus) {
          case 2:
            return (
              <>
                {' '}
                {el.length > 0 ? (
                  el.map((item) => (
                    <>
                      <img
                        src={item.imageUrl}
                        alt=""
                        className={style.image}
                      />
                      <div style={{ height: '20px', width: '100%', backgroundColor: `${item.colorCode}` }} />
                    </>
                  ))

                ) : <></>}
              </>
            );
          case 1:
            return (
              <div>稍等,正在生成高清渲染图</div>
            );
          case 0:
            return (
              <>
                <Button
                  loading={iconBtnLoading}
                  shape="circle"
                  icon={<UndoOutlined />}
                  className={style.iconBtn}
                  onClick={() => { onRePush(itemRecord); }}
                />
                <span>
                  {' '}
                  开始渲染
                </span>
              </>
            );
          default:
            return (
              <>
                <Button
                  loading={iconBtnLoading}
                  shape="circle"
                  icon={<UndoOutlined />}
                  className={style.iconBtn}
                  onClick={onRePush}
                />
                <span>
                  {' '}
                  渲染失败,请重新渲染
                </span>
              </>
            );
        }
      },
    },

    {
      title: '推送至DTC',
      dataIndex: 'dtcPushStatus',
      key: 'dtcPushStatus',
      render: (dtcPushStatus) => {
        switch (dtcPushStatus) {
          case 0:
            return '未推送';
          case 1:
            return '已推送';
          case 2:
            return '推送失败';
          default:
            return null;
        }
      },
    },
    {
      title: `${t('操作')}`,
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Tag
            className={style.tagStyle}
            type="primary"
            color="red"
            onClick={() => callback('del', record)}
          >
            删除
          </Tag>
          <Tag
            className={style.tagStyle}
            type="primary"
            color="green"
            onClick={() => callback('edit', record)}
          >
            编辑
          </Tag>
        </Space>
      ),
    },
  ];

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    const oldData = dataSource;
    setDataSource(newData);
    console.log('newData', newData);

    updateSort({
      id: row.id,
      // id: 'row.id',
      tag: row.tag,
      sort: row.sort,
    }).then((res) => {
      if (!res.success) {
        setDataSource(oldData);
      }
    }).catch(() => {
      setDataSource(oldData);
    });
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        handleSave,
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
      }),
    };
  });

  const EditableRow = ({ index, ...props }) => (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };


  return (
    <Table
      components={components}
      rowClassName={style['editable-row']}
      dataSource={dataSource}
      columns={columns}
      rowSelection={rowSelection}
      pagination={false}
    />
  );
};
SprTable.prototype = {
  dataSource: propTypes.any.isRequired,
  setDataSource: propTypes.func.isRequired,
  setSelectedRowKeys: propTypes.func.isRequired,
  handleDelete: propTypes.func.isRequired,
  onFromSprTable: propTypes.func.isRequired,
};
export default SprTable;
