import { Alert, Box, MenuItem, Snackbar, SvgIconTypeMap, useMediaQuery } from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/sidebar-view/sidebar-view';
import { toggleMenu } from '../../store/settingsSlice';
import { styled, useTheme } from '@mui/material/styles';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { clearError } from '../../features/error-slice/error-slice';
import UpdatesInfo from '../../components/updates/updates-info/updates-info';
import { logoutUser } from 'apps/gdmn-nxt-web/src/app/features/user/userSlice';
import { useIdleTimer } from 'react-idle-timer';
import { LOGOUT_TIMEOUT } from '@gdmn/constants';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'menuOpened' })<{menuOpened: boolean}>(({ theme, menuOpened }) => ({
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
      width: `calc(100% - ${theme.drawerWidth}px - 20px)`,
      [theme.breakpoints.down('sm')]: {
        marginLeft: -(theme.drawerWidth - 20),
        width: `calc(100% - ${theme.drawerWidth}px)`,
      }
    }
    : {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      marginLeft: -(theme.drawerWidth - 60),
      width: `calc(100% - ${theme.drawerWidth}px)`,
      [theme.breakpoints.up('md')]: {
        marginLeft: -(theme.drawerWidth - 20),
        width: `calc(100% - ${theme.drawerWidth}px)`
      },
      // [theme.breakpoints.down('md')]: {
      //     marginLeft: '10px',
      //     width: `calc(100% - ${theme.drawerWidth}px)`,
      //     padding: '16px'
      // },
      // [theme.breakpoints.down('sm')]: {
      //     marginLeft: '10px',
      //     width: `calc(100% - ${theme.drawerWidth}px)`,
      //     padding: '16px',
      //     marginRight: '10px'
      // }
    })
}));

interface IMenuItem {
  type: 'item';
  Icon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & { muiName: string; };
  caption: string;
  onClick: () => void;
};

interface IMenuDivider {
  type: 'divider'
};

export type MenuItem = IMenuItem | IMenuDivider;

interface MainLayoutProps{
}

export const MainLayout = (props: MainLayoutProps) => {
  const theme = useTheme();

  const dispatch = useDispatch<AppDispatch>();
  const onIdleHandler = () => {
    dispatch(logoutUser());
  };

  useIdleTimer({
    onIdle: onIdleHandler,
    timeout: LOGOUT_TIMEOUT,
    promptBeforeIdle: 0,
    events: [
      'mousemove',
      'keydown',
      'touchstart',
      'touchmove',
    ],
  });

  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const { errorMessage } = useSelector((state: RootState) => state.error);
  const [openSnackBar, setOpenSnackBar] = useState(false);

  const menuOpened = useSelector((state: RootState) => state.settings.menuOpened);

  useEffect(() => {
    if (errorMessage) {
      setOpenSnackBar(true);
    }
  }, [errorMessage]);

  const handleDrawerToggle = () => {
    dispatch(toggleMenu(!menuOpened));
  };

  const handleSnackBarClose = (event: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    };
    dispatch(clearError());
    setOpenSnackBar(false);
  };

  return (
    <>
      <UpdatesInfo />
      <Box sx={{ display: 'flex', backgroundColor: theme.menu?.backgroundColor }}>
        <Sidebar
          open={menuOpened}
          onToogle={handleDrawerToggle}
        />
        <Main menuOpened={!matchDownMd} style={{ display: 'flex' }}>
          <Outlet />
        </Main>
        <Snackbar
          open={openSnackBar}
          autoHideDuration={5000}
          onClose={handleSnackBarClose}
          sx={{
            '& .MuiAlert-icon, .MuiAlert-action': {
              alignItems: 'center',
            }
          }}
        >
          <Alert
            onClose={handleSnackBarClose}
            variant="filled"
            severity="error"
            style={{
              fontSize: '1.2em'
            }}
          >{errorMessage}</Alert>
        </Snackbar>
      </Box>
    </>
  );
};
