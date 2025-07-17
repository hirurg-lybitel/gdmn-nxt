import Settings from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { IMenuItem } from '..';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';

const common: IMenuItem = {
  id: 'common',
  title: 'Общее',
  type: 'group',
  children: [
    {
      id: 'tickets',
      title: 'Тикеты',
      type: 'item',
      url: 'list',
      icon: <AssignmentOutlinedIcon color="secondary" />,
      selectedIcon: <AssignmentIcon color="secondary" />,
    }
  ]
};

export default common;
