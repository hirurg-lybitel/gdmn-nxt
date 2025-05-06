import { BrowserView, MobileView } from 'react-device-detect';
import { Box, Drawer, IconButton, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MenuList from '../menu-list/menu-list';
import { Header } from '../../Header';
import MenuIcon from '@mui/icons-material/Menu';
import { IMenuItem } from 'apps/gdmn-nxt-web/src/app/menu-items';

export interface SidebarProps {
  open: boolean;
  onToogle: () => void;
}

export function Sidebar(props: SidebarProps) {
  const { open, onToogle } = props;
  const theme = useTheme();

  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

  const menuItemClick = (item: IMenuItem, level: number) => {
    if (matchDownMd && (!item.url || !window.location.href.includes(item.url))) {
      onToogle();
    }
  };

  const drawer = (
    <>
      <BrowserView style={{ position: 'relative', flex: 1 }}>
        <MenuList />
      </BrowserView>
      <MobileView style={{ position: 'relative', flex: 1, zIndex: 1500 }}>
        <MenuList onItemClick={menuItemClick} />
      </MobileView>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 }, width: theme.drawerWidth }}
      id="sidebar"
    >
      {
        matchDownMd &&
        <IconButton
          style={{ margin: '5px', padding: matchDownMd ? '5px' : '12px' }}
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
          zIndex: '1500',
          '& .MuiDrawer-paper': {
            ...theme.menu,
            width: theme.drawerWidth,
            borderRight: 'none'
          }
        }}
      >
        <Toolbar style={{ backgroundColor: theme.menu?.backgroundColor, paddingLeft: '16px' }}>
          <Header
            menuItemClick={menuItemClick}
            mobile={matchDownMd}
            onDrawerToggle={onToogle}
          />
        </Toolbar>
        {drawer}
      </Drawer>
    </Box>

  );
}

export default Sidebar;
