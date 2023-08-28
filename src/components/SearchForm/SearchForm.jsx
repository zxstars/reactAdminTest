import React from 'react';
import { Form, Select } from 'antd';

import Styles from './searchform.css';

const Fangdajing = require('../../assets/images/fangdajing.jpg');

const { Option } = Select;

const SearchForm = (props) => {
  const { isSelect } = props;
  const onFinish = (values) => {
    console.log('Received values from form: ', values);
  };
  return (
    <Form
      name="customized_form_controls"
      layout="inline"
      onFinish={onFinish}
      initialValues={{
        price: {
          number: 0,
          currency: 'rmb',
        },
      }}
    >
      {
        isSelect ? (
          <Form.Item>
            <div className={Styles.select}>
              <Select allowClear bordered={false} size="large" style={{ width: '100%' }}>
                <Option>全部分类</Option>
                <Option>商品名称</Option>
                <Option>商品类别</Option>
                <Option>商品货号</Option>
              </Select>
            </div>
          </Form.Item>
        ) : null
      }
      <Form.Item>
        <div className={Styles.search}>
          <input
            type="text"
            placeholder={isSelect ? '搜索姓名或者编号' : '搜索编号'}
            style={{
              width: '90%', height: '90%', outline: 'medium', border: '0',
            }}
          />
          <img style={{ width: '8%', height: '80%', marginLeft: '5%' }} src={Fangdajing} alt="" />
        </div>
      </Form.Item>
    </Form>
  );
};
export default SearchForm;
