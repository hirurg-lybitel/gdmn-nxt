export interface IFieldsSort {
    id: number;
    name: string;
    value: string,
    sort: 'asc' | 'desc'
  }

export const sortFields: IFieldsSort[] = [
  {
    id: 0,
    name: 'В алфавитном порядке',
    value: 'customer',
    sort: 'asc'
  },
  {
    id: 0,
    name: 'В алфавитном обратном порядке',
    value: 'customer',
    sort: 'desc'
  },
  {
    id: 1,
    name: 'Сумма по убыванию',
    value: 'amount',
    sort: 'desc'
  },
  {
    id: 1,
    name: 'Сумма по возрастанию',
    value: 'amount',
    sort: 'asc'
  }
];
