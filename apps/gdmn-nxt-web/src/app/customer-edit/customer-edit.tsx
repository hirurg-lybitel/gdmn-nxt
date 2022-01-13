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
import WarningIcon from '@mui/icons-material/Warning';
import { IContactWithID } from '@gsbelarus/util-api-types';
import ConfirmDialog from '../confirm-dialog/confirm-dialog';
import React from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';


const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    minWidth: '50%',
  },
  dialogAction: {
    marginLeft: '2%',
    marginRight: '2%',
    //paddingRigth: 100,
  },
  helperText: {
    '& p':{
      color:'#ec5555',
    },
  },
  button: {
    width: '120px',
  },
}));

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
    PHONE: customer?.PHONE || '',
    EMAIL: customer?.EMAIL || '',
  }

  const formik = useFormik<IContactWithID>({
    enableReinitialize: true,
    initialValues: {
      ...customer,
      ...initValue
    },
    validationSchema: yup.object().shape({
      NAME:  yup.string().required('').max(80, 'Слишком длинное наименование'),
      EMAIL: yup.string().matches(/@./),
    }),
    onSubmit: (values) => {
      setConfirmOpen(false);
      onSubmit(values, deleting);
    },
  });

  const handleDeleteClick = () => {
    setDeleting(true);
    setConfirmOpen(true);
  };

  const handleCancelClick = () => {
    console.log('handleCancelClick');
    setDeleting(false);
    formik.resetForm();
    onCancelClick();
  };

  return (
    <Dialog classes={{ paper: classes.dialog}} open={open}>
      <DialogTitle>
        {customer ? `Редактирование: ${customer.NAME}` : 'Добавление'}
      </DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
          <Form id="mainForm" onSubmit={formik.handleSubmit}>
            <Stack direction="column" spacing={3}>
              <TextField
                label="Наименование"
                className={classes.helperText}
                type="text"
                required
                name="NAME"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.NAME}
                helperText={formik.errors.NAME}
              />
              <TextField
                label="Телефон"
                className={classes.helperText}
                type="text"
                name="PHONE"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.PHONE}
                helperText={formik.errors.PHONE}
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
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions className={classes.dialogAction}>
        <IconButton onClick={handleDeleteClick} size="large">
            <DeleteIcon />
        </IconButton>
        <Divider orientation="vertical" flexItem />
        <Button
          className={classes.button}
          onClick={handleCancelClick}
          variant="contained"
          color="primary"
        >
            Отменить
        </Button>
        <Button
          className={classes.button}
          type={!formik.isValid ? "submit" : "button"}
          form="mainForm"
          onClick={() => {
            setDeleting(false);
            setConfirmOpen(formik.isValid);
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
        text="Вы уверены, что хотите продолжить?"
        onConfirm={formik.handleSubmit}
      />
    </Dialog>
  );
}

export default CustomerEdit;
