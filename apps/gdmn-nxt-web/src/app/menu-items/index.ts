import React from 'react';
import analytics from './analytics';
import dashboard from './dashboard';
import managment from './managment';
import { systemMenu } from './system';

export interface IMenuItem {
  id: string;
  title?: string;
  url?: string;
  type: string;
  icon?: React.ReactElement;
  children?: IMenuItem[];
}

const menuItems = {
  items: [dashboard, managment, analytics, systemMenu]
};

export default menuItems;
