import { Dialog, Paper, PaperProps, Slide, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { styled } from '@mui/material/styles';
import './customized-dialog.module.less';
import { forwardRef, ReactElement, ReactNode, Ref } from 'react';
import { TransitionProps } from '@mui/material/transitions';

interface StyleProps {
  width: number | string;
}

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    width: ({ width }) => width,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    '& .MuiDialogActions-root': {
      padding: '12px 24px 12px 16px !important'
    }
  },
}));


const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});


export interface CustomizedDialogProps {
  open: boolean;
  onClose?: (event?: object, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  children: ReactNode;
  width?: number | string;
  minWidth?: number | string;
}


function CustomizedDialog(props: CustomizedDialogProps) {
  const { children, open, onClose } = props;
  const {
    width = 500,
    minWidth = 0
  } = props;

  console.log('width', width);
  const styles = {
    width: width,
    minWidth
  };

  const handleOnClose = (event: object, reason: string) => {
    switch (reason) {
      case 'backdropClick':
      case 'escapeKeyDown':
        onClose && onClose(event, reason);
        break;
      default:
        break;
    }
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={handleOnClose}
      // PaperComponent={myPaper}
      // classes={{
      //   paper: classes.dialog
      // }}
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
            padding: '12px 24px 12px 16px !important'
          },
          maxWidth: '100%',
          ...styles
        }
      }}
    >
      {children}
    </Dialog>
  );
}


export default CustomizedDialog;
