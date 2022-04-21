import { BrowserView, MobileView } from 'react-device-detect';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import './sidebar-view.module.less';
import MenuList from '../menu-list/menu-list';

/* eslint-disable-next-line */
export interface SidebarProps {
  open: boolean;
  onToogle: () => void;
  window?: any;
}


export function Sidebar(props: SidebarProps) {
  const {open, onToogle, window} = props
  const theme = useTheme();

  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

  const drawer = (
    <>
      <BrowserView>
        <Box
          style={{
            paddingLeft: '16px',
            paddingRight: '16px'
          }}
        >
          <MenuList />
        </Box>
      </BrowserView>
      <MobileView>
        <Box sx={{ px: 2 }}>
          <MenuList />
        </Box>
      </MobileView>
    </>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

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
              paddingTop: '25px',
              [theme.breakpoints.up('md')]: {
                top: '70px'
              }
          }
      }}
      >
        {drawer}
      </Drawer>

    </Box>

  );
}

export default Sidebar;
