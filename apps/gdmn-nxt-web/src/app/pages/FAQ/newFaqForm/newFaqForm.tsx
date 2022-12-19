import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { addNewFaq } from '../../../features/FAQ/faqSlice';
import { CardHeader, Typography, Button } from '@mui/material';
import style from './newFaqForm.module.less';

export default function NewFaqForm() {
  const dispatch = useDispatch();

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    clearErrors
  } = useForm({ mode: 'all', });

  const onSubmit = async (data:any) => {
    reset();
    dispatch(addNewFaq({ 'question': data.question, 'answer': data.answer }));
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
      <div className={style.inputContainer}>
        <textarea
          className={style.textArea}
          placeholder={'Ответ'}
          {...register('answer', {
            required: 'Обязательное поле'
          })}
          onFocus={() => {
            clearErrors('answer');
          }}
        />
        {
          errors.answer
            && <div className={style.errorMessage}>{errors.answer.message}</div>
        }
      </div>
      <Button type="submit" variant="contained">Добавить</Button>
    </form>
  );
}