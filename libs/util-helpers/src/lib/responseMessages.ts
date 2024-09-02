import { IResultDescription, IResultError } from '@gsbelarus/util-api-types';

const localizations = {
  'Foreign key reference target does not exist': 'Нарушение ссылочной целостности',
  'violation of FOREIGN KEY': 'Запись нельзя удалить, так как она используется в другом документе',
  'lock conflict on no wait transaction': 'Документ уже изменяется другим пользователем',
  'No recipients defined': 'Получатели письма не определены',
  'Invalid login: 535 (515) incorrect password or account name': 'Неверный пароль или имя учетной записи smtp сервера'
};

export const resultError = (message: string): IResultError => {
  for (const [key, value] of Object.entries(localizations)) {
    if (message.includes(key)) return { errorMessage: value, description: message };
  }
  return { errorMessage: message };
};

export const resultDescription = (message: string): IResultDescription => {
  for (const [key, value] of Object.entries(localizations)) {
    if (message.includes(key)) return { message: value, description: message };
  }
  return { message };
};
