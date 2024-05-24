import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import SegmentIcon from '@mui/icons-material/Segment';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import { IMenuItem } from '.';

const marketing: IMenuItem = {
  id: 'marketing',
  title: 'Маркетинг',
  type: 'group',
  children: [
    // {
    //   id: 'mailing',
    //   title: 'Email рассылка',
    //   type: 'item',
    //   url: 'marketing/mailing',
    //   icon: <ForwardToInboxIcon color="secondary" />
    // },
    // {
    //   id: 'segments',
    //   title: 'Сегменты',
    //   type: 'item',
    //   url: 'marketing/segments',
    //   icon: <SegmentIcon color="secondary" />
    // },
    {
      id: 'templates',
      title: 'Шаблоны',
      type: 'item',
      url: 'marketing/templates',
      icon: <ViewComfyIcon color="secondary" />
    }
  ]
};

export default marketing;
