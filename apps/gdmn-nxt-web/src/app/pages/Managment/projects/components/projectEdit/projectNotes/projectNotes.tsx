import { IProjectNote } from '@gsbelarus/util-api-types';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import styles from './projectNotes.module.less';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import SendIcon from '@mui/icons-material/Send';

interface IProjectNotesProps {
  notes?: IProjectNote[],
  onChange: (notes: IProjectNote[]) => void
}
export default function ProjectNotes({ notes = [], onChange }: IProjectNotesProps) {
  const initValue: IProjectNote = {
    ID: -1,
    message: ''
  };

  const formik = useFormik<IProjectNote>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue
    },
    validationSchema: yup.object().shape({
      message: yup.string().required('Обязательное поле')
    }),
    onSubmit: (value) => {
      onChange([...notes, ...[formik.values]]);
      formik.resetForm();
    }
  });

  console.log(formik.errors);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <FormikProvider value={formik}>
        <Form
          style={{ height: '100%' }}
          id="notesForm"
          onSubmit={formik.handleSubmit}
        >
          <Stack
            direction="column"
            flex="1"
            display="flex"
            spacing={1}
            height={'100%'}
          >
            <TextField
              rows={4}
              style={{
                borderRadius: '15px',
                width: '100%',
                fontSize: '20px !important'
              }}
              name="message"
              onChange={formik.handleChange}
              value={formik.values.message}
              placeholder="Заметка"
              error={formik.touched.message && !!formik.errors.message}
              multiline
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="rgb(205, 92, 92)" fontSize={'12px'}>{formik.touched.message && formik.errors.message}</Typography>
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                form="notesForm"
                onClick={() => formik.handleSubmit()}
              >
                Добавить
              </Button>
            </div>
            <CustomizedScrollBox style={{ flex: 1, marginTop: '12px' }}>
              {notes.map(note => (
                <CustomizedCard
                  key={note.ID}
                  sx={{ boxShadow: 3 }}
                  className={styles.messageContainer}
                >
                  <div className={styles.message}>
                    {note.message}
                  </div>
                </CustomizedCard>
              ))}
            </CustomizedScrollBox>
          </Stack>
        </Form>
      </FormikProvider>
    </div>
  );
}
