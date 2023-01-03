import HomeIcon from '@mui/icons-material/Home';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
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
      url: 'dashboard/overview',
      icon: <HomeIcon color="secondary" />
    },
    {
      id: 'analytics',
      title: 'Аналитика',
      type: 'item',
      url: 'dashboard/analytics',
      icon: <LeaderboardRoundedIcon color="secondary" />
    },
    // {
    //   id: 'map',
    //   title: 'Карта',
    //   type: 'item',
    //   url: 'dashboard/map',
    //   icon: <MapIcon color="secondary" />
    // },
  ]
};

export default dashboard;
