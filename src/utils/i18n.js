/*
 * @Author: your name
 * @Date: 2021-07-21 13:54:16
 * @LastEditTime: 2021-08-28 18:10:20
 * @LastEditors: Kun Yang
 * @Description: In User Settings Edit
 * @FilePath: \besta-admin-web\src\utils\i18n.js
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCommon from '@/locales/zh/common';
import zhLeftMenu from '@/locales/zh/left_menu';
import enCommon from '@/locales/en/common';
import enLeftMenu from '@/locales/en/left_menu';

const resources = {
  zh: {
    translation: {
      ...zhCommon, // 公共部分
      ...zhLeftMenu, // 左侧菜单栏
    },
  },
  en: {
    translation: {
      ...enCommon, // 公共部分
      ...enLeftMenu, // 左侧菜单栏
    },
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'zh', // 默认初始化语言
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
