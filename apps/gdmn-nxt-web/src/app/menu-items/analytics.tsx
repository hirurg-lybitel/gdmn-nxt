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
      url: 'analytics/reports',
      icon: <SummarizeIcon color="secondary" />,
      children: [
        {
          id: 'reconciliation',
          title: 'Акт сверки',
          url: 'analytics/reports/reconciliation',
          type: 'item',
        },
        {
          id: 'remainbyinvoices',
          title: 'Остатки по р/с',
          url: 'analytics/reports/remainbyinvoices',
          type: 'item',
        },
        {
          id: 'topEarning',
          title: 'ТОП по выручке',
          url: 'analytics/reports/topEarning',
          type: 'item',
        }
      ]
    },
    {
      id: 'salesfunnel',
      title: 'Продажи',
      type: 'item',
      url: 'analytics/salesfunnel',
      icon: <FilterAltIcon color="secondary" />
    }
  ]
};

export default analytics;
