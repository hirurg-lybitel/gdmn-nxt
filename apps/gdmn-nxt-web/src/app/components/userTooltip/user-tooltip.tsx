import { Avatar, Tooltip, TooltipProps } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import styles from './user-tooltip.module.less';

interface IUserTooltipProps extends Omit<TooltipProps, 'title'> {
  name: string;
  phone?: string,
  email?: string,
  avatar?: string;
  customAvatar?: React.ReactNode;
}

export default function UserTooltip({ name, phone, email, avatar, customAvatar, ...rest }: Readonly<IUserTooltipProps>) {
  return (
    <Tooltip
      {...rest}
      PopperProps={{
        disablePortal: true,
        ...rest.PopperProps
      }}
      arrow
      title={
        <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {customAvatar ? customAvatar : <Avatar
              src={avatar}
            />}
            <div style={{ fontSize: '14px' }}>
              {name}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {phone && <div className={styles.infoItem}>
              <PhoneIcon color={'primary'} />
              <a href={`tel:${phone}`}>{phone}</a>
            </div>}
            {email && <div className={styles.infoItem}>
              <EmailIcon color={'primary'} />
              <a href={`mailto:${email}`}>{email}</a>
            </div>}
          </div>
        </div>
      }
    />
  );
}
