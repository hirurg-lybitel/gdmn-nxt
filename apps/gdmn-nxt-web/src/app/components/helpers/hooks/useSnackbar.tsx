import { IconButton } from '@mui/material';
import { SnackbarKey, useSnackbar as useSourceSnackbar, VariantType } from 'notistack';
import { useCallback } from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface Options {
  variant: VariantType;
  onClose?: () => void;
}

export const useSnackbar = () => {
  const { enqueueSnackbar, closeSnackbar } = useSourceSnackbar();

  const handleCloseAlert = useCallback((snackbarId: SnackbarKey, callback = () => {}) => () => {
    callback();
    closeSnackbar(snackbarId);
  }, [closeSnackbar]);

  // eslint-disable-next-line react/display-name
  const closeAction = useCallback((callback?: () => void) => (snackbarId: SnackbarKey) => (
    <IconButton
      size="small"
      color="inherit"
      onClick={handleCloseAlert(snackbarId, callback)}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  ), [handleCloseAlert]);

  const addSnackbar = useCallback((
    message: string,
    {
      onClose,
      ...options
    }: Options
  ) => enqueueSnackbar(message, {
    ...options,
    action: closeAction(onClose),
    onClose: () => onClose && onClose()
  }), [closeAction, enqueueSnackbar]);

  return { addSnackbar };
};
