import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LabelIcon from '@mui/icons-material/Label';
import WorkIcon from '@mui/icons-material/Work';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { IMenuItem } from '.';


const managment: IMenuItem = {
  id: 'managment',
  title: 'Управление',
  type: 'group',
  children: [
    {
      id: 'dealsGroup',
      title: 'Сделки',
      type: 'collapse',
      icon: <WorkIcon color="secondary" />,
      children: [
        {
          id: 'deals',
          title: 'Список',
          type: 'item',
          url: 'managment/deals/list',
        },
        {
          id: 'dealSources',
          title: 'Источники заявок',
          type: 'item',
          url: 'managment/deals/dealSources',
        },
      ]
    },
    {
      id: 'customers',
      title: 'Клиенты',
      type: 'collapse',
      icon: <PeopleAltIcon color="secondary" />,
      children: [
        {
          id: 'customers-list',
          title: 'Список клиентов',
          type: 'item',
          url: 'managment/customers/list'
        },
      ]
    },
    {
      id: 'labels',
      title: 'Метки',
      type: 'item',
      url: 'managment/labels',
      icon: <LabelIcon color="secondary" />,
    },
  ]
};

export default managment;
