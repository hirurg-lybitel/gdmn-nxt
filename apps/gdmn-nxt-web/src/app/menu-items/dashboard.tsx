import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import MapIcon from '@mui/icons-material/Map';
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
      url: 'dashboard',
      icon: <HomeIcon color="secondary" />
    },
    {
      id: 'deals',
      title: 'Сделки',
      type: 'item',
      url: 'dashboard/deals',
      icon: <WorkIcon color="secondary" />
    },
    {
      id: 'map',
      title: 'Карта',
      type: 'item',
      url: 'dashboard/map',
      icon: <MapIcon color="secondary" />
    },
  ]
};

export default dashboard;
