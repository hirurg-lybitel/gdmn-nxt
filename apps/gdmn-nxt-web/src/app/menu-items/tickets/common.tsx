import Settings from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { IMenuItem } from '..';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

const common: IMenuItem = {
  id: 'common',
  title: 'Общее',
  type: 'group',
  children: [
    {
      id: 'tickets',
      title: 'Заявки',
      type: 'item',
      url: 'list',
      icon: <AssignmentOutlinedIcon color="secondary" />,
      selectedIcon: <AssignmentIcon color="secondary" />,
    },
    {
      id: 'respondent',
      title: 'Ответственные',
      type: 'item',
      url: 'users',
      icon: <PeopleAltOutlinedIcon color="secondary" />,
      selectedIcon: <PeopleAltIcon color="secondary" />,
      adminOnly: true
    }
  ]
};

export default common;
