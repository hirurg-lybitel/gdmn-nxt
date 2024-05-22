import { IMenuItem } from '.';
import EmailIcon from '@mui/icons-material/Email';

export const marketing: IMenuItem = {
  id: 'marketing',
  title: 'Маркетинг',
  type: 'group',
  children: [
    {
      id: 'templates',
      title: 'Шаблоны',
      type: 'item',
      url: 'marketing/templates',
      icon: <EmailIcon color="secondary" />
    }
  ]
};
