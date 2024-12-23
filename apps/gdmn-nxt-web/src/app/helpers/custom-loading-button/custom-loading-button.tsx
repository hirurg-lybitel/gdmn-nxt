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
    <Tooltip arrow title={hint}>
      <span>
        <IconButton
          style={{ width: '30px', height: '30px' }}
          disabled={loading}
          onClick={handleOnClick}
        >
          {loading ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon color="primary" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}

export default CustomLoadingButton;
