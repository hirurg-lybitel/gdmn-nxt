import { LinearProgress } from '@mui/material';
import { useTheme } from '@mui/system';
import { GridOverlay } from '@mui/x-data-grid-pro';

export default function CustomLoadingOverlay() {
  const theme = useTheme();
  return (
    <GridOverlay style={{ backgroundColor: `${theme.palette.background.paper}` }}>
      <div style={{ position: 'absolute', top: 0, width: '100%' }}>
        <LinearProgress sx={{ height: 10 }} />
      </div>
    </GridOverlay>
  );
}
