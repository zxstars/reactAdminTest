import React from 'react';
import {
  Form, Input, Button, Row, Col, Modal,
} from 'antd';
import { UserOutlined, LockOutlined, RedoOutlined } from '@ant-design/icons';
import JSEncrypt from 'jsencrypt';
import Cookie from 'js-cookie';
import { connect } from 'react-redux';
import Auth from '@/utils/auth';
import leftImg from '@/assets/images/login-left.png';
import { rsaPublicKey, ROUTE_LOCALISTL_NAME } from '@/config';
import { xsrfHeaderName } from '@/config/const';
import { adminRoutes } from '@/routes';
import PropTypes from 'prop-types';
import { authCode, authLogin, getMenuList } from '../../api/login';
import styles from './index.module.scss';

class Login extends React.Component {
    formRef = React.createRef();

    constructor(props) {
      super(props);
      this.state = {
        Spin: false,
        codeImg: '',
        uuid: '',
        loading: false,
        username: '',
        password: '',
        // isRemeber: false,
      };
    }

    // constructor加载之后,DOM渲染之前执行此方法
    // eslint-disable-next-line camelcase
    UNSAFE_componentWillMount() {
      // 获取验证码
      this.handleSpin();

      // 记住密码
      // this.isRemeber()
    }

    // 渲染用户
    isRemeber = () => {
      const userinfo = Auth.getUserPwd();
      if (userinfo && userinfo.remember) {
        this.setState({
          username: userinfo.username,
          password: userinfo.password,
        //   isRemeber: 'checked',
        });
      }
    }

    onFinish = (values) => {
      const {
        history,
      } = this.props;
      // 登录成功，设置token令牌
      Auth.setToken('jwt token');
      // 是否点击记住我，如果点击则保存用户账号和密码
      Auth.setUserPwd(values);
      history.push('/aa'); // 成功后跳转
    }

    getMenu = () => {
      getMenuList().then((res) => {
        const { list, success } = res;
        if (success) {
          // 获取权限菜单
          const localRoutesNames = list.map((v) => v.menuName).filter((v) => typeof v !== 'undefined') || [];
          // 过滤权限菜单
          const menuLists = adminRoutes.filter((v) => {
            // if (localRoutesNames.includes(v.title)) {
            if (v.title) {
              return v;
            }
            return false;
          });
          console.log('menuLists', menuLists);
          console.log('localRoutesNames', localRoutesNames);
          const {
            setAuthRoutes,
            history,
          } = this.props;
          setAuthRoutes(menuLists);
          // Auth.setLocalCache(ROUTE_LOCALISTL_NAME, localRoutesNames);
          Auth.setLocalCache(ROUTE_LOCALISTL_NAME, menuLists);
          history.push(menuLists[0] ? menuLists[0].path : '/'); // 成功后跳转
        }
      });
    }

    handleOk = () => {
      const {
        validateFields,
      } = this.formRef.current;
      validateFields()
        .then((values) => {
          const params = values;
          const {
            uuid,
          } = this.state;

          // 密码进行rsa加密
          const encrypt = new JSEncrypt();
          encrypt.setPublicKey(rsaPublicKey);
          params.password = encrypt.encrypt(params.password);
          const data = {
            ...params,
            uuid,
          };

          authLogin(data).then((res) => {
            const {
              roles, user, token, success,
            } = res;
            // 设置缓存登录信息
            Auth.setLocalCache('admin-tool-base-info', { roles, user });
            // 设置token
            const expireTime = new Date(new Date().getTime() + 4 * 60 * 60 * 1000);
            Cookie.set(xsrfHeaderName, token, { expires: expireTime });
            // 设置token
            Auth.setToken(`${token}`);
            // // 是否点击记住我，如果点击则保存用户账号和密码
            // Auth.setUserPwd(values)
            if (success) {
              if (res.isChangePassword) {
                Modal.info({
                  title: '提示',
                  okText: '确认',
                  content: (
                    <p>
                      当前为默认密码，请修改密码
                    </p>
                  ),
                  onOk: () => {
                    // 获取菜单权限
                    this.getMenu();
                  },
                });
              } else {
                this.getMenu();
              }
            } else {
              this.handleSpin();
            }
          });
        })
        .catch((errorInfo) => { // 检验失败
          console.log(errorInfo);
        });
    }

    handleSpin = () => {
      this.setState({
        Spin: true,
      });
      authCode().then((res) => {
        this.setState({
          codeImg: res.img,
          uuid: res.uuid,
          Spin: false,
        });
      });
    }

    handleForget = () => {
      Modal.confirm({
        title: '忘记密码？',
        content: '请联系管理员重置密码',
        okText: '确认',
        cancelText: '取消',
      });
    }

    render() {
      const {
        username,
        password,
        codeImg,
        Spin,
        loading,
      } = this.state;
      return (
        <div className={styles.wrap}>
          <div className={styles.left}>
            <img src={leftImg} style={{ width: '100%', height: '100%' }} alt="logo" />
          </div>
          <div className={styles.right}>
            <div className={styles.form}>
              <div className={styles.logo}>
                登录
              </div>
              <Form
                ref={this.formRef}
                className="test"
                name="normal_login"
                initialValues={{ remember: true }}
                onFinish={this.onFinish}
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: '请输入您的用户名!' }]}
                  initialValue={username}
                >
                  <Input
                    onPressEnter={this.handleOk}
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    placeholder="请输入您的用户名"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入您的密码!' }]}
                  initialValue={password}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="请输入您的密码"
                  />
                </Form.Item>
                <Form.Item>
                  <Row gutter={10}>
                    <Col span={13}>
                      <Form.Item
                        name="verifyCode"
                        rules={[{ required: true, message: '请输入您的验证码!' }]}
                        noStyle
                      >
                        <Input placeholder="验证码" />
                      </Form.Item>
                    </Col>
                    <Col span={9}>
                      <img src={codeImg} alt="" />
                    </Col>
                    <Col span={2} style={{ lineHeight: '-15px' }}>
                      <RedoOutlined
                        style={{ fontSize: '20px' }}
                        rotate={180}
                        spin={Spin}
                        onClick={this.handleSpin}
                      />
                    </Col>
                  </Row>
                </Form.Item>
                <Row>
                  <Button
                    type="primary"
                    onClick={this.handleOk}
                    loading={loading}
                  >
                    登录
                  </Button>
                  <p style={{ cursor: 'pointer' }} onClick={this.handleForget} role="none">
                    忘记密码
                  </p>
                </Row>

              </Form>
            </div>
          </div>
        </div>


      );
    }
}

// 获取state值
const mapStateToProps = (state) => ({
  defaultRoutes: state.loginReducers.defaultRoutes,
});

// 改变state的值的方法
const mapDispatchToProps = (dispatch) => ({
  setAuthRoutes: (routes) => {
    dispatch({ type: 'SET_ROUTES', payload: routes });
  },

});


Login.propTypes = {
  setAuthRoutes: PropTypes.func.isRequired,
  history: PropTypes.object,
};
Login.defaultProps = {
  history: null,
};
export default connect(mapStateToProps, mapDispatchToProps)(Login);
