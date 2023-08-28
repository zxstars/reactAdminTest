/*
 * @Description: Description
 * @Author: Kun Yang
 * @Date: 2021-08-05 16:19:50
 * @LastEditors: Kun Yang
 * @LastEditTime: 2021-08-05 20:03:46
 */
import {
  useState, useEffect, useRef, useCallback,
} from 'react';


export const useThrottle = (fn, delay, dep = []) => {
  const { current } = useRef({ fn, timer: null });
  useEffect(() => {
    current.fn = fn;
  }, [fn]);

  return useCallback(function f(...args) {
    if (!current.timer) {
      current.timer = setTimeout(() => {
        delete current.timer;
      }, delay);
      current.fn.call(this, ...args);
    }
  }, dep);
};

/**
 * @description 防抖函数
 * @param {*} value
 * @param {*number} delay 执行周期 ms
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 每次在value变化以后，设置一个定时器
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    // 每次在上一个useEffect处理完以后再运行
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};

