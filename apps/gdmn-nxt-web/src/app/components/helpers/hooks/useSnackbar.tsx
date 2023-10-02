import { IconButton } from '@mui/material';
import { SnackbarKey, useSnackbar as useSourceSnackbar, VariantType } from 'notistack';
import { Fragment, useCallback } from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface Options {
  variant: VariantType;
}

export const useSnackbar = () => {
  const { enqueueSnackbar, closeSnackbar } = useSourceSnackbar();

  const handleCloseAlert = useCallback((snackbarId: SnackbarKey) => () => closeSnackbar(snackbarId), []);

  const closeAction = useCallback((snackbarId: SnackbarKey) => (
    <Fragment>
      <IconButton
        size="small"
        color="inherit"
        onClick={handleCloseAlert(snackbarId)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  ), [handleCloseAlert]);

  const addSnackbar = useCallback((message: string, options: Options) => enqueueSnackbar(message, { ...options, action: closeAction }), []);

  return { addSnackbar };
};
