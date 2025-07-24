import { validatePhoneNumber } from '@gdmn-nxt/components/telephone-input';
import * as yup from 'yup';

export const emailsValidation = (fieldName = 'EMAIL') => yup
  .object()
  .shape({
    [fieldName]: yup
      .string()
      .matches(/^[a-zа-я0-9\_\-\'\+]+([.]?[a-zа-я0-9\_\-\'\+])*@[a-zа-я0-9\-]+([.]?[a-zа-я0-9\-])*\.[a-zа-я]{2,}$/i,
        ({ value }) => {
          const invalidChar = value.match(/[^a-zа-я0-9\.\_\-\'\+ @.]/i);
          if (invalidChar) {
            return `Адрес не может содержать символ "${invalidChar}"`;
          }
          return 'Некорректный адрес';
        })
      .max(40, 'Слишком длинный email')
  });

export const phonesValidation = (fieldName = 'USR$PHONENUMBER') => yup
  .object()
  .shape({
    [fieldName]: yup
      .string()
      .test('',
        ({ value }) => validatePhoneNumber(value) ?? '',
        (value = '') => !validatePhoneNumber(value))
  });

export const emailValidation = () => yup
  .string()
  .matches(/^[a-zа-я0-9\_\-\'\+]+([.]?[a-zа-я0-9\_\-\'\+])*@[a-zа-я0-9]+([.]?[a-zа-я0-9])*\.[a-zа-я]{2,}$/i,
    ({ value }) => {
      const invalidChar = value.match(/[^a-zа-я\_\-\'\+ @.]/i);
      if (invalidChar) {
        return `Адрес не может содержать символ "${invalidChar}"`;
      }
      return 'Некорректный адрес';
    })
  .max(40, 'Слишком длинный email');

export const passwordValidation = () => yup.string()
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
