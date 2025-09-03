import { IMenuItem } from '.';
import Settings from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import LabelIcon from '@mui/icons-material/Label';

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
      actionCheck: {
        name: 'ticketSystem/tickets',
        method: 'GET'
      }
    },
    {
      id: 'customers',
      title: 'Клиенты',
      type: 'item',
      icon: <PeopleAltOutlinedIcon color="secondary" />,
      selectedIcon: <PeopleAltIcon color="secondary" />,
      url: 'tickets/customers',
      actionCheck: {
        name: 'contacts/tickets',
        method: 'POST'
      }
    },
    {
      id: 'labels',
      title: 'Метки тикетов',
      type: 'item',
      url: 'tickets/labels',
      icon: <LabelOutlinedIcon color="secondary" />,
      selectedIcon: <LabelIcon color="secondary" />,
    }
  ]
};

export default ticketSystem;
