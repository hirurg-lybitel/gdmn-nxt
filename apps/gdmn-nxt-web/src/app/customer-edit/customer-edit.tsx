import './customer-edit.module.less';
import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Box
 } from '@mui/material';
 import {
  Theme
 } from '@mui/material';
import { makeStyles } from '@mui/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { IContactWithLabels, ILabelsContact } from '@gsbelarus/util-api-types';
import ConfirmDialog from '../confirm-dialog/confirm-dialog';
import { useState } from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { hierarchySelectors } from '../features/customer/customerSlice';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useGetGroupsQuery } from '../features/contact/contactGroupApi';


const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    minWidth: '50%',
  },
  dialogAction: {
    paddingRight: '3%',
    paddingLeft: '3%',
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
  customer: IContactWithLabels | null;
  onSubmit: (arg1: IContactWithLabels, arg2: boolean) => void;
  onSaveClick?: () => void;
  onCancelClick: () => void;
  onDeleteClick?: () => void;
}

export function CustomerEdit(props: CustomerEditProps) {
  const { open, customer } = props;
  const { onCancelClick, onDeleteClick, onSubmit } = props;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const allHierarchy = useSelector(hierarchySelectors.selectAll);
  const { data: groups } = useGetGroupsQuery();


  const classes = useStyles();

  const initValue: IContactWithLabels = {
    ID: customer?.ID || 0,
    NAME: customer?.NAME || '',
    PHONE: customer?.PHONE || '',
    EMAIL: customer?.EMAIL || '',
    PARENT: customer?.PARENT || undefined,
    labels: customer?.labels || []
  }

  const formik = useFormik<IContactWithLabels>({
    enableReinitialize: true,
    initialValues: {
      ...customer,
      ...initValue
    },
    validationSchema: yup.object().shape({
      NAME:  yup.string().required('').max(80, 'Слишком длинное наименование'),
      EMAIL: yup.string().matches(/@./),
      PARENT: yup.string().required('')
    }),
    onSubmit: (values) => {
      //console.log('values', values);
      setConfirmOpen(false);
      onSubmit(values, deleting);
    },
  });

  const handleDeleteClick = () => {
    setDeleting(true);
    setConfirmOpen(true);
  };

  const handleCancelClick = () => {
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
                autoFocus
                name="NAME"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.NAME}
                helperText={formik.errors.NAME}
              />
              <Autocomplete
                options={groups || []}
                getOptionLabel={option => option.NAME}
                value={groups?.filter(el => el.ID === formik.values.PARENT)[0] || null}
                onChange={(e, value) => {
                  formik.setFieldValue(
                    "PARENT",
                    value ? value.ID : initValue.PARENT
                  );
                }}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.ID}>
                      {option.NAME}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    key={params.id}
                    label="Папка"
                    className={classes.helperText}
                    type="text"
                    required
                    name="PARENT"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.PARENT}
                    helperText={formik.errors.PARENT}
                    placeholder="Выберите папку"
                  />
                )}
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
              <Autocomplete
                multiple
                limitTags={2}
                disableCloseOnSelect
                onChange={(e, value) => {
                  formik.setFieldValue(
                    "labels",
                    value
                      ? value.map((el) => {
                          return {ID: 0, CONTACT: formik.values.ID, LABEL: el.ID} as ILabelsContact
                        })
                      : initValue.labels
                  );
                }}
                value={
                  groups
                    ?.filter(hierarchy => formik.values.labels?.find(label => label.LABEL === hierarchy.ID && label.CONTACT === formik.values.ID))
                }
                options={groups || []}
                getOptionLabel={opt => opt.NAME}
                renderOption={(props, option, { selected }) => (
                  <li {...props} key={option.ID}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.NAME}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Метки"
                    placeholder="Выберите метки"
                  />
                )}
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
          variant="text"
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
          //color="warning"
          //color="success"
          // startIcon={<SaveIcon />}
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
