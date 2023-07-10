import { CircularProgress, useTheme } from '@mui/material';
import { GridOverlay } from '@mui/x-data-grid-pro';

export default function CustomCircularLoadingOverlay() {
  const theme = useTheme();
  return (
    <GridOverlay style={{ backgroundColor: `${theme.palette.background.paper}` }}>
      <CircularProgress size={70} />
    </GridOverlay>
  );
}
