import { BrowserView, MobileView } from 'react-device-detect';
import { Box, Drawer, useTheme } from '@mui/material';
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

  const drawer = (
    <>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Box sx={{ display: 'flex', p: 2, mx: 'auto' }}>
                123
            </Box>
        </Box>
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
        variant="persistent"
        onClose={onToogle}
        anchor="left"
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
              ...theme.menu,
              width: theme.drawerWidth,
              borderRight: 'none',
              paddingTop: '25px',
              top: '65px'
          }
      }}
      >
        {drawer}
      </Drawer>

    </Box>

  );
}

export default Sidebar;