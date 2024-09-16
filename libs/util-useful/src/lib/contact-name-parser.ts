import { IContactName } from '@gsbelarus/util-api-types';

export const parseStringToContactName = (value: string): IContactName => {
  const newName = value?.replace(/\s{2,}/g, ' ').split(' ');
  const lastName = (newName[0] || '') + ((value[value?.length - 1] === ' ' && newName?.length === 2) ? ' ' : '');
  const firstName = (newName[1] || '') + ((value[value?.length - 1] === ' ' && newName?.length === 3) ? ' ' : '');
  const middleName = newName[2] || '';
  const nickName = `${lastName}${firstName ? ` ${firstName}` : ''}${middleName ? ` ${middleName}` : ''}`;

  return {
    lastName,
    firstName,
    middleName,
    nickName
  };
};

export const parseContactName = (value: Omit<IContactName, 'nickName'>): IContactName => {
  const lastName = value.lastName.trim();
  const firstName = value.firstName?.trim() ?? '';
  const middleName = value.middleName?.trim() ?? '';
  const nickName = `${lastName} ${firstName} ${middleName}`.replaceAll('  ', ' ');

  return {
    lastName,
    firstName,
    middleName,
    nickName
  };
};

export const parseContactNameToString = (value: IContactName): string => {
  return value.nickName;
};
