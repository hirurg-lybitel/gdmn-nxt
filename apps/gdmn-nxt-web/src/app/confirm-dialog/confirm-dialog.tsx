import './confirm-dialog.module.less';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import useStyles from './styles';

export interface ConfirmDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onConfirm: (value: any) => void;
  title?: string;
  text?: string;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const {open, setOpen, onConfirm, text, title} = props;

  const classes = useStyles();

  return (
    <Dialog open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{text}</DialogContent>
      <DialogActions className={classes.dialogAction}>
        <Button
          className={classes.button}
          onClick={() => setOpen(false)}
          variant="contained"
          color="primary"
        >
          Нет
        </Button>
        <Button
          className={classes.button}
          onClick={ () => {
            setOpen(false);
            onConfirm({});
          }}
          variant="contained"
          color="success"
        >
          Да
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
