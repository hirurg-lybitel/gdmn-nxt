import Settings from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { IMenuItem } from '.';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';

const representative: IMenuItem = {
  id: 'common',
  title: 'Общее',
  type: 'group',
  children: [
    {
      id: 'tickets',
      title: 'Тикеты',
      type: 'item',
      url: 'tickets',
      icon: <AssignmentOutlinedIcon color="secondary" />,
      selectedIcon: <AssignmentIcon color="secondary" />,
    },
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

export default representative;
