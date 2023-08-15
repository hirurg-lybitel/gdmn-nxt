import { BrowserView, MobileView } from 'react-device-detect';
import { Box, Drawer, IconButton, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import styles from './sidebar-view.module.less';
import MenuList from '../menu-list/menu-list';
import { makeStyles } from '@mui/styles';
import CustomizedScrollBox from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-scroll-box/customized-scroll-box';
import { Header } from '../../Header';
import MenuIcon from '@mui/icons-material/Menu';

export interface SidebarProps {
  open: boolean;
  onToogle: () => void;
}

const useStyles = makeStyles(() => ({
  scroll: {
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
  const { open, onToogle } = props;
  const theme = useTheme();

  const classes = useStyles();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const drawer = (
    <>
      <BrowserView style={{ position: 'relative', flex: 1 }}>
        <CustomizedScrollBox
          className={classes.scroll}
          withBlur
          backgroundColor={theme.menu?.backgroundColor}
        >
          <MenuList />
        </CustomizedScrollBox>
      </BrowserView>
      <MobileView>
        <Box sx={{ px: 2 }}>
          <MenuList />
        </Box>
      </MobileView>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 }, width: theme.drawerWidth }}
    >
      {
        matchDownMd &&
        <IconButton
          style={{ margin: '5px' }}
          size="large"
          color="secondary"
          onClick={onToogle}
        >
          <MenuIcon />
        </IconButton>
      }
      <Drawer
        open={matchDownMd ? open : true}
        variant={matchDownMd ? 'temporary' : 'persistent'}
        onClose={onToogle}
        anchor="left"
        ModalProps={{ keepMounted: true }}

        sx={{
          '& .MuiDrawer-paper': {
            ...theme.menu,
            width: theme.drawerWidth,
            borderRight: 'none',
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
