import { IMenuItem } from '.';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LabelIcon from '@mui/icons-material/Label';
import WorkIcon from '@mui/icons-material/Work';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';

const managment: IMenuItem = {
  id: 'managment',
  title: 'Управление',
  type: 'group',
  children: [
    {
      id: 'timeTracker',
      title: 'Учёт времени',
      url: 'managment/time-tracker',
      type: 'item',
      icon: <AccessTimeOutlinedIcon color="secondary" />,
      selectedIcon: <AccessTimeFilledIcon color="secondary" />,

    },
    {
      id: 'contacts',
      title: 'Контакты',
      type: 'item',
      icon: <ContactPhoneOutlinedIcon color="secondary" />,
      selectedIcon: <ContactPhoneIcon color="secondary" />,
      url: 'managment/contacts',
      // children: [
      //   {
      //     id: 'contacts',
      //     title: 'Все',
      //     type: 'item',
      //     url: 'managment/contacts',
      //   },
      //   {
      //     id: 'ourContacts',
      //     title: 'Только наши',
      //     type: 'item',
      //     url: 'managment/ourContacts',
      //   },
      // ]
    },
    {
      id: 'dealsGroup',
      title: 'Сделки',
      type: 'collapse',
      icon: <WorkOutlineOutlinedIcon color="secondary" />,
      selectedIcon: <WorkIcon color="secondary" />,
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
      icon: <TaskAltOutlinedIcon color="secondary" />,
      selectedIcon: <TaskAltIcon color="secondary" />,
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
      type: 'item',
      icon: <PeopleAltOutlinedIcon color="secondary" />,
      selectedIcon: <PeopleAltIcon color="secondary" />,
      url: 'managment/customers/list'
    },
    {
      id: 'contracts',
      title: 'Договоры',
      type: 'item',
      icon: <ContentPasteOutlinedIcon color="secondary" />,
      selectedIcon: <ContentPasteIcon color="secondary" />,
      url: 'managment/contracts'
    },
    {
      id: 'labels',
      title: 'Метки',
      type: 'item',
      url: 'managment/labels',
      icon: <LabelOutlinedIcon color="secondary" />,
      selectedIcon: <LabelIcon color="secondary" />,
    },
    {
      id: 'projects',
      title: 'Проекты',
      type: 'item',
      url: 'managment/projects',
      icon: <AccountTreeOutlinedIcon color="secondary" />,
      selectedIcon: <AccountTreeIcon color="secondary" />
    }
  ]
};

export default managment;
