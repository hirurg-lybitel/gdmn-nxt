import Settings from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { IMenuItem } from '.';


const ticketSystem: IMenuItem = {
  id: 'ticket system',
  title: 'Тикет система',
  type: 'group',
  children: [
    {
      id: 'tickets',
      title: 'Тикеты',
      type: 'item',
      url: 'tickets/list',
      icon: <SettingsOutlinedIcon color="secondary" />,
      selectedIcon: <Settings color="secondary" />,
    },
  ]
};

export default ticketSystem;
