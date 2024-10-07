import './notification.module.less';
import {
  Badge,
  Box,
  ClickAwayListener,
  Divider,
  Fade,
  IconButton,
  Paper,
  Popper,
  Stack,
  Theme,
  Tooltip,
  Typography
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import { makeStyles } from '@mui/styles';
import { useCallback, useEffect, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import NotificationList from '../notification-list/notification-list';
import { ClientToServerEvents, IMessage, NotificationAction, ServerToClientEvents, clearSocket, setSocketClient } from '@gdmn-nxt/socket';
import logo from './NoNotifications.png';
import { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'apps/gdmn-nxt-web/src/app/store';
import { saveFilterData } from 'apps/gdmn-nxt-web/src/app/store/filtersSlice';
import { useGetFiltersDeadlineQuery } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanFiltersApi';
import { config } from '@gdmn-nxt/config';
import addNotification from 'react-push-notification';
import { PUSH_NOTIFICATIONS_DURATION } from '@gdmn/constants/client';
import { useGetProfileSettingsQuery } from 'apps/gdmn-nxt-web/src/app/features/profileSettings';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import CustomAddButton from '@gdmn-nxt/components/helpers/custom-add-button';

const useStyles = makeStyles((theme: Theme) => ({
  popper: {
    zIndex: 2000,
  },
  arrow: {
    overflow: 'hidden',
    position: 'absolute',
    width: '1em',
    height: '0.7em',
    boxSizing: 'border-box',
    color: 'var(--color-paper-bg)',
    marginTop: '-0.7em',
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: '100%',
      height: '100%',
      backgroundColor: 'currentColor',
      transform: 'rotate(45deg)',
      transformOrigin: '0 100%',
      border: '1px solid',
      borderColor: 'var(--color-borders) transparent transparent var(--color-borders)',
    }
  },
  mainPaper: {
    marginLeft: 16,
    marginRight: 16,
    width: '20vw',
    minWidth: '400px',
    minHeight: '300px',
    display: 'flex',
  },
  header: {
    padding: '8px 16px'
  },
  badgeFadeIn: {
    animationName: '$fadeIn',
    animationDuration: '1000ms',
  },
  badgeFadeOut: {
    animationName: '$fadeOut',
    animationDuration: '1000ms',
  },
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0
    },
    '100%': {
      opacity: 1,
    }
  },
  '@keyframes fadeOut': {
    '0%': {
      opacity: 1
    },
    '100%': {
      opacity: 0
    }
  }
}));

/* eslint-disable-next-line */
export interface NotificationProps {}

