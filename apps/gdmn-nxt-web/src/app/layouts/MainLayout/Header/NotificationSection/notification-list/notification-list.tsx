import './notification-list.module.less';
import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Stack, Typography } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

/* eslint-disable-next-line */
export interface NotificationListProps {}

export interface IMessage {
  id: number;
  date: Date;
  title: string;
  text: string;
};

const mes: IMessage[] = [
  {
    id: 1,
    date: new Date('2022-02-17T03:24:00'),
    title: 'Новые возможности!',
    text: 'Управление сделками через удобную рабочую доску'
  },
  {
    id: 2,
    date: new Date('2022-02-10T14:14:00'),
    title: 'Напоминание',
    text: 'Позвонить клиенту СБУ'
  },
  {
    id: 3,
    date: new Date('2022-02-07T19:33:00'),
    title: 'От администратора',
    text: 'Технологические работы с 13:00 по 14:00. Портал будет недоступен'
  },
  {
    id: 4,
    date: new Date('2022-02-02T10:03:00'),
    title: 'Напоминание',
    text: 'Отослать контракт ООО"Чебурашка"'
  },
  {
    id: 5,
    date: new Date('2022-01-17T13:24:00'),
    title: 'Напоминание',
    text: 'Пора поесть'
  },
  {
    id: 6,
    date: new Date('2022-01-11T16:43:00'),
    title: 'Сообщение',
    text: 'Кто забыл кружку на кухне?'
  },
];

export function NotificationList(props: NotificationListProps) {
  const [messages, setMessages] = useState<IMessage[]>(mes);

  const handleDelete = (index: number) => {
    const newMessages = [...messages];
    newMessages.splice(index, 1);

    setMessages(newMessages);
  };

  return (
    <List disablePadding>
      {messages.length
        ? messages.map((message, index) =>
          <ListItem
            key={message.id}
            button
            divider
          >
            <ListItemIcon
              style={{
                alignItems: 'center'
              }}
            >
              <MessageIcon />
            </ListItemIcon>
            <ListItemText>
              <Stack direction="column" spacing={1}>
                <Typography variant="h4">{message.title}</Typography>
                <Typography variant="body1">{message.text}</Typography>
                <Typography
                  variant="caption"
                  color="GrayText"
                >
                  {message.date.toLocaleString('default', {
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Stack>
            </ListItemText>
            <ListItemSecondaryAction style={{ top: '25px' }}>
              <IconButton onClick={() => handleDelete(index)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        )
        : <ListItem>
          <ListItemText>
            <Typography variant="body1">Нет уведомлений</Typography>
          </ListItemText>
        </ListItem>}
    </List>
  );
}

export default NotificationList;
