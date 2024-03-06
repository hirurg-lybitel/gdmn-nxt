import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LabelIcon from '@mui/icons-material/Label';
import WorkIcon from '@mui/icons-material/Work';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import { IMenuItem } from '.';


const managment: IMenuItem = {
  id: 'managment',
  title: 'Управление',
  type: 'group',
  children: [
    {
      id: 'contacts',
      title: 'Контакты',
      type: 'item',
      url: 'managment/contacts',
      icon: <ContactPhoneIcon color="secondary" />,
    },
    {
      id: 'dealsGroup',
      title: 'Сделки',
      type: 'collapse',
      icon: <WorkIcon color="secondary" />,
      children: [
        {
          id: 'deals',
          title: 'Список',
          type: 'item',
          url: 'managment/deals/list',
        },
        {
          id: 'dealSources',
          title: 'Источники заявок',
          type: 'item',
          url: 'managment/deals/dealSources',
        },
        {
          id: 'denyReasons',
          title: 'Причины отказа',
          type: 'item',
          url: 'managment/deals/denyReasons',
        },
      ]
    },
    {
      id: 'tasksGroup',
      title: 'Задачи',
      type: 'collapse',
      icon: <TaskAltIcon color="secondary" />,
      children: [
        {
          id: 'tasks',
          title: 'Список',
          type: 'item',
          url: 'managment/tasks/list',
        },
        {
          id: 'taskTypes',
          title: 'Типы задач',
          type: 'item',
          url: 'managment/tasks/taskTypes',
        },
      ]
    },
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
          url: 'managment/customers/list'
        },
      ]
    },
    {
      id: 'contracts',
      title: 'Договоры',
      type: 'item',
      icon: <ContentPasteIcon color="secondary" />,
      url: 'managment/contracts'
    },
    {
      id: 'labels',
      title: 'Метки',
      type: 'item',
      url: 'managment/labels',
      icon: <LabelIcon color="secondary" />,
    },
  ]
};

export default managment;
