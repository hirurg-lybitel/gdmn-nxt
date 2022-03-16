import { IContactHierarchy } from '@gsbelarus/util-api-types';
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, useFormik } from 'formik';
import { useState } from 'react';
import * as yup from 'yup';
import ConfirmDialog from '../confirm-dialog/confirm-dialog';
import { useGetGroupsQuery } from '../features/contact/contactGroupApi';
import NestedSets from 'nested-sets-tree';
import './contact-group-edit.module.less';

const useStyles = makeStyles((theme) => ({
  dialog: {
    minWidth: '30%',
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

export interface IContactGroupEditProps {
  group: IContactHierarchy | null;
  tree?: NestedSets;
  onSubmit: (arg1: IContactHierarchy) => void;
  onCancel: () => void;
}

export function ContactGroupEditForm(props: IContactGroupEditProps) {
  const {group, tree} = props;
  const {onSubmit, onCancel} = props;

  const classes = useStyles();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: groups } = useGetGroupsQuery();



  const initValue: IContactHierarchy = {
    ID: group?.ID || 0,
    PARENT: group?.PARENT || undefined,
    LB: group?.LB || 0,
    RB: group?.RB || 0,
    NAME: group?.NAME || ''
  }

  const formik = useFormik<IContactHierarchy>({
    enableReinitialize: true,
    initialValues: {
      ...group,
      ...initValue
    },
    validationSchema: yup.object().shape({
      NAME:  yup.string().required('').max(80, 'Слишком длинное наименование')
    }),
    onSubmit: (values) => {
      setConfirmOpen(false);
      onSubmit(values);
    },
  });

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleCancelClick = () => {
    formik.resetForm();
    onCancel();
  };

  return (
    <Dialog classes={{ paper: classes.dialog}} open={true}>
      <DialogTitle>
        {group ? `Редактирование: ${group.NAME}` : 'Новая папка'}
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
                options={groups?.filter(group => group.ID !== formik.values.ID) || []}
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
                    name="PARENT"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.PARENT}
                    helperText={formik.errors.PARENT}
                    placeholder="Выберите папку"
                  />
                )}
              />
          </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
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
              setConfirmOpen(formik.isValid);
            }}
            variant="contained"
            color="success"
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

export default ContactGroupEditForm;
