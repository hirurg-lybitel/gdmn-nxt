import { bodySize } from './params';

export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Ваша сессия закрыта. Повторно войдите в систему',
  AUTH_FAILED_TFA_REQUIRED: 'Требуется активировать 2FA.',
  TOKEN_FAILED: 'Неверный ключ доступа',
  TFA_CODE_INVALID: 'Код 2FA неверен или просрочен',
  REQUEST_TOO_LARGE: `Слишком большой объём данных. Максимальный размер: ${bodySize.toUpperCase()}`
};

export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
};
