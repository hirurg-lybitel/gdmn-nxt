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
import { fullFaq } from '../../../features/FAQ/faqApi';

interface PopupProps {
  close: ()=>void
  isOpened:boolean
  isAddPopup: boolean
  faq?: fullFaq,
  addFaq?: (question:string, answer:string)=>void,
  editFaq?: (question:string, answer:string, id:number)=>void,
}

interface IShippingFields {
  question: string,
  answer: string
}

export default function Popup({ close, isOpened, isAddPopup, faq, addFaq, editFaq }:PopupProps) {
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
    if (faq) {
      handleConfirmCancelClick();
      closePopup();
      editFaq && editFaq(getValues('question'), getValues('answer'), faq.ID);
    }
  }, [faq]);

  const addFaqHandler = useCallback(async () => {
    handleConfirmCancelClick();
    closePopup();
    addFaq && addFaq(getValues('question'), getValues('answer'));
    reset();
  }, []);

  const handleTabsChange = useCallback((event: any, newindex: string) => {
    setTabIndex(newindex);
  }, [faq]);

  const escPressed = useCallback((event:KeyboardEvent) => {
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
      if (faq) {
        setValue('question', faq.USR$QUESTION);
        setValue('answer', faq.USR$ANSWER);
      }
    }
  }, []);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSaveClick = useCallback(() => {
    if ((getValues('answer').trim()).length !== 0) {
      if ((getValues('question').trim()).length !== 0) {
        setConfirmOpen(true);
      } else {
        setError('question', { message: 'Обязательное поле' });
      }
    } else {
      setError('answer', { message: 'Обязательное поле' });
    }
  }, []);

  const handleAddClick = useCallback(() => {
    if ((getValues('answer').trim()).length !== 0) {
      if ((getValues('question').trim()).length !== 0) {
        setConfirmOpen(true);
      } else {
        setError('question', { message: 'Обязательное поле' });
      }
    } else {
      setError('answer', { message: 'Обязательное поле' });
    }
  }, []);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  useEffect(()=>{
    if (faq) {
      setValue('question', faq.USR$QUESTION);
      setValue('answer', faq.USR$ANSWER);
    }
  }, [faq]);

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
    if ((getValues('answer').trim()).length === 0) {
      setError('answer', { message: 'Обязательное поле' });
    }
    if ((getValues('question').trim()).length === 0) {
      setError('question', { message: 'Обязательное поле' });
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
            className={style.questionForm}
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
                      {...register('question', {
                        required: 'Обязательное поле'
                      })}
                      onChange={()=>{
                        clearErrors('question');
                      }}
                    />
                    {
                      errors.question
                  && <div className={style.errorMessage}>{errors.question.message}</div>
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
                          {...register('answer', {
                            required: 'Обязательное поле'
                          })}
                          onChange={()=>{
                            clearErrors('answer');
                          }}
                        />
                        {
                          errors.answer
                        && <div className={style.errorMessage}>{errors.answer.message}</div>
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
                                  getValues('answer')
                                }
                              </ReactMarkdown>
                            </div>
                          </PerfectScrollbar>
                        </div>
                        {
                          errors.answer
                        && <div className={style.errorMessage}>{errors.answer.message}</div>
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