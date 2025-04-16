import { Dialog, Slide, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import './customized-dialog.module.less';
import { forwardRef, ReactElement, ReactNode, Ref, useEffect, useMemo, useState } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>,
) {
  return (
    <Slide
      direction="left"
      ref={ref}
      {...props}
    />
  );
});


export interface CustomizedDialogProps {
  open: boolean;
  onClose?: (event?: object, reason?: 'backdropClick' | 'escapeKeyDown' | 'swipe') => void;
  children: ReactNode;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  hideBackdrop?: boolean;
  disableEscape?: boolean;
  confirmation?: boolean;
  fullwidth?: boolean;
  disableScrollBlock?: boolean;
}


function CustomizedDialog(props: CustomizedDialogProps) {
  const { children, open, onClose, confirmation = false } = props;
  const {
    width,
    minWidth = 0,
    fullwidth = false,
    maxWidth = (!width && !fullwidth) || Number(width) <= 600 ? '80%' : '100%',
    hideBackdrop = false,
    disableEscape = false,

  } = props;

  const theme = useTheme();

  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const leftIndent = matchDownSm ? 0 : matchDownMd ? 100 : matchDownLg ? 190 : theme.drawerWidth;

  const styles = {
    width: width ?? (fullwidth ? `calc(100% - ${leftIndent}px)` : 500),
    minWidth,
    maxWidth
  };

  const [cleanDom, setCleanDom] = useState(false);

  useEffect(() => {
    if (open && cleanDom) {
      setCleanDom(false);
    }
  }, [open, cleanDom]);

  const handleOnClose = (event: object, reason: string) => {
    switch (reason) {
      case 'swipe':
      case 'backdropClick':
        if (confirmation) {
          setConfirmOpen(true);
          return;
        }
        onClose && onClose(event, reason);
        break;
      case 'escapeKeyDown':
        if (disableEscape || !onClose) return;
        if (confirmation) {
          setConfirmOpen(true);
          return;
        }
        onClose(event, reason);
        break;
      default:
        break;
    }
  };

  const clearAfterExit = () => {
    setCleanDom(true);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = () => {
    onClose && onClose();
    setConfirmOpen(false);
  };

  const handleCinfirmCancel = () => {
    setConfirmOpen(false);
  };

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      dangerous={false}
      title="Внимание"
      text={'Изменения будут утеряны. Продолжить?'}
      confirmClick={handleConfirm}
      cancelClick={handleCinfirmCancel}
    />,
  [confirmOpen]);

  if (cleanDom) {
    return <></>;
  };

  return (
    <>
      {memoConfirmDialog}
      <Dialog
        open={open}
        disableRestoreFocus
        TransitionComponent={Transition}
        TransitionProps={{
          onExited: () => clearAfterExit()
        }}
        onClose={handleOnClose}
        hideBackdrop={hideBackdrop}
        PaperProps={{
          sx: {
            position: 'absolute',
            right: 0,
            margin: 0,
            height: '100%',
            maxHeight: '100%',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            '& .MuiDialogActions-root': {
              padding: '12px 24px 12px 24px !important',
              gap: '6px',
              '& .DialogButton': {
                width: 120
              }
            },
            '& .MuiDialogTitle-root': {
              padding: '12px 24px !important',
            },
            ...styles
          }
        }}
      >
        {children}
      </Dialog>
    </>
  );
}


export default CustomizedDialog;
