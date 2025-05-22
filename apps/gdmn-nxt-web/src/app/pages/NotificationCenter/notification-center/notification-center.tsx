import { Box, CardContent, CardHeader, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import styles from './notification-center.module.less';
import { ReactNode, useState } from 'react';
import SendMessage from '../send-message/send-message';
import ViewUserNotifications from '../view-user-notifications/view-user-notifications';
import NotificationsSettings from '../notifications-settings/notifications-settings';
import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import { Permissions } from '@gsbelarus/util-api-types';
import { Navigate } from 'react-router-dom';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{
        flex: 1,
      }}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 1, px: 0, pb: 0, height: '100%', display: 'flex' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/* eslint-disable-next-line */
export interface NotificationCenterProps {}

export function NotificationCenter(props: NotificationCenterProps) {
  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const [tabIndex, setTabIndex] = useState(0);

  if (!userPermissions?.notifications?.forGroup) {
    return <Navigate to="/" />;
  };

  const handleTabsChange = (event: any, newindex: number) => {
    setTabIndex(newindex);
  };

  return (
    <CustomizedCard
      className={styles['main-card']}
    >
      <CustomCardHeader title={'Центр уведомлений'} />
      <Divider />
      <CardContent
        className={styles.content}
      >
        <Box sx={{ flex: 1, flexDirection: 'column', display: 'flex', minWidth: 0 }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabsChange}
          >
            <Tab label="Управление" />
            <Tab label="Настройки" />
          </Tabs>
          <CustomTabPanel value={tabIndex} index={0}>
            <Stack
              spacing={3}
              direction={{ md: 'column', lg: 'row' }}
              flex={1}
              minWidth={0}
            >
              <SendMessage />
              <ViewUserNotifications />
            </Stack>
          </CustomTabPanel>
          <CustomTabPanel value={tabIndex} index={1}>
            <NotificationsSettings />
          </CustomTabPanel>
        </Box>
      </CardContent>
    </CustomizedCard>
  );
}

export default NotificationCenter;

