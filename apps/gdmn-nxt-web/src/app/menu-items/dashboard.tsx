import HomeIcon from '@mui/icons-material/Home';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import MapIcon from '@mui/icons-material/Map';
import { IMenuItem } from '.';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';

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
      icon: <HomeOutlinedIcon color="secondary" />,
      selectedIcon: <HomeIcon color="secondary" />,
    },
    {
      id: 'analytics',
      title: 'Аналитика',
      type: 'item',
      url: 'dashboard/analytics',
      icon: <LeaderboardOutlinedIcon color="secondary" />,
      selectedIcon: <LeaderboardRoundedIcon color="secondary" />,
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
