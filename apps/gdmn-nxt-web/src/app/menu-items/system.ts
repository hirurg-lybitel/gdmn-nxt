import { IMenuItem } from '.';

export const systemMenu: IMenuItem = {
  id: 'platform',
  title: 'Экспериментальное',
  type: 'group',
  children: [
    {
      id: 'er-model-domains',
      title: 'Domains',
      type: 'item',
      url: '/platform/er-model-domains'
    },
    {
      id: 'er-model',
      title: 'Entities',
      type: 'item',
      url: '/platform/er-model'
    },
    {
      id: 'nlp-main',
      title: 'NLP',
      type: 'item',
      url: '/platform/nlp-main'
    },
    {
      id: 'sql-eitor',
      title: 'SQL editor',
      type: 'item',
      url: '/platform/sql-editor'
    }
  ]
};
