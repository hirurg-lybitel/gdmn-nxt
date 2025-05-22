import { Box, Button, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useCallback, useEffect } from 'react';
import styles from './projectTypeEdit.module.less';
import { IProjectType, Permissions } from '@gsbelarus/util-api-types';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';


export interface ProjectTypeEditProps {
  open: boolean;
  projectType?: IProjectType;
  onSubmit: (projectType: IProjectType, isDelete: boolean) => void;
  onCancelClick: () => void;
};

export function ProjectTypeEdit(props: ProjectTypeEditProps) {
  const { open, projectType } = props;
  const { onSubmit, onCancelClick } = props;
  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);
  const initValue: IProjectType = {
    ID: projectType?.ID || -1,
    name: projectType?.name || '',
    parent: projectType?.parent
  };

  const formik = useFormik<IProjectType>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue,
      ...projectType
    },
    validationSchema: yup.object().shape({
      name: yup.string().required('')
        .max(30, 'Слишком длинное наименование'),
    }),
    onSubmit: (value) => {
      formik.resetForm();
      onSubmit(formik.values, false);
    }
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const handleOnClose = useCallback(() => onCancelClick(), [onCancelClick]);

  const handleDelete = () => {
    onSubmit(formik.values, true);
  };

  return (
    <EditDialog
      open={open}
      onClose={handleOnClose}
      confirmation={formik.dirty}
      title={projectType ? `Редактирование типа проекта: ${projectType.name}` : 'Создание типа проекта'}
      deleteButton={formik.values.ID !== -1 && userPermissions?.['time-tracking/projectTypes']?.DELETE}
      deleteButtoHint={'Удаление типа проекта'}
      onDeleteClick={handleDelete}
      form="projectTypeEditForm"
    >
      <FormikProvider value={formik}>
        <Form
          style={{ height: '100%' }}
          id="projectTypeEditForm"
          onSubmit={formik.handleSubmit}
        >
          <Stack spacing={2}>
            <TextField
              style={{ width: '100%' }}
              label="Наименование"
              type="text"
              required
              autoFocus
              name="name"
              onChange={formik.handleChange}
              value={formik.values.name}
              error={getIn(formik.touched, 'name') && Boolean(getIn(formik.errors, 'name'))}
              helperText={getIn(formik.touched, 'name') && getIn(formik.errors, 'name')}
            />
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}

export default ProjectTypeEdit;
