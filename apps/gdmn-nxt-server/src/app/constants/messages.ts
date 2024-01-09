import { bodySize } from './params';

export const ERROR_MESSAGES = {
  ITERNAL_ERROR: 'Ошибка на сервере. Обратитесь в техническую поддержку.',
  AUTH_FAILED: 'Ваша сессия закрыта. Повторно войдите в систему',
  AUTH_FAILED_TFA_REQUIRED: 'Требуется активировать 2FA.',
  AUTH_FAILED_TFA_NO_EMAIL: 'Не указан email пользователя. Обратитесь к администратору.',
  AUTH_FAILED_EMAIL_ATTEMPTS: 'Слишком много неудачных попыток подтверждения электронной почты.',
  AUTH_FAILED_EMAIL_CODE_INVALID: 'Неверный код электронной почты.',
  TOKEN_FAILED: 'Неверный ключ доступа',
  TFA_CODE_INVALID: 'Код 2FA неверен или просрочен.',
  REQUEST_TOO_LARGE: `Слишком большой объём данных. Максимальный размер: ${bodySize.toUpperCase()}`,
  REQUEST_MISSED_PARAMS: 'Поле не указано или неверного типа',
  SEND_EMAL_ERROR: 'Код подтверждения не может быть отправлен на указанный email.',
  CAPTCHA_INVALID: 'Неверный код.'
};

export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
  TFA_CODE_VALID: 'Проверка кода 2FA успешно пройдена.',
  TFA_DISABLED: 'Двухфакторная аутентификация успешно отключена.',
  TFA_ACTIVATED: 'Двухфакторная аутентификация успешно подключена.',
  CAPTCHA_VALID: 'Код совпадает.'
};
