import { IMenuItem } from '.';

export const systemMenu: IMenuItem = {
  id: 'system',
  title: 'Система',
  type: 'group',
  children: [
    {
      id: 'er-model',
      title: 'ER Model',
      type: 'item',
      url: 'system/er-model'
    }
  ]
};
