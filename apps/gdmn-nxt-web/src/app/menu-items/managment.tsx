import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { IMenuItem } from '.';

const managment: IMenuItem = {
  id: 'managment',
  title: 'Управление',
  type: 'group',
  children: [
    {
      id: 'customers',
      title: 'Клиенты',
      type: 'collapse',
      icon: <PeopleAltIcon color="secondary" />,
      children: [
        {
          id: 'customers-list',
          title: 'Список клиентов',
          type: 'item',
          url: 'customers/list'
        },
        // {
        //   id: 'customers-orders-list',
        //   title: 'Список заказов',
        //   type: 'item',
        //   url: 'customers/orders/list'
        // }
      ]
    }
  ]
}

export default managment;
