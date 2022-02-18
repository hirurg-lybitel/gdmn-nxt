import { Dialog, Slide, Theme } from '@mui/material';
import { styled } from '@mui/system';
import { makeStyles } from '@mui/styles';
import './customized-dialog.module.less';
import { forwardRef, ReactElement, ReactNode } from 'react';
import { TransitionProps } from '@mui/material/transitions';


interface StyleProps {
  width: number;
}

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    width: ({width}) => width,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
}));


/* eslint-disable-next-line */
export interface CustomizedDialogProps {
  open: boolean;
  children: ReactNode;
  width?: number;
}


function CustomizedDialog(props: CustomizedDialogProps) {
  const { children, open } = props;
  const { width=500 } = props;

  const styles = {
    width: width
  }

  const classes = useStyles(styles);

  const Transition = forwardRef(function Transition(
    props: TransitionProps & {
      children: ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="left" ref={ref} {...props} />;
  });

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      classes={{
        paper: classes.dialog
      }}
    >
      {children}
    </Dialog>
  )
}


export default CustomizedDialog;
