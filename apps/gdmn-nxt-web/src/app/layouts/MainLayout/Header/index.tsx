import { Box, ButtonBase, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Notification from './NotificationSection/notification/notification';
import Profile from './profile/profile';
import UpgradeIcon from '@mui/icons-material/Upgrade';

interface IHeaderProps {
  onDrawerToggle: () => void;
  openUpdates: () => void
};

export const Header = (props: IHeaderProps) => {
  const { onDrawerToggle, openUpdates } = props;

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
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ mr: 2 }}
        // onClick={ (event: any) => setAnchorMenuEl(event.currentTarget) }
        onClick={openUpdates}
      >
        <UpgradeIcon />
      </IconButton>
      {/* <ButtonBase disableRipple component={Link} to={'/'} >
        <BelgissLogo />
      </ButtonBase> */}
      <Box sx={{ flexGrow: 1 }} />
      <Notification />
      <Profile />
    </>
  );
};
