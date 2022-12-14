import styles from './notification-list.module.less';
import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Stack, Typography } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { IMessage } from '@gdmn-nxt/socket';
import ReactMarkdown from 'react-markdown';

/* eslint-disable-next-line */
export interface NotificationListProps {
  messages: IMessage[];
  onDelete?: (arg: number) => void;
};

export function NotificationList(props: NotificationListProps) {
  const { messages } = props;
  const { onDelete } = props;

  const handleDelete = (id: number) => () => {
    const newMessages = [...messages];
    newMessages.splice(id, 1);

    onDelete && onDelete(id);
  };

  return (
    <List disablePadding>
      {messages.length
        ? messages.map((message, index) =>
          <ListItem
            key={message?.id}
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
                <Typography variant="h4">{message?.title}</Typography>
                <Typography variant="body1" component="div">
                  <ReactMarkdown className={styles['markdown']}>
                    {message?.text || ''}
                  </ReactMarkdown>
                </Typography>
                {/* <Typography variant="body1">{message?.text}</Typography> */}
                <Typography
                  variant="caption"
                  color="GrayText"
                >
                  {new Date(message?.date || 0).toLocaleString('default', {
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Stack>
            </ListItemText>
            <ListItemSecondaryAction style={{ top: '25px' }}>
              <IconButton onClick={handleDelete(message.id)}>
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
