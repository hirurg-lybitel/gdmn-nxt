import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { CardHeader, Typography, Button, Divider, CardContent, Box, Tab, IconButton, Card, CardActions } from '@mui/material';
import style from './popup.module.less';
import ReactMarkdown from 'react-markdown';
import TextField from '@mui/material/TextField';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import PerfectScrollbar from 'react-perfect-scrollbar';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { fullUpdate } from '../../../features/updates/updatesApi';

interface PopupProps {
  close: () => void
  isOpened: boolean
  isAddPopup: boolean
  update?: fullUpdate,
  addUpdate?: (version: string, changes: string) => void,
  editUpdate?: (version: string, changes: string, id: number) => void,
}

interface IShippingFields {
  version: string,
  changes: string
}

export default function Popup({ close, isOpened, isAddPopup, update, addUpdate, editUpdate }: PopupProps) {
  const [tabIndex, setTabIndex] = useState('1');

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    reset,
    getValues,
    clearErrors,
    setError
  } = useForm<IShippingFields>({
    mode: 'onSubmit'
  });

  const closePopup = useCallback(() => {
    setTabIndex('1');
    close();
    clearErrors();
  }, []);

  const editFaqHandler = useCallback(async () => {
    if (update) {
      handleConfirmCancelClick();
      closePopup();
      editUpdate && editUpdate(getValues('version'), getValues('changes'), update.ID);
    }
  }, [update]);

  const addFaqHandler = useCallback(async () => {
    handleConfirmCancelClick();
    closePopup();
    addUpdate && addUpdate(getValues('version'), getValues('changes'));
    reset();
  }, []);

  const handleTabsChange = useCallback((event: any, newindex: string) => {
    setTabIndex(newindex);
  }, [update]);

  const escPressed = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closePopup();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', escPressed);
    return () => {
      document.removeEventListener('keydown', escPressed);
    };
  }, [escPressed]);

  const clearAndClosePopup = useCallback(() => {
    closePopup();
    if (isAddPopup) {
      reset();
    } else {
      if (update) {
        setValue('version', update.USR$VERSION);
        setValue('changes', update.USR$CHANGES);
      }
    }
  }, []);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSaveClick = useCallback(() => {
    if ((getValues('changes').trim()).length !== 0) {
      if ((getValues('version').trim()).length !== 0) {
        setConfirmOpen(true);
      } else {
        setError('version', { message: 'Обязательное поле' });
      }
    } else {
      setError('changes', { message: 'Обязательное поле' });
    }
  }, []);

  const handleAddClick = useCallback(() => {
    if ((getValues('changes').trim()).length !== 0) {
      if ((getValues('version').trim()).length !== 0) {
        setConfirmOpen(true);
      } else {
        setError('version', { message: 'Обязательное поле' });
      }
    } else {
      setError('changes', { message: 'Обязательное поле' });
    }
  }, []);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  useEffect(() => {
    if (update) {
      setValue('version', update.USR$VERSION);
      setValue('changes', update.USR$CHANGES);
    }
  }, [update]);

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      title={isAddPopup
        ? 'Добавление нового вопроса с ответом'
        : 'Сохранение изменений'
      }
      text="Вы уверены, что хотите продолжить?"
      confirmClick={isAddPopup
        ? addFaqHandler
        : editFaqHandler
      }
      cancelClick={handleConfirmCancelClick}
    />
  , [confirmOpen, isAddPopup, addFaqHandler, editFaqHandler, handleConfirmCancelClick]);

  const onSubmitClick = () => {
    if ((getValues('changes').trim()).length === 0) {
      setError('changes', { message: 'Обязательное поле' });
    }
    if ((getValues('version').trim()).length === 0) {
      setError('version', { message: 'Обязательное поле' });
    }
  };

  return (
    <>
      {memoConfirmDialog}
      <div
        className={isOpened ? style.background : `${style.background} ${style.unactiveBackground}`}
        onClick={closePopup}
      />
      <div className={style.newQuestionBody}>
        <div
          className={
            isOpened
              ? style.NewQuestionContainer
              : `${style.NewQuestionContainer} ${style.inactiveNewQuestionContainer}`
          }
        >
          <form
            onSubmit={isAddPopup ? handleSubmit(handleAddClick) : handleSubmit(handleSaveClick)}
            className={style.QuestionForm}
          >
            <Card className={style.card}>
              <div>
                <CardHeader
                  title={<Typography variant="h4">{
                    isAddPopup ? 'Добавить новый вопрос с ответом' : 'Изменить вопрос с ответом'
                  }</Typography>}
                />
                <Divider/>
                <CardContent style={{ flex: 1 }} >
                  <div className={style.inputContainer}>
                    <TextField
                      rows={4}
                      className={style.textArea}
                      id="outlined-textarea"
                      placeholder="Вопрос"
                      multiline
                      {...register('version', {
                        required: 'Обязательное поле'
                      })}
                      onChange={() => {
                        clearErrors('version');
                      }}
                    />
                    {
                      errors.version
                  && <div className={style.errorMessage}>{errors.version.message}</div>
                    }
                  </div>
                  <TabContext value={tabIndex}>
                    <Box>
                      <TabList onChange={handleTabsChange}>
                        <Tab label="Изменить" value="1" />
                        <Tab label="Просмотреть" value="2" />
                      </TabList>
                    </Box>
                    <TabPanel value="1" className={style.tab}>
                      <div className={style.inputContainer}>
                        <TextField
                          rows={12}
                          className={style.textArea}
                          id="outlined-textarea"
                          placeholder="Ответ"
                          multiline
                          {...register('changes', {
                            required: 'Обязательное поле'
                          })}
                          onChange={() => {
                            clearErrors('changes');
                          }}
                        />
                        {
                          errors.changes
                        && <div className={style.errorMessage}>{errors.changes.message}</div>
                        }
                      </div>
                    </TabPanel>
                    <TabPanel value="2" className={style.tab}>
                      <div className={style.inputContainer}>
                        <div className={style.previewBackground}>
                          <PerfectScrollbar className={style.preview}>
                            <div className={style.previewContent}>
                              <ReactMarkdown className={style.markdown}>
                                {
                                  getValues('changes')
                                }
                              </ReactMarkdown>
                            </div>
                          </PerfectScrollbar>
                        </div>
                        {
                          errors.changes
                        && <div className={style.errorMessage}>{errors.changes.message}</div>
                        }
                      </div>
                    </TabPanel>
                  </TabContext>
                </CardContent>
                <Divider/>
                <CardActions className={style.buttonsContainer}>
                  <Box flex={1} />
                  <div>
                    <Button
                      type="button"
                      variant="text"
                      onClick={clearAndClosePopup}
                      className={style.button}
                    >Отменить</Button>
                    <Button
                      type="submit"
                      variant="contained"
                      onClick={onSubmitClick}
                      className={`${style.saveButton} ${style.button}`}
                    >
                      {isAddPopup ? 'Добавить' : 'Сохранить'}
                    </Button>
                  </div>
                </CardActions>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </>
  );
}
