import { Box, Button, CardActions, InputAdornment, TextField } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import styles from './notifications-settings.module.less';

/* eslint-disable-next-line */
export interface NotificationsSettingsProps {}

export function NotificationsSettings(props: NotificationsSettingsProps) {
  return (
    <CustomizedCard borders style={{ flex: 1, padding: 10, display: 'flex', flexDirection: 'column' }} boxShadows>
      <Box flex={1}>
        <TextField
          label="Дней без срока"
          sx={{ m: 1, width: '25ch' }}
          InputProps={{
            startAdornment: <InputAdornment position="start">Дн.</InputAdornment>,
          }}
          value={10}
          disabled={true}
        />
        <TextField
          label="Время удаления уведомлений"
          id="outlined-start-adornment"
          sx={{ m: 1, width: '25ch' }}
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
