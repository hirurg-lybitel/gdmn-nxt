import { Box, Button, CardActions, InputAdornment, TextField } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import styles from './notifications-settings.module.less';

/* eslint-disable-next-line */
export interface NotificationsSettingsProps {}

export function NotificationsSettings(props: NotificationsSettingsProps) {
  return (
    <CustomizedCard
      className={styles['item-card']}
      boxShadows
    >
      <Box flex={1} sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField
          label="Дней без срока"
          sx={{ maxWidth: '25ch' }}
          InputProps={{
            startAdornment: <InputAdornment position="start">Дн.</InputAdornment>,
          }}
          value={10}
          disabled={true}
        />
        <TextField
          label="Время удаления уведомлений"
          id="outlined-start-adornment"
          sx={{ maxWidth: '25ch' }}
          InputProps={{
            startAdornment: <InputAdornment position="start">Мин.</InputAdornment>,
          }}
          value={60}
          disabled={true}
        />
      </Box>
      <CardActions>
        <Box flex={1} />
        <Button variant="contained">Сохранить</Button>
      </CardActions>
    </CustomizedCard>
  );
}

export default NotificationsSettings;
