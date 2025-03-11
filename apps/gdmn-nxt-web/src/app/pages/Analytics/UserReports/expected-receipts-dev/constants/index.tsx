export interface IFieldsSort {
    id: number;
    name: string;
    value: string,
    sort: 'asc' | 'desc'
  }

export const sortFields: IFieldsSort[] = [
  {
    id: 0,
    name: 'По алфавиту',
    value: 'customer',
    sort: 'asc'
  },
  {
    id: 1,
    name: 'Сумма договора по убыванию',
    value: 'amount',
    sort: 'desc'
  },
  {
    id: 2,
    name: 'Сумма договора по возрастанию',
    value: 'amount',
    sort: 'asc'
  },
  {
    id: 3,
    name: 'Сумма остатка по убыванию',
    value: 'rest',
    sort: 'desc'
  },
  {
    id: 3,
    name: 'Сумма остатка по возрастанию',
    value: 'rest',
    sort: 'asc'
  }
];
