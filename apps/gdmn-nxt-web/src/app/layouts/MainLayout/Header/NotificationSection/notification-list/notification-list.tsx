import styles from './notification-list.module.less';
import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemSecondaryAction, ListItemText, Stack, Typography } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import CloseIcon from '@mui/icons-material/Close';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IMessage, NotificationAction } from '@gdmn-nxt/socket';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from 'apps/gdmn-nxt-web/src/app/store';
import { UserState } from 'apps/gdmn-nxt-web/src/app/features/user/userSlice';
import { useGetKanbanDealsQuery } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanApi';
import { ColorMode } from '@gsbelarus/util-api-types';

/* eslint-disable-next-line */
export interface NotificationListProps {
  messages: IMessage[];
  onDelete?: (arg: number) => void;
  onClick?: (action?: NotificationAction, actionContent?: string) => void;
};

export function NotificationList(props: NotificationListProps) {
  const { messages } = props;
  const { onClick, onDelete } = props;

  const colorMode = useSelector((state: RootState) => state.settings.customization.colorMode);
  const colorModeIsLight = useMemo(() => colorMode === ColorMode.Light, [colorMode]);

  const handleDelete = (id: number) => (e: any) => {
    const newMessages = [...messages];
    newMessages.splice(id, 1);

    onDelete && onDelete(id);
  };

  const handleOnClick = useCallback((message: IMessage) => () => {
    onClick && onClick(message.action, message.actionContent);
  }, [onClick]);

  return (
    <List
      disablePadding
      sx={{
        '.close-action': {
          display: 'none'
        },
        '.MuiListItem-container:hover .close-action': {
          display: 'inline',
        },
        '.MuiListItem-container:hover .datetime': {
          display: 'none',
        },
      }}>
      {messages.length
        ? messages.map((message, index) =>
          <ListItem
            key={message?.id}
            divider
            onClick={handleOnClick(message)}
            button
            className={styles['list-item']}
            // sx={{
            //   '.list-item:hover .actions': {
            //     backgroundColor: 'blue !important',
            //   }
            // }}
          >
            <ListItemIcon
              className={styles['list-item-icon']}
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
                {/* <Typography
                  variant="caption"
                  color="GrayText"
                >
                  {new Date(message?.date || 0).toLocaleString('default', {
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography> */}
              </Stack>
            </ListItemText>
            <ListItemSecondaryAction style={{ top: '25px' }}>
              <div className="close-action">
                <IconButton onClick={handleDelete(message.id)} >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
              <div className="datetime">
                <Typography
                  variant="caption"
                  color={colorModeIsLight ? 'GrayText' : 'lightgray'}
                >
                  {new Date(message?.date || 0).toLocaleString('default', {
                    month: 'short',
                    day: '2-digit',
                    ...((new Date(message?.date).getHours() !== 0) && { hour: '2-digit', minute: '2-digit' })
                  })}
                </Typography>
              </div>

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
