import * as yup from 'yup';

export const passwordSchema = yup.string()
  .required('Обязательное поле')
  .test(
    'has-letter',
    'Пароль должен содержать хотя бы одну букву',
    (value) => /[a-zA-Zа-яА-Я]/.test(value || '')
  )
  .min(8, 'Пароль должен содержать 8-20 символов')
  .max(20, 'Пароль должен содержать 8-20 символов')
  .test(
    'no-spaces',
    'В пароле не должно быть пробелов',
    (password) => password ? !/\s/.test(password) : true,
  );
