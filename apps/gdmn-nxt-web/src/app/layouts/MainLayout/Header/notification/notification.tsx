import './notification.module.less';
import { Badge, Box, ButtonBase } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

/* eslint-disable-next-line */
export interface NotificationProps {}

export function Notification(props: NotificationProps) {
  return (
    <Box
      sx={{
        mx: 2
      }}
    >
      <ButtonBase>
        <Badge color="error" variant="dot">
          <NotificationsIcon />
        </Badge>
      </ButtonBase>
    </Box>
  );
};

export default Notification;
