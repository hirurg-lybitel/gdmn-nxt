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
import { IContactWithID } from '@gsbelarus/util-api-types';
import ConfirmDialog from '../confirm-dialog/confirm-dialog';
import React from 'react';
import { useFormik } from 'formik';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      minWidth: '50%',
    },
  }),
);

export interface CustomerEditProps {
  open: boolean;
  customer: IContactWithID | null;
  onSubmit: (arg1: IContactWithID, arg2: boolean) => void;
  onSaveClick?: () => void;
  onCancelClick: () => void;
  onDeleteClick?: () => void;
}

export function CustomerEdit(props: CustomerEditProps) {
  const { open, customer } = props;
  const { onCancelClick, onDeleteClick, onSubmit } = props;

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const classes = useStyles();

  const initValue: IContactWithID = {
    ID: customer?.ID || 0,
    NAME: customer?.NAME || '',
  }

  const formik = useFormik<IContactWithID>({
    enableReinitialize: true,
    initialValues: {
      ...customer,
      ...initValue
    },
    onSubmit: (values) => {
      setConfirmOpen(false);
      onSubmit(values, deleting);
    },

  });

  const handleDeleteClick = () => {
    setDeleting(true);
    setConfirmOpen(true);
  };

  return (
    <Dialog classes={{ paper: classes.dialog}} open={open}>
      <DialogTitle>
        {customer ? `Редактирование: ${customer.NAME}` : 'Добавление'}
      </DialogTitle>
      <DialogContent dividers>
        <form id="mainForm" onSubmit={formik.handleSubmit}>
          <Stack direction="column" spacing={3}>
            <TextField
              label="Наименование"
              type="text"
              required
              name="NAME"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.NAME}
            />
            <TextField
              label="Телефон"
              type="text"
              name="PHONE"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.PHONE}
            />
            <TextField
              label="Email"
              type="email"
              name="EMAIL"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.EMAIL}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <IconButton onClick={handleDeleteClick}>
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
          //type="submit"
          form="mainForm"
          onClick={() => {
            setDeleting(false);
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
        title="Подтвердите действие"
        text="Вы уверены что хотите продолжить?"
        onConfirm={formik.handleSubmit}
      />
    </Dialog>

  );
}

export default CustomerEdit;
