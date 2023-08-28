import { Link } from 'react-router-dom';
import styles from './index.module.scss';
/* eslint-disable func-names */
export default function ({ title, tip }) {
  return (
    <div style={{ width: '100%' }}>
      <div className={styles.Container}>
        <div className={styles.RowContainer}>
          <span className={styles.titleLink}>{title}</span>
          <h2 className={styles.titleTip}>{tip}</h2>
        </div>
      </div>
      <div className={styles.RowContainer}>
        <Link to="/">
          <span>返回首页</span>
        </Link>
      </div>
    </div>
  );
}
