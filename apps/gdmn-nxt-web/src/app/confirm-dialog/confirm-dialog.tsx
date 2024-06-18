import './confirm-dialog.module.less';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Slide } from '@mui/material';
import useStyles from './styles';
import { forwardRef, ReactElement, Ref } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import ReactMarkdown from 'react-markdown';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>,
) {
  return <Slide
    direction="down"
    ref={ref}
    {...props}
  />;
});


export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  text?: string;
  dangerous?: boolean;
  confirmClick?: () => void;
  cancelClick?: () => void;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, text = '', title, dangerous = false } = props;
  const { confirmClick, cancelClick } = props;

  const classes = useStyles();

  const handleOnClose = (event: object, reason: string) => {
    if (reason === 'escapeKeyDown') cancelClick && cancelClick();
  };

  return (
    <Dialog
      open={open}
      aria-label="confirmation"
      TransitionComponent={Transition}
      onClose={handleOnClose}
      PaperProps={{
        style: {
          maxWidth: '400px'
        }
      }}
    >
      <DialogTitle className={classes.dialogTitle}>{title}</DialogTitle>
      <DialogContent dividers>
        <ReactMarkdown components={{ p: 'div' }}>
          {/** line break is a double space */}
          {text.replace('<br>', '  ')}
        </ReactMarkdown>
      </DialogContent>
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
