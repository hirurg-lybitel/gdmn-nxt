import styles from './deal-source-upsert.module.less';
import { IDealSource } from '@gsbelarus/util-api-types';
import { Box, Button, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import { ChangeEvent, useCallback, useEffect } from 'react';
import * as yup from 'yup';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';

export interface DealSourceUpsertProps {
  open: boolean;
  dealSource?: IDealSource;
  onSubmit: (dealSource: IDealSource) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
}

export function DealSourceUpsert(props: DealSourceUpsertProps) {
  const { open, dealSource } = props;
  const { onSubmit, onCancel, onDelete } = props;

  const initValue: IDealSource = {
    ID: dealSource?.ID || 0,
    NAME: dealSource?.NAME || '',
  };

  const formik = useFormik<IDealSource>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...dealSource,
      ...initValue
    },
    validationSchema: yup.object().shape({
      NAME: yup
        .string()
        .required('')
        .max(60, 'Слишком длинное наименование'),
    }),
    onSubmit: (values) => {
      onSubmit(values);
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
    onDelete && onDelete(formik.values.ID);
  }, [formik.values.ID, onDelete]);

  const handleFocus = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const lengthOfInput = e.target.value.length;
    return e.target.setSelectionRange(lengthOfInput, lengthOfInput);
  }, []);

  return (
    <CustomizedDialog
      open={open}
      onClose={handleClose}
      confirmation={formik.dirty}
      width={500}
    >
      <DialogTitle>
        {dealSource ? `Редактирование: ${dealSource.NAME}` : 'Добавление источника заявок'}
      </DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
          <Form id="dealSource" onSubmit={formik.handleSubmit}>
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
          dealSource &&
          <ItemButtonDelete button onClick={handleDeleteClick} />
        }
        <Box flex={1}/>
        <ButtonWithConfirmation
          className={styles.Button}
          variant="outlined"
          color="primary"
          onClick={handleCancel}
          title="Внимание"
          text={'Изменения будут утеряны. Продолжить?'}
          confirmation={formik.dirty}
        >
          Отменить
        </ButtonWithConfirmation>
        <Button
          className={styles.Button}
          type="submit"
          form="dealSource"
          variant="contained"
        >
          Сохранить
        </Button>
      </DialogActions>
    </CustomizedDialog>
  );
}

export default DealSourceUpsert;
