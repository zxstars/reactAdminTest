import logo from '@/assets/images/logo192.png';
import { adminRoutes as routes } from '@/routes';
import Auth from '@/utils/auth';
import { BulbOutlined, createFromIconfontCN } from '@ant-design/icons';
import { Avatar, Breadcrumb, Dropdown, Layout, Menu, Switch, Tabs } from 'antd';
import React from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { Link, withRouter } from 'react-router-dom';
import './index.css';

const { SubMenu } = Menu;
const {
  Header, Content, Footer, Sider,
} = Layout;
const { TabPane } = Tabs;

// 阿里矢量图标地址
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2157315_vyjthadixcd.js',
});

// 初始化面包屑数据
const breadcrumbNameMap = {};

// 语言类型
const languages = [
  {
    key: 'zh',
    title: '简体中文',
    icon: 'icon-zhongwen',
  },
  {
    key: 'en',
    title: 'English',
    icon: 'icon-yingwen',
  },
];

@withTranslation()
@withRouter
class Layouts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      extraBreadcrumbItems: null,
      state: null,
      theme: 'dark',
      username: JSON.parse(localStorage.getItem('loginInfo')).username,
      activeKey: null,
      panes: [],
      openKeys: () => {
        const arr = this.props.location.pathname.split('/');
        arr.pop();
        return arr.join('/');
      },
      pathname: this.props.location.pathname,
    };
  }

  // 折叠左侧菜单栏
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  // 切换语言
  handleLanguageChange = ({ key }) => {
    this.props.i18n.changeLanguage(key);
  }

  // 获取当前语言类型
  getLanguageTitle = () => {
    for (const index in languages) {
      if (languages[index].key === this.props.i18n.language) {
        return languages[index];
      }
    }
  }

  // 加载面包屑数据
  loadBreadcrumb(route) {
    route.forEach((item) => {
      if (item.isShow) {
        breadcrumbNameMap[item.path] = {
          title: item.title,
          icon: item.icon,
          route: item.route ? item.route : false,
        };
      }
      if (item.childrens) {
        this.loadBreadcrumb(item.childrens);
      }
    });
  }

  // 获取面包屑
  getPath = (routeUrl) => {
    // 对路径进行切分
    const pathSnippets = routeUrl.split('/').filter((i) => i);
    // 将切分的路径读出来，形成面包屑，存放到this.state.extraBreadcrumbItems
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      // 判断当前路由是否存在有面包签，有则返回，无则返回 ""
      if (breadcrumbNameMap[url]) {
        return (
          <Breadcrumb.Item key={url}>
            <Link to={breadcrumbNameMap[url].route ? '#' : url} style={{ fontWeight: 'bold' }}>
              <IconFont type={breadcrumbNameMap[url].icon} style={{ marginRight: '3px' }} />
              <Trans>{breadcrumbNameMap[url].title}</Trans>
            </Link>
          </Breadcrumb.Item>
        );
      }
      return '';
    });

    this.setState({
      extraBreadcrumbItems,
    });
  }

  // 递归处理左侧菜单栏
  renderMenu = (data) => data.map((item) => {
    if (item.childrens) { // 如果有子节点，继续递归调用，直到没有子节点
      if (!(item.childrens.length === 1 && !item.childrens[0].isShow)) {
        return (
          <SubMenu title={<Trans>{item.title}</Trans>} key={item.path} icon={<IconFont type={item.icon} />}>
            {this.renderMenu(item.childrens)}
          </SubMenu>
        );
      }
    }
    if (item.isShow) {
      // 没有子节点就返回当前的父节点
      return (
        <Menu.Item title={<Trans>{item.title}</Trans>} key={item.path} icon={<IconFont type={item.icon} />} onClick={(p) => this.toRouteView(item)}>
          <Trans>{item.title}</Trans>
        </Menu.Item>
      );
    }
    return '';
  })

  // 路由跳转到页面
  toRouteView = (item) => {
    this.props.history.push(item.path);
  }

  // 标签页改变时
  onChange = (activeKey) => {
    const openKeys = () => {
      const arr = activeKey.split('/');
      arr.pop();
      return arr.join('/');
    };
    this.setState({
      activeKey,
      openKeys,
    });
    this.props.history.push(activeKey);
  }

  // 标签页关闭时回调
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  }

  // 删除标签页
  remove = (targetKey) => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.path === targetKey) {
        lastIndex = i - 1;
      }
    });

    /**
       * 问题:因为当前方法被多次调用,this.setState()方法是异步方法,
       * this.state.panes还没被赋值改变完成时,当前方法又被调用了,然而this.state.panes值还没改变完成就又被使用了,所以存在数据误差
       * 解决方案:使用setTimeout方法
       */

    // 过滤当前关闭的标签页重新赋值数组
    const panes = this.state.panes.filter((pane) => pane.path !== targetKey);

    // 如果要删除的标签就是当前选中的标签则向前选中一个标签
    if (panes.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        activeKey = panes[lastIndex].path;
      } else {
        activeKey = panes[0].path;
      }
    }
    this.setState({ panes, activeKey }, () => {
      this.props.history.push(activeKey);
    });
  }

  // 当左侧菜单被展开或关闭时触发此处
  onOpenChange = (openKeys) => {
    if (openKeys.length !== 0) {
      this.setState({
        openKeys: () => openKeys[1],
      });
    } else {
      this.setState({
        openKeys: () => null,
      });
    }
  }

  // 标签页
  newTabs = (routers) => {
    for (const i in routers) {
      if (!routers[i].childrens && routers[i].isShow && routers[i].path === this.state.pathname) {
        // 判断当前路由是否已经存在标签页数组中
        const arr = this.state.panes.map((route) => route.path);

        // 如果不存在则添加标签页,存在则直接跳转
        if (!arr.includes(routers[i].path)) {
          const { panes } = this.state;
          panes.push(routers[i]);
          this.setState({
            panes,
            activeKey: routers[i].path,
            openKeys: () => {
              const arr = routers[i].path.split('/');
              arr.pop();
              return arr.join('/');
            },
          });
        } else {
          this.setState({ activeKey: routers[i].path });
        }
      }
      if (routers[i].isShow) {
        this.newTabs(routers[i].childrens);
      }
    }
  }

  // 关闭标签页
  closeTabs = (type) => {
    switch (type) {
      case 'all':
        this.state.panes.forEach((item) => {
          if (item.path !== '/admin') {
            setTimeout(() => {
              this.remove(item.path);
            });
          }
        });
        break;
      case 'other':
        this.state.panes.forEach((item) => {
          if (item.path !== '/admin' && item.path !== this.props.location.pathname) {
            setTimeout(() => {
              this.remove(item.path);
            });
          }
        });
        break;
      default:
    }
  }

  // 页面挂载完成时
  componentDidMount = () => {
    // 面包签数据初始化
    this.loadBreadcrumb(routes);
    this.getPath(this.props.location.pathname);

    // 标签页数据初始化
    this.setState({
      panes: [routes[0]],
    }, () => {
      this.fetchData(this.props.location);
    });
  }

  // 渲染标签页
  fetchData(location) {
    this.setState({
      pathname: location.pathname,
    }, () => {
      this.newTabs(routes);
    });
  }

  // 组件第一次存在于虚拟dom中，函数是不会被执行的
  // 如果已经存在dom中，函数才会被执行
  // 第一次加载不会执行，dom存在更新时才会执行
  // 路由更新时
  componentWillReceiveProps(nextProps) {
    // 判断点击跳转不是当前页面
    if (nextProps.location.pathname !== this.state.pathname) {
      // 更新标签页
      this.fetchData(nextProps.location);
      // 更新面包签
      this.getPath(nextProps.location.pathname);
    }
  }

  // 检测是否关闭标签
  isHideCloseIcon(item) {
    if (item.hideClose) {
      return <div />;
    }
    return '';
  }

  render() {
    return (
      <Layout>
        {/* 左边区域 */}
        <Sider trigger={null} collapsible collapsed={this.state.collapsed} theme={this.state.theme}>
          {/* logo图片 */}
          <div className={this.state.theme === 'dark' ? 'logo' : 'logo-light'}>
            <img src={logo} alt="logo" />
            {!this.state.collapsed && <h1><Trans>后台管理系统</Trans></h1>}
          </div>

          <Menu
            className="menuContainer"
            mode="inline"
            theme={this.state.theme}
            openKeys={[this.state.openKeys()]}
            selectedKeys={[this.props.location.pathname]}
            onOpenChange={this.onOpenChange}
          >
            {/* 左侧菜单栏 */}
            {this.renderMenu(routes)}
          </Menu>

          {!this.state.collapsed && (
            <div className="switchTheme">
              <span>
                <BulbOutlined />
                <Trans>切换主题</Trans>
              </span>
              <Switch
                checkedChildren={<Trans>暗</Trans>}
                unCheckedChildren={<Trans>明</Trans>}
                defaultChecked={this.state.theme === 'dark'}
                onChange={(checked) => {
                  this.setState({
                    theme: checked ? 'dark' : 'light',
                  });
                }}
              />
            </div>
          )}
        </Sider>
        {/* 右边区域 */}
        <Layout className="site-layout">
          {/* 头部 */}
          <Header className="site-layout-background" theme="light" style={{ padding: 0 }}>
            {/* {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: 'trigger',
                onClick: this.toggle,
              })} */}
            {/* 面包屑 */}
            <Breadcrumb style={{ margin: '21px 0', padding: '0 24px', float: 'left' }}>
              {this.state.extraBreadcrumbItems}
            </Breadcrumb>
            <Menu theme="light" mode="horizontal" style={{ height: '64px', justifyContent: 'flex-end' }}>
              <div>

                {/* 头像和登录名称 */}
                <SubMenu
                  style={{ float: 'right' }}
                  title={(
                    <>
                      <Avatar style={{ marginLeft: 8 }} src={logo} />
                      <span style={{ color: '#999', marginRight: 4, marginLeft: 5 }}>
                        <Trans>你好</Trans>
                        ,
                      </span>
                      <span>{this.state.username}</span>
                    </>
                  )}
                >
                  <Menu.Item
                    key="SignOut"
                    onClick={() => {
                      this.setState({
                        panes: [],
                        activeKey: null,
                      });
                      Auth.logOut();
                      this.props.history.push('/login');
                    }}
                  >
                    <Trans>退出登录</Trans>
                  </Menu.Item>
                </SubMenu>
                {/* 语言切换 */}
                <Dropdown overlay={(
                  <Menu onClick={this.handleLanguageChange}>
                    {
                      languages.map((item) => (
                        <Menu.Item key={item.key}>
                          <IconFont type={item.icon} />
                          {item.title}
                        </Menu.Item>
                      ))
                    }
                  </Menu>
                )}
                >
                  <span className="ant-dropdown-link" style={{ float: 'right' }}>
                    <IconFont type={this.getLanguageTitle().icon} />
                    {this.getLanguageTitle().title}
                  </span>
                </Dropdown>
              </div>

            </Menu>
          </Header>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '5px',
          }}
          >
            {/* 标签页 */}
            {/* <Tabs
                            hideAdd
                            onChange={this.onChange}
                            activeKey={this.state.activeKey}
                            type="editable-card"
                            onEdit={this.onEdit}
                            size="small"
                            tabPosition="top"
                            animated={true}
                            >
                            {
                                this.state.panes.map(pane => (
                                    <TabPane
                                    tab={ <span> <IconFont type={pane.icon}/> <Trans>{pane.title}</Trans> </span> }
                                    key={pane.path}
                                    closeIcon={this.isHideCloseIcon(pane)}>
                                    </TabPane>
                                ))
                            }
                        </Tabs> */}
            {/* 下拉按钮 */}
            {/* <Dropdown overlay={
                            <Menu>
                                <Menu.Item onClick={this.closeTabs.bind(this,'all')}>
                                    <Trans>全部关闭</Trans>
                                </Menu.Item>
                                <Menu.Item onClick={this.closeTabs.bind(this,'other')}>
                                    <Trans>关闭其他</Trans>
                                </Menu.Item>
                            </Menu>
                        } placement="bottomCenter">
                            <Button style={{
                                width:'auto',
                                minHeight:36,
                                textAlign:'center'
                            }}> 操作 <DownOutlined /></Button>
                        </Dropdown> */}
          </div>
          {/* 内容区域 */}
          <Content
            style={{
              backgroundColor: '#FFF',
              margin: '5px 6px',
              height: '100%',
              overflowY: 'auto',
            }}
          >
            {/* 这里表示加载子组件 */}
            {this.props.children}
          </Content>
          {/* 底部 */}
          <Footer style={{ textAlign: 'center' }}>
            <Trans>宜家有限公司</Trans>
            {' '}
            ©2020 Created by WSHH
          </Footer>
        </Layout>
      </Layout>
    );
  }
}

export default Layouts;
