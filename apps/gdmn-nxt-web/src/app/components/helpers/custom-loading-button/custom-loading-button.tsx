import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import styles from './custom-loading-button.module.less';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useCallback } from 'react';

/* eslint-disable-next-line */
export interface CustomLoadingButtonProps {
  loading: boolean;
  onClick: () => void;
  hint?: string;
}

export function CustomLoadingButton(props: CustomLoadingButtonProps) {
  const { loading, onClick, hint = '' } = props;
  const handleOnClick = useCallback(() => onClick(), [onClick]);
  return (

    <IconButton
      style={{ width: '40px', height: '40px' }}
      disabled={loading}
      onClick={handleOnClick}
    >
      <Tooltip arrow title={hint}>
        {loading ? <CircularProgress size={17} color="inherit" /> : <RefreshIcon color="primary" />}
      </Tooltip>
    </IconButton>

  );
}

export default CustomLoadingButton;
