import HomeIcon from '@mui/icons-material/Home';
import { IMenuItem } from '.';

const dashboard: IMenuItem = {
  id: 'dashboard',
  title: 'Общее',
  type: 'group',
  children: [
    {
      id: 'overview',
      title: 'Обзор',
      type: 'item',
      url: '/dashboard',
      icon: <HomeIcon color="secondary" />
    }
  ]
}

export default dashboard;
