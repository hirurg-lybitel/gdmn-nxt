import { Dialog, Slide, Theme } from '@mui/material';
import { styled } from '@mui/system';
import { makeStyles } from '@mui/styles';
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
  onClose?: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void;
  children: ReactNode;
  width?: number | string;
}


function CustomizedDialog(props: CustomizedDialogProps) {
  const { children, open, onClose } = props;
  const { width = 500 } = props;

  const styles = {
    width: width
  };

  const classes = useStyles(styles);

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={onClose}
      classes={{
        paper: classes.dialog
      }}
    >
      {children}
    </Dialog>
  );
}


export default CustomizedDialog;
