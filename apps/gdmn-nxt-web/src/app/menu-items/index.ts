import React from 'react';
import analytics from './analytics';
import dashboard from './dashboard';
import managment from './managment';
import { systemMenu } from './system';

type IType = 'group' | 'collapse' | 'item'
export interface IMenuItem {
  id: string;
  title?: string;
  url?: string;
  type: IType;
  icon?: React.ReactElement;
  children?: IMenuItem[];
  checkAction?: number;
}

// TODO доделать systemMenu или убрать вовсе
const menuItems = {
  items: [dashboard, managment, analytics].concat(process.env.NODE_ENV === 'development' ? systemMenu : [])
};

export default menuItems;
