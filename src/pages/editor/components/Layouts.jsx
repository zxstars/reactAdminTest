/* eslint-disable func-names */
import React, { useEffect, useState } from 'react';
import ContentCanvas from './ContentCanvas';
import Menu from './Menu';
import styles from '../editor.module.scss';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Spin } from 'antd';
import { connect } from 'react-redux';


// 获取state值
const mapStateToProps = (state) => ({
  loading: state.editorReducers.loading,
});

export default connect(mapStateToProps, null)(({ loading }) => {
  useEffect(() => {
    window.onbeforeunload = function () {
      return ('刷新后数据将重置');
    };
    // eslint-disable-next-line no-return-assign
    return () => (window.onbeforeunload = null);
  });
  const [isStrcutc, setIsStrcutc] = useState(false);

  const setStruct = (type) => {
    setIsStrcutc(type);
  };
  const onSaveCabinet = () => {
  };

  return (
    <div style={{ height: '100%' }} className={styles['layout-countent']}>
      <Spin tip="Loading..." spinning={loading}>
        <div className={styles.layout}>
          <ErrorBoundary>
            <ContentCanvas setStruct={setStruct} />
            <Menu isStrcutc={isStrcutc} setStruct={setStruct} onSaveCabinet={onSaveCabinet} />
          </ErrorBoundary>
        </div>
      </Spin>
    </div>
  );
});
