import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editFaq, deleteFaq } from '../../../features/FAQ/faqSlice';
import { CardHeader, Typography, Button, Divider, CardContent, Box, Tab, IconButton, Card } from '@mui/material';
import style from './editFaqForm.module.less';
import ReactMarkdown from 'react-markdown';
import TextField from '@mui/material/TextField';
import { RootState } from '../../../store';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';

interface NewFaqFormProps {
  close:any
  isOpened:boolean
  index: number
}

interface IShippingFields {
  question: string,
  answer: string
}

export default function EditFaqForm({ close, isOpened, index }:NewFaqFormProps) {
  const dispatch = useDispatch();
  const faqs:any[] = useSelector((state:RootState) => state.faq.faqs);
  const [tabIndex, setTabIndex] = useState('1');

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    getValues,
    clearErrors
  } = useForm<IShippingFields>({
    mode: 'onSubmit'
  });

  const closePopup = () => {
    close();
    clearErrors();
  };

  const onSubmit = async (data:any) => {
    dispatch(editFaq({ 'question': data.question, 'answer': data.answer, 'index': index }));
    closePopup();
  };

  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const escPressed = useCallback((event:KeyboardEvent) => {
    if (event.key === 'Escape') {
      closePopup();
    }
  }, []
  );
  useEffect(() => {
    document.addEventListener('keydown', escPressed);
    return () => {
      document.removeEventListener('keydown', escPressed);
    };
  }, [escPressed]);

  useEffect(()=>{
    if (faqs.length > index) {
      setValue('question', faqs[index].question);
      setValue('answer', faqs[index].answer);
    }
  }, [faqs, index]);

  const handleDelete = () => {
    dispatch(deleteFaq(index));
    closePopup();
  };

  return (
    <>
      <div
        className={isOpened ? style.background : `${style.background} ${style.unactiveBackground}`}
        onClick={closePopup}
      />
      <div className={style.newQuestionBody}>
        <div className={isOpened ? style.NewQustionContainer : `${style.NewQustionContainer} ${style.inactiveNewQustionContainer}`}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={style.qustionForm}
          >
            <Card style={{ width: '100%' }}>
              <CardHeader title={<Typography variant="h4">Изменить вопрос с ответом</Typography>} />
              <Divider style={{ width: '100%' }}/>
              <CardContent
                style={{
                  width: '100%'
                }}
              >
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
                      <Tab label="Просмотреть" value="1" />
                      <Tab label="Изменить" value="2" />
                    </TabList>
                  </Box>
                  <Divider style={{ margin: 0 }} />
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
                      <div className={style.preview}>
                        <ReactMarkdown >
                          {
                            getValues('answer')
                          }
                        </ReactMarkdown>
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                paddingRight: '20px',
                paddingLeft: '10px',
                marginBottom: '15px'
              }}
            >
              <div>
                <IconButton aria-label="Удалить" onClick={handleDelete}>
                  <DeleteIcon />
                </IconButton>
              </div>
              <div>
                <Button type="button" variant="contained" onClick={closePopup}>Отмена</Button>
                <Button type="submit" variant="contained" style={{ marginLeft: '10px' }}>Сохранить</Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}