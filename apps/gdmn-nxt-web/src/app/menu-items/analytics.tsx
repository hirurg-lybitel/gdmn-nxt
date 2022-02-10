import SummarizeIcon from '@mui/icons-material/Summarize';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { IMenuItem } from '.';

const analytics: IMenuItem = {
  id: 'analytics',
  title: 'Аналитика',
  type: 'group',
  children: [
    {
      id: 'reports',
      title: 'Отчёты',
      type: 'collapse',
      icon: <SummarizeIcon color="secondary" />,
      children: [
        {
          id: 'reconciliation',
          title: 'Акт сверки',
          url: 'reports/reconciliation',
          type: 'item',
        }
      ]
    },
    {
      id: 'salesFunnel',
      title: 'Продажи',
      type: 'item',
      url: '/analytics/salesfunnel',
      icon: <FilterAltIcon color="secondary" />
    }
  ]
}

export default analytics;
