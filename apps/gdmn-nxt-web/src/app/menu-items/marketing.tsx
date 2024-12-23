import { IMenuItem } from '.';
import SegmentIcon from '@mui/icons-material/Segment';
import SegmentOutlinedIcon from '@mui/icons-material/SegmentOutlined';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import ViewComfyOutlinedIcon from '@mui/icons-material/ViewComfyOutlined';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';

const marketing: IMenuItem = {
  id: 'marketing',
  title: 'Маркетинг',
  type: 'group',
  children: [
    {
      id: 'mailing',
      title: 'Email рассылка',
      type: 'item',
      url: 'marketing/mailing',
      icon: <MarkEmailReadOutlinedIcon color="secondary" />,
      selectedIcon: <MarkEmailReadIcon color="secondary" />,
    },
    {
      id: 'segments',
      title: 'Сегменты',
      type: 'item',
      url: 'marketing/segments',
      icon: <SegmentOutlinedIcon color="secondary" />,
      selectedIcon: <SegmentIcon color="secondary" />
    },
    {
      id: 'templates',
      title: 'Шаблоны',
      type: 'item',
      url: 'marketing/templates',
      icon: <ViewComfyOutlinedIcon color="secondary" />,
      selectedIcon: <ViewComfyIcon color="secondary" />
    }
  ]
};

export default marketing;
