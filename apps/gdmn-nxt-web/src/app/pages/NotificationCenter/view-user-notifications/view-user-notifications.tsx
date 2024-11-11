import { ClientToServerEvents, IMessage, ServerToClientEvents, getSocketClient, socketClient } from '@gdmn-nxt/socket';
import { Autocomplete, Box, Stack, TextField } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import NotificationList from '../../../layouts/MainLayout/Header/NotificationSection/notification-list/notification-list';
import styles from './view-user-notifications.module.less';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useGetUsersQuery } from '../../../features/systemUsers';
import { IUser } from '@gsbelarus/util-api-types';
import CustomNoData from '../../../components/Styled/Icons/CustomNoData';
import { Socket } from 'socket.io-client';
import CustomizedScrollBox from '../../../components/Styled/customized-scroll-box/customized-scroll-box';
import UserSelect from '@gdmn-nxt/components/user-select';

/* eslint-disable-next-line */
export interface ViewUserNotificationsProps {}

export function ViewUserNotifications(props: ViewUserNotificationsProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const { data: users = [], isFetching: usersIsFetching } = useGetUsersQuery();
  const [socketClient, setsocketClient] = useState<Socket<ServerToClientEvents, ClientToServerEvents>>();

  const handleUserChange = useCallback((e: any, value: IUser | IUser[] | null) => {
    setSelectedUser(value as IUser);
  }, []);

  useEffect(() => {
    const socket = getSocketClient('notifications');
    setsocketClient(socket);
  }, []);

  useEffect(() => {
    socketClient?.emit('messagesByUser_request', selectedUser?.ID || -1);
  }, [socketClient, selectedUser]);

  const sendRequest = useCallback(() => socketClient?.emit('messagesByUser_request', selectedUser?.ID || -1), [selectedUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      sendRequest();
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [selectedUser]);

  useEffect(() => {
    socketClient?.on('messagesByUser_response', (data: IMessage[]) => {
      setMessages(data);
    });

    return () => {
      socketClient?.removeListener('messagesByUser_response');
    };
  }, [socketClient]);

  const memoUserSelect = useMemo(() => (
    <UserSelect
      value={undefined}
      onChange={handleUserChange}
      label="Пользователь"
      placeholder="Выберите пользователя"
    />
  ), [handleUserChange]);

  return (
    <CustomizedCard
      className={styles['item-card']}
      boxShadows

    >
      <Stack
        direction="column"
        spacing={2}
        flex={1}
        display="flex"
      >
        {memoUserSelect}
        <Box
          flex={1}
        >
          {messages.length === 0
            ? <Box style={{ alignSelf: 'center' }}>
              <CustomNoData />
            </Box>
            : <CustomizedScrollBox>
              <NotificationList messages={messages} />
            </CustomizedScrollBox>}
        </Box>
      </Stack>
    </CustomizedCard>
  );
}

export default ViewUserNotifications;
