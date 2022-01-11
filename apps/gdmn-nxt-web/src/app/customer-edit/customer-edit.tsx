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
import { Formik, useFormik, Form, FormikHelpers } from 'formik';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      minWidth: '50%',
    },
  }),
);


export interface CustomerEditProps {
  open: boolean;
  customer: (IBaseContact & IWithID);
  onSubmit: (values: (IBaseContact & IWithID)) => void;
  onSaveClick?: () => void;
  onCancelClick: () => void;
  onDeleteClick?: () => void;
}

export function CustomerEdit(props: CustomerEditProps) {
  const { open, customer } = props;
  const { onSaveClick, onCancelClick, onDeleteClick, onSubmit } = props;

  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const classes = useStyles();

  const formik = useFormik<(IBaseContact & IWithID)>({
    enableReinitialize: true,
    initialValues: {
      ...customer,
    },
    onSubmit: (values) => {
      setConfirmOpen(false);
      onSubmit(values);
    },

  });


  if (!customer) return (<div></div>);

  return (
    <Dialog classes={{ paper: classes.dialog}} open={open}>
      <DialogTitle>
        Редактирование: {customer.NAME}
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
          //type="submit"
          form="mainForm"
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
        title="Подтвердите действие"
        text="Вы уверены что хотите продолжить?"
        onConfirm={formik.handleSubmit}
      />
    </Dialog>

  );
}

export default CustomerEdit;
