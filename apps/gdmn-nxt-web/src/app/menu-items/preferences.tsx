import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Settings from '@mui/icons-material/Settings';
import { IMenuItem } from '.';

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
  ]
};

export default preferences;
