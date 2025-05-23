import { IUserGroup } from '@gsbelarus/util-api-types';
import { Box, Button, DialogActions, DialogContent, DialogTitle, Stack, TextField, FormControlLabel, Checkbox } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, useFormik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import * as yup from 'yup';
import styles from './user-group-edit.module.less';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import Confirmation from '@gdmn-nxt/helpers/confirmation';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';

const useStyles = makeStyles(() => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    minWidth: 430,
    maxWidth: '100%',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  button: {
    width: '120px',
  },
}));

export interface UserGroupEditProps {
  open: boolean;
  userGroup?: IUserGroup;
  onSubmit: (userGroup: IUserGroup, deleting: boolean) => void;
  onCancel: () => void;
  onClose: () => void;
}

export function UserGroupEdit(props: UserGroupEditProps) {
  const { open, userGroup } = props;
  const { onSubmit, onCancel, onClose } = props;

  const classes = useStyles();

  const initValue: IUserGroup = {
    ID: userGroup?.ID ?? -1,
    NAME: userGroup?.NAME ?? '',
    DESCRIPTION: userGroup?.DESCRIPTION ?? '',
    REQUIRED_2FA: userGroup?.REQUIRED_2FA ?? false
  };

  const formik = useFormik<IUserGroup>({
    enableReinitialize: true,
    initialValues: {
      ...userGroup,
      ...initValue
    },
    validationSchema: yup.object().shape({
      NAME: yup
        .string()
        .required('')
        .max(40, 'Слишком длинное наименование'),
      DESCRIPTION: yup.string().max(260, 'Слишком длинное описание'),
    }),
    onSubmit: (values) => {
      onSubmit(values, false);
    }
  });

  const disableSubmitOnEnter = (e: any) => {
    e.key === 'Enter' && e.preventDefault();
  };

  const onDeleteClick = () => {
    onSubmit(formik.values, true);
  };

  useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <EditDialog
      open={open}
      onClose={onClose}
      form="mainForm"
      title={userGroup ? `Редактирование: ${userGroup.NAME}` : 'Добавление группы'}
      confirmation={formik.dirty}
      onDeleteClick={onDeleteClick}
      deleteButton={!!userGroup}
      deleteConfirmText={`Вы действительно хотите удалить группу ${userGroup?.NAME}?`}
    >
      <FormikProvider value={formik}>
        <Form
          id="mainForm"
          onSubmit={formik.handleSubmit}
        >
          <Stack direction="column" spacing={2}>
            <TextField
              label="Наименование"
              type="text"
              required
              autoFocus
              name="NAME"
              onKeyDown={disableSubmitOnEnter}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.NAME}
              helperText={formik.errors.NAME}
            />
            <TextField
              label="Описание"
              type="text"
              name="DESCRIPTION"
              multiline
              minRows={4}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.DESCRIPTION}
              helperText={formik.errors.DESCRIPTION}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.REQUIRED_2FA}
                  name="REQUIRED_2FA"
                />
              }
              onChange={formik.handleChange}
              label="Обязательная двухфакторная аутентификация"
            />
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}

export default UserGroupEdit;
