import { IProjectNote } from '@gsbelarus/util-api-types';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import styles from './projectNotes.module.less';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import SendIcon from '@mui/icons-material/Send';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import { useCallback, useState } from 'react';

interface IProjectNotesProps {
  notes?: IProjectNote[],
  onChange: (notes: IProjectNote[]) => void
}
export default function ProjectNotes({ notes = [], onChange }: IProjectNotesProps) {
  const [lastId, setLastId] = useState(1);

  const initValue: IProjectNote = {
    ID: lastId,
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
      setLastId(lastId + 1);
      formik.resetForm();
    }
  });

  const handleDelete = useCallback((id: number) => () => {
    const newNotes = notes.filter(note => Number(note.ID) !== Number(id));
    onChange(newNotes);
  }, [notes, onChange]);

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
                    <ItemButtonDelete button onClick={handleDelete(note.ID)}/>
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
