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
      id: 'deals',
      title: 'Сделки',
      type: 'item',
      url: 'managment/deals',
      icon: <WorkIcon color="secondary" />
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
    // {
    //   id: 'permissions',
    //   title: 'Настройка прав',
    //   type: 'collapse',
    //   checkAction: 8,
    //   icon: <AdminPanelSettingsIcon color="secondary" />,
    //   children: [
    //     {
    //       id: 'permissions-view',
    //       title: 'Действия',
    //       type: 'item',
    //       url: 'permissions/list'
    //     },
    //     {
    //       id: 'permissions-usergroups',
    //       title: 'Группы пользователей',
    //       type: 'item',
    //       url: 'permissions/usergroups'
    //     }
    //   ]
    // }
  ]
};

export default managment;
