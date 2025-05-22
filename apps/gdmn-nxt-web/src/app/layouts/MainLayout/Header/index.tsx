import { Box, ButtonBase, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Notification from './NotificationSection/notification/notification';
import Profile from './profile/profile';
import ToggleTheme from './toggle-theme/toggle-theme';
import CloseIcon from '@mui/icons-material/Close';
import { IMenuItem } from '../../../menu-items';

interface IHeaderProps {
  onDrawerToggle: () => void;
  mobile?: boolean,
  menuItemClick: (item: IMenuItem, level: number) => void
};

export const Header = (props: IHeaderProps) => {
  const { onDrawerToggle, mobile = false, menuItemClick } = props;

  return (
    <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: mobile ? 'space-between' : '', gap: mobile ? '' : '16px' }}>
      {/* <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ mr: 2 }}
        // onClick={ (event: any) => setAnchorMenuEl(event.currentTarget) }
        onClick={onDrawerToggle}
      >
        <MenuIcon />
      </IconButton> */}
      {/* <ButtonBase disableRipple component={Link} to={'/'} >
        <BelgissLogo />
      </ButtonBase> */}
      {/* <Box sx={{ flexGrow: 1 }} /> */}

      <Profile menuItemClick={menuItemClick} />
      <Notification menuItemClick={menuItemClick} />
      <ToggleTheme />
      {mobile && <IconButton size="large" onClick={onDrawerToggle}>
        <CloseIcon color="secondary"/>
      </IconButton>}
    </div>
  );
};
