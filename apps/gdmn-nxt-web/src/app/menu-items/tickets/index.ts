import React from 'react';
import { ActionMethod, Permissions } from '@gsbelarus/util-api-types';
import common from './common';
import system from './system';

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

const ticketsMenuItems = {
  items: [
    common,
    system
  ]
};

export default ticketsMenuItems;
