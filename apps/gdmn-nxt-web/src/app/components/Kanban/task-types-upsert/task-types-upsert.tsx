import { ITaskType } from '@gsbelarus/util-api-types';
import styles from './task-types-upsert.module.less';
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField } from '@mui/material';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import DeleteIcon from '@mui/icons-material/Delete';

export interface TaskTypesUpsertProps {
  open: boolean;
  taskType?: ITaskType;
  onSubmit: (taskType: ITaskType) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
}

export function TaskTypesUpsert(props: TaskTypesUpsertProps) {
  const { open, taskType } = props;
  const { onSubmit, onCancel, onDelete } = props;

  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const initValue: ITaskType = {
    ID: taskType?.ID || 0,
    NAME: taskType?.NAME || '',
    DESCRIPTION: taskType?.DESCRIPTION || '',
  };

  const formik = useFormik<ITaskType>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...taskType,
      ...initValue
    },
    validationSchema: yup.object().shape({
      NAME: yup
        .string()
        .required('')
        .max(60, 'Слишком длинное наименование'),
    }),
    onSubmit: (value) => {
      setDeleting(false);
      if (!confirmOpen) {
        setConfirmOpen(true);
        return;
      };
      setConfirmOpen(false);
    }
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleClose = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleDeleteClick = useCallback(() => {
    setDeleting(true);
    setConfirmOpen(true);
  }, []);

  const handleConfirmOkClick = useCallback((deleting: boolean) => () => {
    setConfirmOpen(false);
    deleting
      ? onDelete && onDelete(formik.values.ID)
      : onSubmit(formik.values);
  }, [formik.values]);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const handleFocus = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const lengthOfInput = e.target.value.length;
    return e.target.setSelectionRange(lengthOfInput, lengthOfInput);
  }, []);

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      title={deleting ? 'Удаление типа задач' : 'Сохранение'}
      text="Вы уверены, что хотите продолжить?"
      dangerous={deleting}
      confirmClick={handleConfirmOkClick(deleting)}
      cancelClick={handleConfirmCancelClick}
    />
  , [confirmOpen, deleting]);

  return (
    <CustomizedDialog
      open={open}
      onClose={handleClose}
      width={500}
    >
      <DialogTitle>
        {taskType ? `Редактирование: ${taskType.NAME}` : 'Добавление типа задачи'}
      </DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
          <Form id="taskType" onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Наименование"
                type="text"
                multiline
                minRows={1}
                fullWidth
                required
                autoFocus
                onFocus={handleFocus}
                name="NAME"
                onChange={formik.handleChange}
                value={formik.values.NAME}
                error={getIn(formik.touched, 'NAME') && Boolean(getIn(formik.errors, 'NAME'))}
                helperText={getIn(formik.touched, 'NAME') && getIn(formik.errors, 'NAME')}
              />
              <TextField
                label="Описание"
                type="text"
                multiline
                minRows={2}
                fullWidth
                onFocus={handleFocus}
                name="NAME"
                onChange={formik.handleChange}
                value={formik.values.DESCRIPTION}
                error={getIn(formik.touched, 'DESCRIPTION') && Boolean(getIn(formik.errors, 'DESCRIPTION'))}
                helperText={getIn(formik.touched, 'DESCRIPTION') && getIn(formik.errors, 'DESCRIPTION')}
              />
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions className={styles.DialogActions}>
        {
          taskType &&
          <IconButton onClick={handleDeleteClick} size="small">
            <DeleteIcon />
          </IconButton>
        }
        <Box flex={1}/>
        <Button
          className={styles.Button}
          onClick={handleCancel}
          variant="text"
          color="primary"
        >
             Отменить
        </Button>
        <Button
          className={styles.Button}
          type="submit"
          form="taskType"
          variant="contained"
        >
             Сохранить
        </Button>
      </DialogActions>
      {memoConfirmDialog}
    </CustomizedDialog>
  );
}

export default TaskTypesUpsert;
