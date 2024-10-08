import './confirm-dialog.module.less';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Slide, IconButton, Box } from '@mui/material';
import useStyles from './styles';
import { forwardRef, ReactElement, Ref } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import ReactMarkdown from 'react-markdown';
import CloseIcon from '@mui/icons-material/Close';

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
  actions?: [string, string];
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    open,
    text = '',
    title,
    dangerous = false,
    actions = ['Нет', 'Да'],
  } = props;
  const { confirmClick, cancelClick } = props;

  const classes = useStyles();

  const handleOnClose = (event: object, reason: string) => {
    if (reason === 'escapeKeyDown') cancelClick && cancelClick();
  };

  const closeClick = () => cancelClick && cancelClick();

  return (
    <Dialog
      open={open}
      aria-label="confirmation"
      TransitionComponent={Transition}
      onClose={handleOnClose}
      PaperProps={{
        style: {
          width: '400px'
        }
      }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {title}
        <Box className={classes.closeButton}>
          <IconButton onClick={closeClick}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <ReactMarkdown components={{ p: 'div' }}>
          {/** line break is a double space */}
          {text.replace('<br>', '  ')}
        </ReactMarkdown>
      </DialogContent>
      <DialogActions>
        <Button
          className={classes.button}
          onClick={cancelClick}
          variant="outlined"
          color="primary"
        >
          {actions[0]}
        </Button>
        <Button
          className={classes.button}
          type="submit"
          onClick={confirmClick}
          variant="contained"
          color={dangerous ? 'error' : 'primary'}
        >
          {actions[1]}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
