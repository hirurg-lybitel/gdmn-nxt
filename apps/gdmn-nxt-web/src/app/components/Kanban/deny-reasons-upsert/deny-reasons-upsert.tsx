import styles from './deny-reasons-upsert.module.less';
import { IDenyReason } from '@gsbelarus/util-api-types';
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import DeleteIcon from '@mui/icons-material/Delete';

export interface DenyReasonsUpsertProps {
  open: boolean;
  denyReason?: IDenyReason;
  onSubmit: (denyReason: IDenyReason) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
}

export function DenyReasonsUpsert(props: DenyReasonsUpsertProps) {
  const { open, denyReason } = props;
  const { onSubmit, onCancel, onDelete } = props;

  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const initValue: IDenyReason = {
    ID: denyReason?.ID || 0,
    NAME: denyReason?.NAME || '',
  };

  const formik = useFormik<IDenyReason>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...denyReason,
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

  const handleClose = useCallback((e: any, reason: string) => {
    if (reason === 'backdropClick') onCancel();
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
      title={deleting ? 'Удаление причины отказа' : 'Сохранение'}
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
        {denyReason ? `Редактирование: ${denyReason.NAME}` : 'Добавление причины отказа'}
      </DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
          <Form id="denyReason" onSubmit={formik.handleSubmit}>
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
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions className={styles.DialogActions}>
        {
          denyReason &&
          <IconButton onClick={handleDeleteClick} size="small" hidden>
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
          form="denyReason"
          variant="contained"
        >
             Сохранить
        </Button>
      </DialogActions>
      {memoConfirmDialog}
    </CustomizedDialog>
  );
}

export default DenyReasonsUpsert;
