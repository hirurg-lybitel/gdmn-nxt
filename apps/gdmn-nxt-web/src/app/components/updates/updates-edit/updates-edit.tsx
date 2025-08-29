import { IUpdateHistory } from '@gsbelarus/util-api-types';
import styles from './updates-edit.module.less';
import { ChangeEvent, useCallback, useEffect, useMemo } from 'react';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import { Stack, TextField } from '@mui/material';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';
import MarkdownTextfield from '@gdmn-nxt/components/Styled/markdown-text-field/markdown-text-field';

export interface UpdatesEditProps {
  open: boolean;
  update?: IUpdateHistory;
  onSubmit: (update: IUpdateHistory) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
}

export function UpdatesEdit(props: Readonly<UpdatesEditProps>) {
  const { open, update } = props;
  const { onSubmit, onCancel, onDelete } = props;

  const userPermission = usePermissions();

  const currentDate = useMemo(() => new Date(), []);

  const initValue: IUpdateHistory = {
    ID: update?.ID ?? -1,
    VERSION: update?.VERSION ?? '',
    CHANGES: update?.CHANGES ?? '',
    ONDATE: update?.ONDATE ?? currentDate
  };

  const formik = useFormik<IUpdateHistory>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...update,
      ...initValue
    },
    validationSchema: yup.object().shape({
      VERSION: yup
        .string()
        .required('')
        .test('', 'Не соответсвует формату <major.minor.patch>', (value = '') => {
          const regEx = new RegExp(/^\d+(\.\d+){2}$/);
          return regEx.test(value);
        })
    }),
    onSubmit: (values) => {
      onSubmit(values);
    }
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

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
    <EditDialog
      open={open}
      onClose={handleClose}
      confirmation={formik.dirty}
      title={update ? `Редактирование: ${update.VERSION}` : 'Добавление новой версии'}
      deleteButton={update && userPermission?.updates.DELETE}
      onDeleteClick={handleDeleteClick}
      form="updates"
    >
      <FormikProvider value={formik}>
        <Form
          style={{ minWidth: 0 }}
          id="updates"
          onSubmit={formik.handleSubmit}
          className={styles.formContent}
        >
          <Stack spacing={2} flex={1}>
            <TextField
              label="Номер версии"
              type="text"
              fullWidth
              required
              autoFocus
              onFocus={handleFocus}
              name="VERSION"
              onChange={formik.handleChange}
              value={formik.values.VERSION}
              error={getIn(formik.touched, 'VERSION') && Boolean(getIn(formik.errors, 'VERSION'))}
              helperText={getIn(formik.touched, 'VERSION') && getIn(formik.errors, 'VERSION')}
            />
            <MarkdownTextfield
              label="Описание"
              type="text"
              fullWidth
              required
              multiline
              rows={1}
              name="CHANGES"
              fullHeight
              bottomHint
              smallHintBreakpoint="xs"
              smallButtonsBreakpoint="xs"
              onChange={formik.handleChange}
              value={formik.values.CHANGES}
              error={getIn(formik.touched, 'CHANGES') && Boolean(getIn(formik.errors, 'CHANGES'))}
              helperText={getIn(formik.touched, 'CHANGES') && getIn(formik.errors, 'CHANGES')}
            />
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}

export default UpdatesEdit;
