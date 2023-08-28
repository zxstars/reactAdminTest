/* eslint-disable func-names */
import React, { useEffect } from 'react';
import Layouts from './components/Layouts';
import { ConfigProvider } from 'antd';
import locale from 'antd/lib/locale/zh_CN';

export default function () {
  useEffect(() => {

  }, []);

  return (
    <ConfigProvider locale={locale}>
      <Layouts />
    </ConfigProvider>
  );
}
