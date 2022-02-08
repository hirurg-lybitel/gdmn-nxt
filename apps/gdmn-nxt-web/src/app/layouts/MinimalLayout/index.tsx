import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';

const MinimalLayout = () => (
    <>
      <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Outlet />
      </Box>
    </>
);

export default MinimalLayout;
