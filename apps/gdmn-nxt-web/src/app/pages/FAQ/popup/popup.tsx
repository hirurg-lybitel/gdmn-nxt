import { useCallback } from 'react';
import { Stack } from '@mui/material';
import style from './popup.module.less';
import TextField from '@mui/material/TextField';
import { fullFaq } from '../../../features/FAQ/faqApi';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import MarkdownTextfield from '@gdmn-nxt/components/Styled/markdown-text-field/markdown-text-field';

interface PopupProps {
  close: () => void;
  open: boolean;
  faq?: fullFaq,
  addFaq?: (values: fullFaq) => void,
  editFaq?: (values: fullFaq) => void,
  deleteFaq?: (values: fullFaq) => void;
}

interface IShippingFields {
  ID: number,
  USR$QUESTION: string,
  USR$ANSWER: string;
}

export default function Popup({ close, open, faq, addFaq, editFaq, deleteFaq }: Readonly<PopupProps>) {
  const formik = useFormik<IShippingFields>({
    enableReinitialize: true,
    validateOnBlur: false,
    validateOnChange: false,
    initialValues: {
      ID: faq?.ID || -1,
      USR$QUESTION: faq?.USR$QUESTION || '',
      USR$ANSWER: faq?.USR$ANSWER || ''
    },
    validationSchema: yup.object().shape({
      USR$QUESTION: yup.string().required('Не указан вопрос'),
      USR$ANSWER: yup.string().required('Не указан ответ'),
    }),
    onSubmit: (values) => {
      close();
      handleClose();
      if (!faq?.ID) {
        addFaq?.(formik.values);
        return;
      }
      editFaq?.(formik.values);
    },
    onReset: (values) => {
    }
  });

  const handleClose = useCallback(() => {
    close();
    formik.resetForm();
  }, [close, formik]);

  const handleValueChange = async (name: string, value: string) => {
    await formik.setFieldValue(name, value);
    if ((formik.errors as any)[name]) {
      await formik.validateField(name);
    };
  };

  const handleDelete = () => {
    deleteFaq?.(formik.values);
  };

  const userPermissions = usePermissions();

  return (
    <EditDialog
      open={open}
      onClose={handleClose}
      confirmation={formik.dirty}
      title={faq?.ID ? 'Добавить новый вопрос с ответом' : 'Изменить вопрос с ответом'}
      onDeleteClick={handleDelete}
      deleteButton={userPermissions?.faq.POST}
      form="FAQForm"
    >
      <FormikProvider value={formik}>
        <Form
          style={{
            minWidth: 0, display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}
          onSubmit={formik.handleSubmit}
          id={'FAQForm'}
        >
          <Stack spacing={2} flex={1}>
            <TextField
              rows={4}
              id="outlined-textarea"
              label="Вопрос"
              placeholder="Вопрос"
              multiline
              value={formik.values.USR$QUESTION}
              onChange={(e) => handleValueChange('USR$QUESTION', e.target.value)}
              error={getIn(formik.touched, 'USR$QUESTION') && Boolean(getIn(formik.errors, 'USR$QUESTION'))}
              helperText={getIn(formik.touched, 'USR$QUESTION') && getIn(formik.errors, 'USR$QUESTION')}
            />
            <MarkdownTextfield
              label="Ответ"
              placeholder="Ответ"
              type="text"
              fullWidth
              required
              multiline
              rows={1}
              name="USR$ANSWER"
              fullHeight
              bottomHint
              smallHintBreakpoint="xs"
              smallButtonsBreakpoint="xs"
              value={formik.values.USR$ANSWER}
              onChange={(e) => handleValueChange('USR$ANSWER', e.target.value)}
              error={getIn(formik.touched, 'USR$ANSWER') && Boolean(getIn(formik.errors, 'USR$ANSWER'))}
              helperText={getIn(formik.touched, 'USR$ANSWER') && getIn(formik.errors, 'USR$ANSWER')}
            />
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}
