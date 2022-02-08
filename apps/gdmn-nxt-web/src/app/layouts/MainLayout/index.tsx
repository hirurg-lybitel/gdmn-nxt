import { AppBar, Avatar, Box, CssBaseline, Divider, IconButton, ListItemIcon, Menu, MenuItem, Stack, SvgIconTypeMap, Toolbar, Typography, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { queryLogout, UserState } from '../../features/user/userSlice';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/sidebar-view/sidebar-view';
import { setStyleMode, toggleMenu } from '../../store/settingsSlice'
import { styled, useTheme } from '@mui/material/styles';
import { OverridableComponent } from '@mui/material/OverridableComponent';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'menuOpened'})<{menuOpened: boolean}>(({ theme, menuOpened }) => ({
  ...theme.mainContent,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  ...(menuOpened
      ? {
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
         }),
          marginLeft: 0,
          width: `calc(100% - ${theme.drawerWidth}px)`,
          [theme.breakpoints.down('md')]: {
            marginLeft: '20px'
          },
          [theme.breakpoints.down('sm')]: {
            marginLeft: '10px'
          }
      }
      : {
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          }),
          [theme.breakpoints.up('md')]: {
            marginLeft: -(theme.drawerWidth - 20),
            width: `calc(100% - ${theme.drawerWidth}px)`
          },
          [theme.breakpoints.down('md')]: {
              marginLeft: '20px',
              width: `calc(100% - ${theme.drawerWidth}px)`,
              padding: '16px'
          },
          [theme.breakpoints.down('sm')]: {
              marginLeft: '10px',
              width: `calc(100% - ${theme.drawerWidth}px)`,
              padding: '16px',
              marginRight: '10px'
          }
      })
}));

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

const MainLayout = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector<RootState, UserState>( state => state.user );
  const [anchorProfileEl, setAnchorProfileEl] = useState(null);
  const [anchorMenuEl, setAnchorMenuEl] = useState(null);

  const menuOpened = useSelector((state: RootState) => state.settings.menuOpened);

  const handleDrawerToggle = () => {
    dispatch(toggleMenu(!menuOpened));
  }

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
      onClick: () => dispatch(queryLogout())
    }
  ];


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          transition: menuOpened ? theme.transitions.create('width') : 'none'
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            // onClick={ (event: any) => setAnchorMenuEl(event.currentTarget) }
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h1" component="div" sx={{ ...theme.menu, flexGrow: 1 }}>
            Портал БелГИСС
          </Typography>
          <IconButton
            size="large"
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
      <Sidebar
        open={menuOpened}
        onToogle={handleDrawerToggle}
      />
      <Main menuOpened={menuOpened}>
        <Outlet />
      </Main>
    </Box>

  )
}

export default MainLayout;