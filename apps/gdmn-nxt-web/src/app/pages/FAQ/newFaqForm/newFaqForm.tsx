import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addNewFaq } from '../../../features/FAQ/faqSlice';
import { CardHeader, Typography, Button } from '@mui/material';
import style from './newFaqForm.module.less';
import ReactMarkdown from 'react-markdown';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';

export default function NewFaqForm() {
  const dispatch = useDispatch();
  const [answer, setAnswer] = useState('');
  const [isPrevie, setIsPrevie] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    clearErrors
  } = useForm({ mode: 'all', });

  const onSubmit = async (data:any) => {
    dispatch(addNewFaq({ 'question': data.question, 'answer': data.answer }));
    setAnswer('');
    reset();
  };

  const onHandleChange = () => (e:any) => {
    console.log(answer);
    setAnswer(e.target.value);
  };

  const openPreview = () => () => {
    setIsPrevie(true);
    console.log('isPrivie');
  };

  const closePreview = () => () => {
    setIsPrevie(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={style.newQustionContainer}>
      <CardHeader title={<Typography variant="h4">Добавить новый вопрос с ответом</Typography>} />
      <div className={style.inputContainer}>
        <input
          className={style.input}
          placeholder={'Вопрос'}
          {...register('question', {
            required: 'Обязательное поле'
          })}
          onFocus={() => {
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
          className={style.previewToggleButton}
          style={{ backgroundColor: !isPrevie ? 'rgb(242, 242, 242' : '' }}
          onClick={closePreview()}
        >Edit</button>
        <button
          type="button"
          className={style.previewToggleButton}
          style={{ backgroundColor: isPrevie ? 'rgb(242, 242, 242' : '' }}
          onClick={openPreview()}
        >Preview</button>
      </div>
      <div className={style.inputContainer}>
        <TextField
          className={isPrevie ? style.unVisible : style.textArea}
          id="outlined-textarea"
          placeholder="Ответ"
          multiline
          {...register('answer', {
            required: 'Обязательное поле'
          })}
          onFocus={() => {
            clearErrors('answer');
          }}
          onChange={onHandleChange()}
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
      <Button type="submit" variant="contained">Добавить</Button>
    </form>
  );
}