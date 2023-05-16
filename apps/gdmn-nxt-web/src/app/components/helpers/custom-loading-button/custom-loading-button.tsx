import { CircularProgress, IconButton } from '@mui/material';
import styles from './custom-loading-button.module.less';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useCallback } from 'react';

/* eslint-disable-next-line */
export interface CustomLoadingButtonProps {
  loading: boolean;
  onClick: () => void;
}

export function CustomLoadingButton(props: CustomLoadingButtonProps) {
  const { loading, onClick } = props;
  const handleOnClick = useCallback(() => onClick(), [onClick]);
  return (
    <IconButton
      style={{ width: '40px', height: '40px' }}
      disabled={loading}
      onClick={handleOnClick}
    >
      {loading ? <CircularProgress size={17} color="inherit" /> : <RefreshIcon color="primary" />}
    </IconButton>
  );
}

export default CustomLoadingButton;
