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

  const [note, setNote] = useState<IProjectNote>(initValue);
  const [errors, setErrors] = useState<{[key: string]: string}>();
  const [isTouched, setIsTouched] = useState(false);

  const validate = useCallback((values: IProjectNote) => {
    let withoutErrors = true;
    if (values.message.trim() === '') {
      setErrors({ ...errors, message: 'обязательное поле' });
      withoutErrors = false;
    } else {
      const newErrors = { ...errors };
      delete newErrors.message;
      setErrors(newErrors);
    }
    return withoutErrors;
  }, [errors]);

  const handleDelete = useCallback((id: number) => {
    const newNotes = notes.filter(note => Number(note.ID) !== Number(id));
    onChange(newNotes);
  }, [notes, onChange]);

  const handleChange = useCallback((newNote: IProjectNote) => {
    const index = notes.findIndex(note => note.ID === newNote.ID);
    const newNotes = [...notes];
    newNotes[index] = newNote;
    onChange(newNotes);
  }, [notes, onChange]);

  const messageChange = useCallback((e: any) => {
    setNote({ ...note, message: e.target.value });
    isTouched && validate({ ...note, message: e.target.value });
  }, [isTouched, note, validate]);

  const onSubmit = useCallback(async () => {
    setIsTouched(true);
    if (!validate(note)) return;
    onChange([...notes, ...[note]]);
    setLastId(lastId + 1);
    setIsTouched(false);
    setNote({ ID: lastId, message: '' });
  }, [lastId, note, notes, onChange, validate]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
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
          onChange={messageChange}
          value={note.message}
          placeholder="Заметка"
          error={isTouched && !!errors?.message}
          multiline
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="rgb(205, 92, 92)" fontSize={'12px'}>{isTouched && errors?.message}</Typography>
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            form="notesForm"
            onClick={onSubmit}
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
