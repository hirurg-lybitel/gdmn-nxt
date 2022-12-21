import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addNewFaq } from '../../../features/FAQ/faqSlice';
import { CardHeader, Typography, Button } from '@mui/material';
import style from './newFaqForm.module.less';
import ReactMarkdown from 'react-markdown';
import TextField from '@mui/material/TextField';
import PerfectScrollbar from 'react-perfect-scrollbar';

interface NewFaqFormProps {
  close:any
  isOpened:boolean
}

export default function NewFaqForm({ close, isOpened }:NewFaqFormProps) {
  const dispatch = useDispatch();
  const [answer, setAnswer] = useState('');
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

  return (
    <>
      <div
        className={isOpened ? style.background : `${style.background} ${style.unactiveBackground}`}
        onClick={close}
      />
      <div className={isOpened ? style.newQuestionBody : `${style.newQuestionBody} ${style.unactiveNewQuestionBody}`}>
        <PerfectScrollbar className={isOpened ? style.scrollBar : `${style.scrollBar} ${style.unactiveScrollBar}`}>
          <form onSubmit={handleSubmit(onSubmit)} className={style.newQustionContainer}>
            <CardHeader title={<Typography variant="h4">Добавить новый вопрос с ответом</Typography>} />
            <div className={style.inputContainer}>
              <TextField
                autoFocus
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
                autoFocus
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
              <Button type="submit" variant="contained" style={{ marginLeft: '10px' }}>Добавить</Button>
            </div>
          </form>
        </PerfectScrollbar>
      </div>
    </>
  );
}