import { BrowserView, MobileView } from 'react-device-detect';
import { Box, Drawer, IconButton, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MenuList from '../menu-list/menu-list';
import { Header } from '../../Header';
import MenuIcon from '@mui/icons-material/Menu';

export interface SidebarProps {
  open: boolean;
  onToogle: () => void;
}

export function Sidebar(props: SidebarProps) {
  const { open, onToogle } = props;
  const theme = useTheme();

  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const drawer = (
    <>
      <BrowserView style={{ position: 'relative', flex: 1 }}>
        <MenuList />
      </BrowserView>
      <MobileView style={{ position: 'relative', flex: 1 }}>
        <MenuList />
      </MobileView>
    </>
  );

  const breakPoint400 = useMediaQuery('(max-width:400px)');

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 }, width: breakPoint400 ? '240px' : theme.drawerWidth }}
      id="sidebar"
    >
      {
        matchDownMd &&
        <IconButton
          style={{ margin: '5px', padding: breakPoint400 ? '5px' : '12px' }}
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