export function Notification(props: NotificationProps) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [anchorProfileEl, setAnchorProfileEl] = useState(null);
  const [arrowRef, setArrowRef] = useState<HTMLElement | null>(null);
  const [socketClient, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents>>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [showedMessages, setShowedMessages] = useState<number[]>([]);
  const [isActivePage, setIsActivePage] = useState<boolean>(true);

  function onBlur() {
    setIsActivePage(false);
  }
  function onFocus() {
    setIsActivePage(true);
  }
  window.onfocus = onFocus;
  window.onblur = onBlur;

  const userId = useSelector<RootState, number>(state => state.user.userProfile?.id ?? -1);
  const { data: settings } = useGetProfileSettingsQuery(userId);

  const sendPushNotification = (title: string, text: string) => {
    addNotification({
      title: title,
      message: text.replaceAll(/\**\#*=*\-*_*~*>*\+*/g, ''),
      native: true,
      duration: PUSH_NOTIFICATIONS_DURATION
    });
  };

  useEffect(() => {
    if (!(settings && ('PUSH_NOTIFICATIONS_ENABLED' in settings))) return;
    if (!settings?.PUSH_NOTIFICATIONS_ENABLED) return;
    if (isActivePage) return;

    const unshowedMessages = messages.filter(item => !showedMessages.some(showed => showed === item.id));
    setShowedMessages(messages.map(item => item.id));

    if (unshowedMessages.length === 0) return;
    if (unshowedMessages.length < 2) {
      return unshowedMessages.forEach(({ title, text }) => sendPushNotification(title, text));
    }
    sendPushNotification(
      'Непросмотренные уведомления',
      `У вас ${messages.length} непросмотренных уведомлений`
    );
  }, [messages, settings]);

  useEffect(() => {
    if (userId <= 0) return;

    const socket = setSocketClient('notifications', {
      url: `https://${config.serverHost}:${config.notificationPort}`,
      userId
    });
    let oldMessages: IMessage[] = [];
    socket.on('messages', (data: IMessage[]) => {
      if (data.toString() === oldMessages.toString()) return;
      oldMessages = data;
      setMessages(data);
    });

    socket && setSocket(socket);

    return () => {
      clearSocket('notifications');
    };
  }, []);

  /** Disable scrolling for main window when notifications are opened */
  const preventDefault = useCallback((e: Event) => e.preventDefault(), []);

  const keys: { [key: string]: number } = { 'ArrowUp': 1, 'ArrowDown': 1 };
  const preventDefaultForScrollKeys = useCallback((e: KeyboardEvent) => {
    if (keys[e.key]) {
      preventDefault(e);
      return false;
    }
    return true;
  }, []);

  const wheelOpt = { passive: false };
  const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
  useEffect(() => {
    if (open) {
      window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
      window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
      window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
      window.addEventListener('keydown', preventDefaultForScrollKeys, false);
    } else {
      window.removeEventListener('DOMMouseScroll', preventDefault, false);
      window.removeEventListener(wheelEvent, preventDefault, false);
      window.removeEventListener('touchmove', preventDefault, false);
      window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    };
    return () => {
      window.removeEventListener('DOMMouseScroll', preventDefault, false);
      window.removeEventListener(wheelEvent, preventDefault, false);
      window.removeEventListener('touchmove', preventDefault, false);
      window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    };
  }, [open]);

  const handleDeleteNotification = (id: number) => {
    socketClient?.emit('delete', id);
    setMessages(prev => {
      const newMessages = [...prev];
      const findIndex = newMessages.findIndex(m => m.id === id);
      newMessages.splice(findIndex, 1);
      return newMessages;
    });
  };

  const deleteAllNotifications = () => {
    socketClient?.emit('deleteAll', userId);
    setMessages([]);
  };

  const handleToogle = (target: any) => {
    setAnchorProfileEl(target);
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const navigate = useNavigate();
  const { data: dealsDateFilter = [] } = useGetFiltersDeadlineQuery();

  const dispatch = useDispatch();

  const handleClickNotification = (action?: NotificationAction, actionContent?: string) => {
    if (!actionContent) return;
    switch (Number(action)) {
      case NotificationAction.JumpToDeal: {
        const newDealsFilters = {
          deadline: [dealsDateFilter.find(f => f.CODE === 6)],
          dealNumber: actionContent
        };

        navigate('managment/deals/list');

        dispatch(saveFilterData({ 'deals': newDealsFilters }));

        break;
      }
      case NotificationAction.JumpToTask: {
        const newTasksFilters = {
          taskNumber: actionContent
        };
        navigate('managment/tasks/list');
        dispatch(saveFilterData({ 'tasks': newTasksFilters }));
        break;
      }
      default:
        break;
    };

    setOpen(false);
  };

  return (
    <Box
      sx={{
        mx: 2
      }}
    >
      <Tooltip title={messages.length > 0 ? 'У вас есть непрочитанные уведомления' : 'У вас нет непрочитанных уведомлений'} arrow>
        <IconButton
          size="large"
          onClick={(event: any) => handleToogle(event.currentTarget)}
        >
          <Badge
            color="error"
            variant="standard"
            badgeContent={messages.length}
          >
            <NotificationsOutlinedIcon color="secondary" />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popper
        className={classes.popper}
        open={open}
        placement="bottom"
        anchorEl={anchorProfileEl}
        transition
        popperOptions={{
          modifiers: [
            {
              name: 'arrow',
              options: {
                enabled: true,
                element: arrowRef
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper className={classes.mainPaper} elevation={15}>
              <ClickAwayListener onClickAway={handleClose}>
                <CustomizedCard borders style={{ flex: 1, display: 'flex' }}>
                  <span className={classes.arrow} ref={setArrowRef} />
                  <Stack direction="column" style={{ maxHeight: '90vh', flex: 1, display: 'flex' }}>
                    <Stack
                      className={classes.header}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Typography variant="subtitle1">
                        Уведомления
                      </Typography>
                      <Box flex={1} />
                      <IconButton
                        color="primary"
                        title="Отметить все как прочитанные"
                        onClick={deleteAllNotifications}
                      >
                        <MarkEmailReadIcon />
                      </IconButton>
                    </Stack>
                    <Divider />
                    {messages.length > 0
                      ? <PerfectScrollbar>
                        <NotificationList
                          messages={messages}
                          onDelete={handleDeleteNotification}
                          onClick={handleClickNotification}
                        />
                      </PerfectScrollbar>
                      : <Stack
                        flex={1}
                        display="flex"
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                        spacing={1}
                      >
                        <img
                          src={logo}
                          alt=""
                          draggable={false}
                          width="150"
                          color="red"
                        />
                        <Typography variant="h6" color={'GrayText'}>Пока нет уведомлений</Typography>
                      </Stack>}
                  </Stack>
                </CustomizedCard>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default Notification;
