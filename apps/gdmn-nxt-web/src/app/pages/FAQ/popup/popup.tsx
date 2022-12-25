import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editFaq, deleteFaq, addFaq, faq } from '../../../features/FAQ/faqSlice';
import { CardHeader, Typography, Button, Divider, CardContent, Box, Tab, IconButton, Card } from '@mui/material';
import style from './popup.module.less';
import ReactMarkdown from 'react-markdown';
import TextField from '@mui/material/TextField';
import { RootState } from '../../../store';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import PerfectScrollbar from 'react-perfect-scrollbar';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';

interface PopupProps {
  close:()=>void
  isOpened:boolean
  isAddPopup: boolean
  index?: number | undefined
}

interface IShippingFields {
  question: string,
  answer: string
}

export default function Popup({ close, isOpened, isAddPopup, index }:PopupProps) {
  const dispatch = useDispatch();
  const faqs:faq[] = useSelector((state:RootState) => state.faq.faqs);
  const [tabIndex, setTabIndex] = useState('1');

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    reset,
    getValues,
    clearErrors
  } = useForm<IShippingFields>({
    mode: 'onSubmit'
  });

  const closePopup = () => {
    close();
    clearErrors();
  };

  const editFaqHandler = async () => {
    handleConfirmCancelClick();
    dispatch(editFaq({ 'question': getValues('question'), 'answer': getValues('answer'), 'index': index }));
    closePopup();
  };

  const addFaqHandler = async (data:IShippingFields) => {
    dispatch(addFaq({ 'question': data.question, 'answer': data.answer }));
    closePopup();
    reset();
  };

  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

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

  useEffect(()=>{
    const itemIndex:number = index !== undefined ? index : 0;
    if (faqs.length > itemIndex && !isAddPopup) {
      setValue('question', faqs[itemIndex].question);
      setValue('answer', faqs[itemIndex].answer);
    }
  }, isAddPopup ? [] : [faqs, index]);

  const handleDelete = () => {
    dispatch(deleteFaq(index));
    handleConfirmCancelClick();
    closePopup();
  };

  const clearAndClosePopup = () => {
    closePopup();
    if (isAddPopup) {
      reset();
    } else {
      const itemIndex:number = index !== undefined ? index : 0;
      setValue('question', faqs[itemIndex].question);
      setValue('answer', faqs[itemIndex].answer);
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [isDelete, setIsDelete] = useState(false);

  const handleDeleteClick = () => {
    setIsDelete(true);
    setConfirmOpen(true);
  };

  const handleSaveClick = () => {
    setIsDelete(false);
    setConfirmOpen(true);
  };

  const handleConfirmCancelClick = () => {
    setConfirmOpen(false);
  };

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      title={isDelete ? 'Удаление вопроса с ответом' : 'Сохранение изменений'}
      text="Вы уверены, что хотите продолжить?"
      confirmClick={isDelete ? handleDelete : editFaqHandler}
      cancelClick={handleConfirmCancelClick}
    />
  , [confirmOpen]);

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
              ? style.NewQustionContainer
              : `${style.NewQustionContainer} ${style.inactiveNewQustionContainer}`
          }
        >
          <form
            onSubmit={isAddPopup ? handleSubmit(addFaqHandler) : handleSubmit(handleSaveClick)}
            className={style.questionForm}
          >
            <Card>
              <CardHeader
                title={<Typography variant="h4">{
                  isAddPopup ? 'Добавить новый вопрос с ответом' : 'Изменить вопрос с ответом'
                }</Typography>}
              />
              <Divider />
              <CardContent >
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
                            <ReactMarkdown >
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
            </Card>
            <div className={style.buttonsContainer}>
              {isAddPopup
                ?
                <>
                  <div />
                  <div>
                    <Button type="button" variant="contained" onClick={clearAndClosePopup}>Отмена</Button>
                    <Button type="submit" variant="contained" className={style.saveButton}>Добавить</Button>
                  </div>
                </>
                :
                <>
                  <div>
                    <IconButton aria-label="Удалить" onClick={handleDeleteClick}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                  <div>
                    <Button type="button" variant="contained" onClick={clearAndClosePopup}>Отмена</Button>
                    <Button type="submit" variant="contained" className={style.saveButton}>Сохранить</Button>
                  </div>
                </>
              }
            </div>
          </form>
        </div>
      </div>
    </>
  );
}