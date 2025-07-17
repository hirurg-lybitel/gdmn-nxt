import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Settings from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpIcon from '@mui/icons-material/Help';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { IMenuItem } from '.';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import EditNotificationsIcon from '@mui/icons-material/EditNotifications';
import EditNotificationsOutlinedIcon from '@mui/icons-material/EditNotificationsOutlined';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';


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
