import React from 'react';
import analytics from './analytics';
import dashboard from './dashboard';
import managment from './managment';
import preferences from './preferences';
import { systemMenu } from './system';
import { ActionMethod, Permissions } from '@gsbelarus/util-api-types';
import marketing from './marketing';
import tickets from './tickets';
import ticketSystem from './ticketSystem';

type IType = 'group' | 'collapse' | 'item';
export interface IMenuItem {
  id: string;
  title?: string;
  url?: string;
  type: IType;
  icon?: React.ReactElement;
  selectedIcon?: React.ReactElement;
  children?: IMenuItem[];
  checkAction?: number;
  actionCheck?: {
    name: keyof Permissions;
    method: ActionMethod;
  };
}

const menuItems = {
  items: [
    dashboard,
    managment,
    marketing,
    analytics,
    ticketSystem,
    preferences,
  ].concat(process.env.NODE_ENV === 'development' ? systemMenu : [])
};

export default menuItems;
