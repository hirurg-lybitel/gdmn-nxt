import { AppBar, Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem, Stack, SvgIconTypeMap, Toolbar, Typography } from '@mui/material';
import { ReactChild, ReactFragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logoutUser, UserState } from '../features/user/userSlice';
import MenuIcon from '@mui/icons-material/Menu';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import './page-header.module.less';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { Box } from '@mui/system';

interface IMenuItem {
  type: 'item';
  Icon?: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; };
  caption: string;
  onClick: () => void;
};

interface IMenuDivider {
  type: 'divider'
};

export type MenuItem = IMenuItem | IMenuDivider;

interface ICustomMenuProps {
  anchorEl: Element | null;
  handleClose: () => void;
  items: MenuItem[];
};

const CustomMenu = ({ anchorEl, handleClose, items }: ICustomMenuProps) =>
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleClose}
    onClick={handleClose}
    PaperProps={{
      elevation: 0,
      sx: {
        overflow: 'visible',
        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
        mt: 1.5,
        '& .MuiAvatar-root': {
          width: 32,
          height: 32,
          ml: -0.5,
          mr: 1,
        },
        '&:before': {
          content: '""',
          display: 'block',
          position: 'absolute',
          top: 0,
          right: 14,
          width: 10,
          height: 10,
          bgcolor: 'background.paper',
          transform: 'translateY(-50%) rotate(45deg)',
          zIndex: 0,
        },
      },
    }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
  >
    {items.map( (i, idx) =>
      i.type === 'divider' ?
        <Divider key={idx} />
      :
        <MenuItem key={idx} onClick={i.onClick}>
          {i.Icon &&
            <ListItemIcon>
              <i.Icon fontSize="small" />
            </ListItemIcon>
          }
          {i.caption}
        </MenuItem>
    )}
  </Menu>;

interface IPageHeaderProps {
  menuItems: MenuItem[];
  children: ReactChild | ReactFragment | null;
};

export function PageHeader({ menuItems, children }: IPageHeaderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector<RootState, UserState>( state => state.user );
  const [anchorProfileEl, setAnchorProfileEl] = useState(null);
  const [anchorMenuEl, setAnchorMenuEl] = useState(null);

  const profileMenuItems: MenuItem[] = [
    {
      type: 'item',
      caption: user.userProfile?.userName ?? 'unknown user',
      Icon: Settings,
      onClick: () => {}
    },
    {
      type: 'divider'
    },
    {
      type: 'item',
      caption: 'Logout',
      Icon: Logout,
      onClick: () => dispatch(logoutUser())
    }
  ];

  return (
    <Stack direction='column' width='100%'>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={ (event: any) => setAnchorMenuEl(event.currentTarget) }
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Портал БелГИСС
          </Typography>
          <IconButton
            size="large"
            color="inherit"
            onClick={ (event: any) => setAnchorProfileEl(event.currentTarget) }
          >
            <Avatar />
          </IconButton>
        </Toolbar>
      </AppBar>
      <CustomMenu
        anchorEl={anchorProfileEl}
        handleClose={ () => setAnchorProfileEl(null) }
        items={profileMenuItems}
      />
      <CustomMenu
        anchorEl={anchorMenuEl}
        handleClose={ () => setAnchorMenuEl(null) }
        items={menuItems}
      />
      {children}
    </Stack>
  );
};

export default PageHeader;
