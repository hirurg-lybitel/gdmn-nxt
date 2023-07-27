import { BrowserView, MobileView } from 'react-device-detect';
import { Box, Drawer, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import styles from './sidebar-view.module.less';
import MenuList from '../menu-list/menu-list';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { makeStyles } from '@mui/styles';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { IPermissionByUser } from '@gsbelarus/util-api-types';
import { useRef } from 'react';
import { margin } from '@mui/system';
import CustomizedScrollBox from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-scroll-box/customized-scroll-box';
import { Header } from '../../Header';

/* eslint-disable-next-line */
export interface SidebarProps {
  open: boolean;
  onToogle: () => void;
  window?: any;
}

const useStyles = makeStyles(() => ({
  scroll: {
    // height: 'calc(100vh - 70px)',
    paddingLeft: '16px',
    paddingRight: '16px',
    '& .ps__rail-y': {
      borderRadius: '12px',
      opacity: 0.5,
    },
    '& .ps__thumb-y ': {
      backgroundColor: 'white',
    },
  },
}));


export function Sidebar(props: SidebarProps) {
  const { open, onToogle, window } = props;
  const theme = useTheme();

  const classes = useStyles();

  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

  const containerRef = useRef<HTMLElement | null>(null);

  console.log('containerRef', containerRef.current?.scrollHeight, containerRef.current?.clientHeight);

  const drawer = (
    <>
      <BrowserView style={{ position: 'relative', flex: 1 }}>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            top: 0,
            left: 0,
            right: '15px',
            height: '50px',
            background: 'linear-gradient(to bottom,rgb(100, 181, 246) 0%,rgba(100,181,246,.79) 67%,rgba(27,52,70,0) 100%)'
          }}
          hidden
        />
        {/* <PerfectScrollbar
          // onScrollCapture={(e) => console.log('onScrollCapture', e)}
          containerRef={(ref) => (containerRef.current = ref)}
          className={classes.scroll}
          style={{
            height: matchDownMd ? '100vh' : 'calc(100vh - 70px)',
            paddingTop: matchDownMd ? '16px' : 0,
          }}
        >
          <MenuList />
        </PerfectScrollbar> */}
        <CustomizedScrollBox className={classes.scroll}>
          <MenuList />

        </CustomizedScrollBox>
        <div
          aria-label="dibdown"
          style={{
            position: 'absolute',
            zIndex: 10,
            bottom: 0,
            left: 0,
            right: '15px',
            height: '50px',
            background: 'linear-gradient(to bottom,rgba(27,52,70,0) 0%,rgba(100,181,246,.79) 33%,rgb(100, 181, 246) 100%)'
          }}
          hidden
        />
      </BrowserView>
      <MobileView>
        <Box sx={{ px: 2 }}>
          <MenuList />
        </Box>
      </MobileView>
    </>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  // return (
  //   <div
  //     style={{
  //       ...theme.menu,
  //       width: theme.drawerWidth,
  //       display: 'flex',
  //       flex: 1,
  //       paddingLeft: '16px',
  //       height: matchDownMd ? '100vh' : 'calc(100vh - 70px)'
  //       // padding: '0 16px'


  //     }}
  //     // onWheelCapture={(e) => {
  //     //   console.log('onWheelCapture');
  //     //   // e.preventDefault()
  //     //   // e.stopPropagation()
  //     // }}
  //   >
  //     {drawer}
  //   </div>
  // );

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 }, width: theme.drawerWidth }}
    >
      <Drawer
        open={open}
        container={container}
        variant={matchDownMd ? 'temporary' : 'persistent'}
        onClose={onToogle}
        anchor="left"
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            ...theme.menu,
            width: theme.drawerWidth,
            borderRight: 'none',
            [theme.breakpoints.up('md')]: {
              // top: '50px',
              // marginTop: '25px'
            }
          }
        }}
      >
        <Toolbar style={{ backgroundColor: theme.menu?.backgroundColor, paddingLeft: '16px' }}>
          <Header onDrawerToggle={() => {}} />
        </Toolbar>
        {drawer}
      </Drawer>
    </Box>

  );
}

export default Sidebar;
