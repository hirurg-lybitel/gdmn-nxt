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
    <CustomizedDialog
      open={open}
      onClose={handleOnClose}
      confirmation={formik.dirty}
      minWidth={500}
    >
      <DialogTitle>
        {projectType ? `Редактирование типа проекта: ${projectType.name}` : 'Создание типа проекта'}
      </DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
          <Form
            style={{ height: '100%' }}
            id="mainForm"
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
      </DialogContent>
      <DialogActions>
        <PermissionsGate actionAllowed={userPermissions?.['time-tracking/projectTypes']?.DELETE}>
          <ItemButtonDelete
            title={'Удаление типа проекта'}
            button
            onClick={handleDelete}
          />
        </PermissionsGate>
        <Box flex={1}/>
        <ButtonWithConfirmation
          className={styles.button}
          onClick={handleOnClose}
          variant="outlined"
          color="primary"
          title="Внимание"
          text={'Изменения будут утеряны. Продолжить?'}
          confirmation={formik.dirty}
        >
            Отменить
        </ButtonWithConfirmation>
        <Button
          className={styles.button}
          variant="contained"
          form="mainForm"
          type="submit"
        >
            Сохранить
        </Button>
      </DialogActions>
    </CustomizedDialog>
  );
}

export default ProjectTypeEdit;
