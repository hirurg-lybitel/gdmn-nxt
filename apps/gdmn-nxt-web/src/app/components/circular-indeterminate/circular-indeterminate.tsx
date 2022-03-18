import './circular-indeterminate.module.less';
import { Box, CircularProgress } from '@mui/material';

export interface CircularIndeterminateProps {
  open: boolean;
  size?: number | string;
}

export function CircularIndeterminate(props: CircularIndeterminateProps) {
  const { open, size } = props;

  if (!open) return null;

  return (
    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress size={size} />
    </Box>
  );
}
