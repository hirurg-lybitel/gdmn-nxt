import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Settings from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import { IMenuItem } from '.';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditNotificationsIcon from '@mui/icons-material/EditNotifications';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

const preferences: IMenuItem = {
  id: 'preferences',
  title: 'Система',
  type: 'group',
  children: [
    {
      id: 'account',
      title: 'Аккаунт',
      type: 'item',
      url: 'preferences/account',
      icon: <AccountCircleIcon color="secondary" />
    },
    {
      id: 'settings',
      title: 'Настройки',
      type: 'item',
      url: 'preferences/settings',
      icon: <Settings color="secondary" />
    },
    {
      id: 'permissions',
      title: 'Настройка прав',
      type: 'collapse',
      url: 'preferences/permissions',
      actionCheck: {
        name: 'permissions',
        method: 'forGroup'
      },
      icon: <AdminPanelSettingsIcon color="secondary" />,
      children: [
        {
          id: 'permissions-view',
          title: 'Действия',
          type: 'item',
          url: 'preferences/permissions/list',
          actionCheck: {
            name: 'permissions',
            method: 'forGroup'
          },
        },
        {
          id: 'permissions-usergroups',
          title: 'Группы пользователей',
          type: 'item',
          url: 'preferences/permissions/usergroups',
          actionCheck: {
            name: 'permissions',
            method: 'forGroup'
          },
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Центр уведомлений',
      type: 'item',
      actionCheck: {
        name: 'notifications',
        method: 'forGroup'
      },
      url: 'preferences/notifications',
      icon: <EditNotificationsIcon color="secondary" />
    },
    {
      id: 'faq',
      title: 'База знаний',
      type: 'item',
      url: 'preferences/faq',
      icon: <HelpIcon color="secondary" />
    },
    {
      id: 'updates-history',
      title: 'История обновлений',
      type: 'item',
      url: 'preferences/updates-history',
      icon: <TipsAndUpdatesIcon color="secondary" />
    },
  ]
};

export default preferences;
