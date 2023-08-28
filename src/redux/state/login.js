/* eslint-disable array-callback-return */
import { adminRoutes } from '@/routes';
import Auth from '@/utils/auth';
import { ROUTE_LOCALISTL_NAME } from '@/config';


export const initRoutes = () => {
  const menuLists = Auth.getLocalCache(ROUTE_LOCALISTL_NAME);
  if (!menuLists) {
    return [];
  }
  // eslint-disable-next-line consistent-return
  return adminRoutes && adminRoutes.filter((v) => {
    const menuList = menuLists.find((item) => item.title === v.title);
    if (menuList) {
      return true;
    }
    return false;
  });
};

const state = {
  defaultRoutes: initRoutes(),
};

export default state;
