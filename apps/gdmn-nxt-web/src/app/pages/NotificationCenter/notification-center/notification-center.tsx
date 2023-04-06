import { Box, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import styles from './notification-center.module.less';
import { useState } from 'react';
import SendMessage from '../send-message/send-message';
import ViewUserNotifications from '../view-user-notifications/view-user-notifications';
import NotificationsSettings from '../notifications-settings/notifications-settings';

/* eslint-disable-next-line */
export interface NotificationCenterProps {}

export function NotificationCenter(props: NotificationCenterProps) {
  return (
    <CustomizedCard
      borders
      style={{
        flex: 1,
        flexDirection: 'column',
        display: 'flex',
      }}
    >
      <CardHeader style={{ paddingBottom:'15px',paddingTop:'15px'}} title={<Typography variant="h3">Центр уведомлений</Typography>} />
      <Divider />
      <CardContent
        style={{
          flex: 1,
          display: 'flex',
          padding: '40px',
        }}
      >
        <Stack direction="row" spacing={5} flex={1}>
          <Stack spacing={5}>
            <NotificationsSettings />
            <SendMessage />
          </Stack>
          <Box flex={1}>
            <ViewUserNotifications />
          </Box>
        </Stack>
      </CardContent>
    </CustomizedCard>
  );
}

export default NotificationCenter;

