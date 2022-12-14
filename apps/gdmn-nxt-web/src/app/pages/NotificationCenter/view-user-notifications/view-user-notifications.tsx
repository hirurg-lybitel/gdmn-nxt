import { IMessage } from '@gdmn-nxt/socket';
import { Autocomplete, Box, Stack, TextField } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import NotificationList from '../../../layouts/MainLayout/Header/NotificationSection/notification-list/notification-list';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import styles from './view-user-notifications.module.less';

/* eslint-disable-next-line */
export interface ViewUserNotificationsProps {}

const messages: IMessage[] = [
  {
      "id": 358026878,
      "date": new Date(1669934580452),
      "title": "Напоминание",
      "text": "Сделка №8 **испытания** просрочена на **121 дней**"
  },
  {
      "id": 358026881,
      "date": new Date(1669934580452),
      "title": "Напоминание",
      "text": "Сделка №19 **испытания** просрочена на **121 дней**"
  },
  {
      "id": 358026879,
      "date": new Date(1669934580452),
      "title": "Напоминание",
      "text": "Сделка №9 **звонок на р ТУ пища** просрочена на **15 дней**"
  },
  {
      "id": 358026880,
      "date": new Date(1669934580452),
      "title": "Напоминание",
      "text": "Сделка №14 **звонок на р ТУ пища** просрочена на **15 дней**"
  },
  {
      "id": 358026876,
      "date": new Date(1669742522095),
      "title": "Напоминание",
      "text": "Задача **перезвонить** по сделке **task3** просрочена на **113 дней**"
  },
  {
      "id": 358026877,
      "date": new Date(1669742522095),
      "title": "Напоминание",
      "text": "Задача **позвонить клиенту** по сделке **task3** просрочена на **122 дней**"
  }
];

export function ViewUserNotifications(props: ViewUserNotificationsProps) {
  return (
    <CustomizedCard
      className={styles['item-card']}
      borders
      boxShadows
    >
      <Stack direction="column" spacing={2} flex={1}>
      <Autocomplete
        options={[]}
        fullWidth
        renderInput={(params) => (
          <TextField
            {...params}
            label="Пользователь"
            placeholder="Выберите пользователя"
          />
        )}
      />
      <Box style={{
        height: 'calc(100vh - 410px)',
        minHeight: '430px',
        }}>
        <PerfectScrollbar>
          <NotificationList messages={messages} />
        </PerfectScrollbar>
      </Box>
      </Stack>
    </CustomizedCard>
  );
}

export default ViewUserNotifications;
