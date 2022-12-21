import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNewFaq } from '../../../features/FAQ/faqSlice';
import { CardHeader, Typography, Button } from '@mui/material';
import style from './editFaqForm.module.less';
import ReactMarkdown from 'react-markdown';
import TextField from '@mui/material/TextField';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { RootState } from '../../../store';

interface NewFaqFormProps {
  close:any
  isOpened:boolean
  index: number
}

export default function EditFaqForm({ close, isOpened, index }:NewFaqFormProps) {
  const dispatch = useDispatch();
  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [isPrevie, setIsPrevie] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    clearErrors
  } = useForm({ mode: 'onSubmit', });

  const onSubmit = async (data:any) => {
    dispatch(addNewFaq({ 'question': data.question, 'answer': data.answer }));
    setAnswer('');
    reset();
    close();
  };

  const onHandleChange = (value:string) => (e:any) => {
    clearErrors(value);
    setAnswer(e.target.value);
  };

  const openPreview = () => () => {
    setIsPrevie(true);
  };

  const closePreview = () => () => {
    setIsPrevie(false);
  };

  const escPressed = useCallback((event:any) => {
    if (event.keyCode === 27) {
      close();
    }
  }, []
  );
  useEffect(() => {
    document.addEventListener('keydown', escPressed);
    return () => {
      document.removeEventListener('keydown', escPressed);
    };
  }, [escPressed]);

  const faqs = useSelector((state:RootState) => state.faq.faqs);

  useEffect(()=>{
    setQuestion(faqs[index].question);
    setAnswer(faqs[index].answer);
  }, [index]);

  return (
    <>
      <div
        className={isOpened ? style.background : `${style.background} ${style.unactiveBackground}`}
        onClick={close}
      />
      <div className={isOpened ? style.newQuestionBody : `${style.newQuestionBody} ${style.unactiveNewQuestionBody}`}>
        <PerfectScrollbar className={isOpened ? style.scrollBar : `${style.scrollBar} ${style.unactiveScrollBar}`}>
          <form onSubmit={handleSubmit(onSubmit)} className={style.newQustionContainer}>
            <CardHeader title={<Typography variant="h4">Изменить вопрос с ответом</Typography>} />
            <div className={style.inputContainer}>
              <TextField
                defaultValue={question}
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
            <div>
              <button
                type="button"
                className={
                  isPrevie
                    ? style.previewToggleButton
                    : `${style.previewToggleButton} ${style.activePreviewToggleButton}`
                }
                onClick={closePreview()}
              >Редактировать</button>
              <button
                type="button"
                className={
                  !isPrevie
                    ? style.previewToggleButton
                    : `${style.previewToggleButton} ${style.activePreviewToggleButton}`
                }
                style={{ backgroundColor: isPrevie ? 'rgb(242, 242, 242' : '' }}
                onClick={openPreview()}
              >Просмотреть</button>
            </div>
            <div className={style.inputContainer}>
              <TextField
                defaultValue={answer}
                className={isPrevie ? style.unVisible : style.textArea}
                id="outlined-textarea"
                placeholder="Ответ"
                multiline
                {...register('answer', {
                  required: 'Обязательное поле'
                })}
                onChange={onHandleChange('answer')}
              />
              {
                errors.answer
                && <div className={style.errorMessage}>{errors.answer.message}</div>
              }
              {
                answer &&
          <div className={!isPrevie ? style.unVisible : style.preview}>
            <ReactMarkdown >
              {
                answer
              }
            </ReactMarkdown>
          </div>
              }
            </div>
            <div>
              <Button type="button" variant="contained" onClick={close}>Отмена</Button>
              <Button type="submit" variant="contained" style={{ marginLeft: '10px' }}>Сохранить</Button>
            </div>
          </form>
        </PerfectScrollbar>
      </div>
    </>
  );
}