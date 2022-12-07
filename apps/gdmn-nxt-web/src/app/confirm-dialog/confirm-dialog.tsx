import './confirm-dialog.module.less';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Slide } from '@mui/material';
import useStyles from './styles';
import { forwardRef, ReactElement, Ref, useMemo } from 'react';
import { TransitionProps } from '@mui/material/transitions';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
});


export interface ConfirmDialogProps {
  open: boolean;
  setOpen?: (value: boolean) => void;
  onConfirm?: (value: any) => void;
  title?: string;
  text?: string;
  dangerous?: boolean;
  confirmClick?: () => void;
  cancelClick?: () => void;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, setOpen, onConfirm, text, title, dangerous = false } = props;
  const { confirmClick, cancelClick } = props;

  const classes = useStyles();

  return (
    <Dialog open={open} TransitionComponent={Transition}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{text}</DialogContent>
      <DialogActions className={classes.dialogAction}>
        <Button
          className={classes.button}
          onClick={cancelClick}
          variant="outlined"
          color="primary"
        >
          Нет
        </Button>
        <Button
          className={classes.button}
          type="submit"
          onClick={confirmClick}
          variant="contained"
          color={dangerous ? 'error' : 'primary'}
        >
          Да
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
