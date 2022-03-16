import { Box, CssBaseline, Grid } from '@mui/material';
import { Outlet } from 'react-router-dom';

const MinimalLayout = () => (
  <>
    <Grid container direction="column" justifyContent="center" alignContent="center" sx={{ minHeight: '100vh' }}>
      <CssBaseline />
      <Outlet />
    </Grid>
    </>

);

export default MinimalLayout;
