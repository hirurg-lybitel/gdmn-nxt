import './customer-edit.module.less';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField
 } from '@mui/material';
 import {
  Theme
 } from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { IBaseContact, IWithID } from '@gsbelarus/util-api-types';
import ConfirmDialog from '../confirm-dialog/confirm-dialog';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      minWidth: '50%',
    },
  }),
);


export interface CustomerEditProps {
  open: boolean;
  customer: (IBaseContact & IWithID) | null;
  onSaveClick: () => void;
  onCancelClick: () => void;
  onDeleteClick?: () => void;
}

export function CustomerEdit(props: CustomerEditProps) {
  const { open, customer } = props;
  const { onSaveClick, onCancelClick, onDeleteClick } = props;

  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const classes = useStyles();

  if (!customer) return (<div></div>);

  return (
    <Dialog classes={{ paper: classes.dialog}} open={open}>
      <DialogTitle>
        Редактирование: {customer.NAME}
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="column" spacing={3}>
          <TextField
            label="Наименование"
            type="text"
            required
            defaultValue={customer.NAME}/>
          <TextField
            label="Телефон"
            defaultValue={customer.PHONE}/>
          <TextField
            label="Email"
            type="email"
            defaultValue={customer.EMAIL}/>
        </Stack>

      </DialogContent>
      <DialogActions>
        <IconButton>
            <DeleteIcon />
        </IconButton>
        <Divider orientation="vertical" flexItem />
        <Button
          onClick={onCancelClick}
          variant="contained"
          color="primary"
        >
            Отменить
        </Button>
        <Button
          onClick={() => {
            setConfirmOpen(true);
          }}
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
        >
            OK
        </Button>

      </DialogActions>
      <ConfirmDialog
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title="Вы уверены?"
        onConfirm={onSaveClick}
      />
    </Dialog>
  );
}

export default CustomerEdit;
