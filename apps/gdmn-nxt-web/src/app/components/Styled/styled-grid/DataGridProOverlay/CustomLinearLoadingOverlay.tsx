import { LinearProgress, useTheme } from '@mui/material';
import { GridOverlay } from '@mui/x-data-grid-pro';

export default function CustomLinearLoadingOverlay() {
  const theme = useTheme();
  return (
    <GridOverlay style={{ backgroundColor: `${theme.palette.background.paper}` }}>
      <div style={{ position: 'absolute', top: 0, width: '100%' }}>
        <LinearProgress sx={{ height: 5 }} />
      </div>
    </GridOverlay>
  );
}
