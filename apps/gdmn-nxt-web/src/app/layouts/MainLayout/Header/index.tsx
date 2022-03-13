import { Box, ButtonBase, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Notification from './NotificationSection/notification/notification';
import Profile from './profile/profile';
import BelgissLogo from '../../../components/belgiss-logo/belgiss-logo';

interface IHeaderProps {
  onDrawerToggle: () => void;
};

export const Header = (props: IHeaderProps) => {
  const { onDrawerToggle } = props;

  return (
    <>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ mr: 2 }}
        // onClick={ (event: any) => setAnchorMenuEl(event.currentTarget) }
        onClick={onDrawerToggle}
      >
        <MenuIcon />
      </IconButton>
      <ButtonBase disableRipple component={Link} to={'/'} >
        <BelgissLogo />
      </ButtonBase>
      <Box sx={{ flexGrow: 1 }} />
      <Notification />
      <Profile />
    </>
  );
};
