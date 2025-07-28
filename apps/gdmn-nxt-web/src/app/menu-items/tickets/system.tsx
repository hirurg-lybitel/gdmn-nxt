import Settings from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { IMenuItem } from '.';

const system: IMenuItem = {
  id: 'system',
  title: 'Система',
  type: 'group',
  children: [
    {
      id: 'settings',
      title: 'Настройки',
      type: 'item',
      url: 'settings',
      icon: <SettingsOutlinedIcon color="secondary" />,
      selectedIcon: <Settings color="secondary" />,
    }
  ]
};

export default system;
