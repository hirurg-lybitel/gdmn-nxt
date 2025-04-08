import SummarizeIcon from '@mui/icons-material/Summarize';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
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
      icon: <SummarizeOutlinedIcon color="secondary" />,
      selectedIcon: <SummarizeIcon color="secondary" />,
      children: [
        {
          id: 'reconciliation',
          title: 'Акт сверки',
          url: 'analytics/reports/reconciliation',
          type: 'item',
          actionCheck: {
            name: 'reports/reconciliation-statement',
            method: 'GET'
          },
        },
        {
          id: 'remainbyinvoices',
          title: 'Остатки по р/с',
          url: 'analytics/reports/remainbyinvoices',
          type: 'item',
          actionCheck: {
            name: 'reports/remains-by-invoices',
            method: 'GET'
          },
        },
        {
          id: 'topEarning',
          title: 'ТОП по выручке',
          url: 'analytics/reports/topEarning',
          type: 'item',
          actionCheck: {
            name: 'reports/topEarning',
            method: 'POST'
          },
        },
        {
          id: 'expectedreceipts',
          title: 'Абоненское',
          url: 'analytics/reports/expectedreceipts',
          type: 'item',
          actionCheck: {
            name: 'reports/expected-receipts',
            method: 'GET'
          },
        },
        {
          id: 'expectedreceiptsdevelopment',
          title: 'Разработка',
          url: 'analytics/reports/expectedreceiptsdev',
          type: 'item',
          actionCheck: {
            name: 'reports/expected-receipts-dev',
            method: 'GET'
          },
        }, {
          id: 'expenses',
          title: 'Расходы',
          url: 'analytics/reports/expenses',
          type: 'item',
          actionCheck: {
            name: 'reports/expenses',
            method: 'GET'
          },
        }, {
          id: 'debts',
          title: 'Задолжности',
          url: 'analytics/reports/debts',
          type: 'item',
          actionCheck: {
            name: 'reports/debts',
            method: 'GET'
          },
        },
      ]
    },
    {
      id: 'salesfunnel',
      title: 'Продажи',
      type: 'item',
      url: 'analytics/salesfunnel',
      icon: <FilterAltOutlinedIcon color="secondary" />,
      selectedIcon: <FilterAltIcon color="secondary" />,
    }
  ]
};

export default analytics;
