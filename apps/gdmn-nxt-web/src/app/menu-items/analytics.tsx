import SummarizeIcon from '@mui/icons-material/Summarize';
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
          url: '/reports/reconciliation',
          type: 'item',
        }
      ]
    }
  ]
}

export default analytics;
