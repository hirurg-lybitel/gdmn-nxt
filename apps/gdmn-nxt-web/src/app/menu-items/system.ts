import { IMenuItem } from '.';

export const systemMenu: IMenuItem = {
  id: 'system',
  title: 'Система',
  type: 'group',
  children: [
    {
      id: 'er-model-domains',
      title: 'Domains',
      type: 'item',
      url: 'system/er-model-domains'
    },
    {
      id: 'er-model',
      title: 'Entities',
      type: 'item',
      url: 'system/er-model'
    }
  ]
};
