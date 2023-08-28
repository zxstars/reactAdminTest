import React from 'react';
import ErrorExample from './ErrorExample';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  // componentDidCatch(error, errorInfo) {
  //   // 你同样可以将错误日志上报给服务器
  //   // logErrorToMyService(error, errorInfo);
  // }
  render() {
    const { children } = this.props;
    const { hasError } = this.state;
    if (hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return <ErrorExample title="error" tip="糟糕，页面出错了！" />;
    }

    return children;
  }
}

export default ErrorBoundary;
