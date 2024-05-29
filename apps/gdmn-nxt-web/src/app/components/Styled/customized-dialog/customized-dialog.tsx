import { Dialog, Slide } from '@mui/material';
import { styled } from '@mui/material/styles';
import './customized-dialog.module.less';
import { forwardRef, ReactElement, ReactNode, Ref, useEffect, useState } from 'react';
import { TransitionProps } from '@mui/material/transitions';

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
  onClose?: (event?: object, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  children: ReactNode;
  width?: number | string;
  minWidth?: number | string;
  hideBackdrop?: boolean;
  disableEscape?: boolean;
}


function CustomizedDialog(props: CustomizedDialogProps) {
  const { children, open, onClose } = props;
  const {
    width = 500,
    minWidth = 0,
    hideBackdrop = false,
    disableEscape = false
  } = props;

  const styles = {
    width: width,
    minWidth
  };

  const [cleanDom, setCleanDom] = useState(false);

  useEffect(() => {
    if (open && cleanDom) {
      setCleanDom(false);
    }
  }, [open, cleanDom]);

  const handleOnClose = (event: object, reason: string) => {
    switch (reason) {
      case 'backdropClick':
        onClose && onClose(event, reason);
        break;
      case 'escapeKeyDown':
        (!disableEscape && onClose) && onClose(event, reason);
        break;
      default:
        break;
    }
  };

  const clearAfterExit = () => {
    setCleanDom(true);
  };

  if (cleanDom) {
    return <></>;
  };

  return (
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
          maxWidth: '100%',
          '& .MuiDialogActions-root': {
            padding: '12px 24px 12px 16px !important',
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
  );
}


export default CustomizedDialog;
