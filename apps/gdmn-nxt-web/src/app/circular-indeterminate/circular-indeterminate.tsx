import './circular-indeterminate.module.less';
import { Box, CircularProgress } from '@mui/material';

export interface CircularIndeterminateProps {
  open: boolean;
}

export default function CircularIndeterminate(props: CircularIndeterminateProps) {
  const { open } = props;

  if (!open) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent:'center' }}>
      <CircularProgress />
    </Box>
  );
}
