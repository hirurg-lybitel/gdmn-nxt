import { IProjectNote } from '@gsbelarus/util-api-types';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import styles from './projectNotes.module.less';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import SendIcon from '@mui/icons-material/Send';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import { useCallback, useState } from 'react';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';
import ItemButtonCancel from '@gdmn-nxt/components/customButtons/item-button-cancel/item-button-cancel';
import ItemButtonSave from '@gdmn-nxt/components/customButtons/item-button-save/item-button-save';
import { ErrorTooltip } from '@gdmn-nxt/components/Styled/error-tooltip/error-tooltip';

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

  const handleDelete = useCallback((id: number) => {
    const newNotes = notes.filter(note => Number(note.ID) !== Number(id));
    onChange(newNotes);
  }, [notes, onChange]);

  const handleChange = useCallback((newNote: IProjectNote) => {
    const index = notes.findIndex(note => note.ID === newNote.ID);
    const newNotes = [...notes];
    newNotes[index] = newNote;
    console.log(newNotes);
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
            <CustomizedScrollBox style={{ flex: 1, marginTop: '20px' }}>
              {notes.map(note => (
                <CustomizedCard
                  key={note.ID}
                  sx={{ boxShadow: 3 }}
                  className={styles.messageContainer}
                >
                  <Item
                    note={note}
                    handleDelete={handleDelete}
                    onChange={handleChange}
                  />
                </CustomizedCard>
              ))}
            </CustomizedScrollBox>
          </Stack>
        </Form>
      </FormikProvider>
    </div>
  );
}

interface ItemProps {
  note: IProjectNote
  onChange: (note: IProjectNote) => void,
  handleDelete: (id: number) => void
}

const Item = ({ note, handleDelete, onChange }: ItemProps) => {
  const [focus, setFocus] = useState(false);
  const [edit, setEdit] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const onDelete = useCallback((id: number) => () => {
    handleDelete(id);
  }, [handleDelete]);

  const handleEdit = useCallback(() => {
    setError(null);
    setMessage(note.message);
    setEdit(true);
  }, [note.message]);

  const handleSave = useCallback(() => {
    if (message.trim() === '') {
      setError('Обязательное поле');
      return;
    }
    onChange({ ...note, message });
    setEdit(false);
  }, [message, note, onChange]);

  const handleCancel = useCallback(() => {
    setError(null);
    setEdit(false);
  }, []);

  return (
    <div
      className={styles.message}
      onMouseEnter={() => setFocus(true)}
      onMouseLeave={() => setFocus(false)}
    >
      {edit ?
        <ErrorTooltip open={true} title={error || ''}>
          <TextField
            autoFocus
            size="small"
            error={!!error}
            fullWidth
            multiline
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </ErrorTooltip>
        : note.message
      }
      <div style={{ display: (focus || edit) ? 'flex' : 'none' }}>
        {edit ?
          <>
            <ItemButtonSave onClick={handleSave}/>
            <ItemButtonCancel onClick={handleCancel}/>
          </>
          :
          <>
            <ItemButtonEdit onClick={handleEdit} color="primary"/>
            <ItemButtonDelete button onClick={onDelete(note.ID)}/>
          </>}
      </div>
    </div>
  );
};
