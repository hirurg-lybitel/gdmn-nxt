import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import './confirm-dialog.module.less';

export interface ConfirmDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onConfirm: () => void;
  title?: string;
  text?: string;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const {open, setOpen, onConfirm, text, title} = props;

  return (
    <Dialog open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{text}</DialogContent>
      <DialogActions>
        <Button
          onClick={() => setOpen(false)}
          variant="contained"
          color="primary"
        >
          Нет
        </Button>
        <Button
          onClick={ () => {
            setOpen(false);
            onConfirm();
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
