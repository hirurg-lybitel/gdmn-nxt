import { Box, MenuItem, SvgIconTypeMap, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar/sidebar-view/sidebar-view';
import { toggleMenu } from '../../store/settingsSlice';
import { styled, useTheme } from '@mui/material/styles';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { clearError } from '../../features/error-slice/error-slice';
import UpdatesInfo from '../../components/updates/updates-info/updates-info';
import { logoutUser } from 'apps/gdmn-nxt-web/src/app/features/user/userSlice';
import { useIdleTimer } from 'react-idle-timer';
import { LOGOUT_TIMEOUT } from '@gdmn/constants/client';
import { useSnackbar } from '@gdmn-nxt/components/helpers/hooks/useSnackbar';
import { saveFilterData } from '../../store/filtersSlice';
import { useFilterStore } from '@gdmn-nxt/components/helpers/hooks/useFilterStore';
import ContentContainer from '@gdmn-nxt/components/content-container/content-container';

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

  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const { errorMessage, errorStatus } = useSelector((state: RootState) => state.error);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const menuOpened = useSelector((state: RootState) => state.settings.menuOpened);

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

  const { addSnackbar } = useSnackbar();

  const onClose = useCallback(() => {
    dispatch(clearError());
    if (errorStatus === 401) {
      dispatch(logoutUser());
    };
  }, [dispatch, errorStatus]);

  useEffect(() => {
    if (!errorMessage) return;

    addSnackbar(errorMessage, { variant: 'error', onClose });
  }, [errorMessage, onClose]);

  const handleDrawerToggle = () => {
    dispatch(toggleMenu(!menuOpened));
  };

  const location = useLocation();
  const navigate = useNavigate();

  const [] = useFilterStore('menu');

  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.menu);
  useEffect(() => {
    const savedPathname = filterData?.path;
    const currentPathname = location.pathname;


    if (!savedPathname) {
      return;
    }
    if (currentPathname === savedPathname) {
      return;
    }

    navigate(savedPathname);
  }, [filterData?.path]);


  useEffect(() => {
    // сохранение последнего открытого пути
    dispatch(saveFilterData({ menu: { path: location.pathname } }));
  }, [location]);

  return (
    <>
      <UpdatesInfo />
      <Box sx={{ display: 'flex', backgroundColor: theme.menu?.backgroundColor }}>
        <Sidebar
          open={menuOpened}
          onToogle={handleDrawerToggle}
        />
        <Main menuOpened={!matchDownMd} style={{ display: 'flex' }}>
          <ContentContainer>
            <Outlet />
          </ContentContainer>
        </Main>
      </Box>
    </>
  );
};
