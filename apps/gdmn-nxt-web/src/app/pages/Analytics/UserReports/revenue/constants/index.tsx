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
    name: 'Дата платежа (сначала новые)',
    value: 'date',
    sort: 'desc'
  },
  {
    id: 2,
    name: 'дата патежа (сначала старые)',
    value: 'date',
    sort: 'asc'
  },
  {
    id: 3,
    name: 'Сумма (сначала большие)',
    value: 'amount',
    sort: 'desc'
  },
  {
    id: 4,
    name: 'Сумма (сначала маленькие)',
    value: 'amount',
    sort: 'asc'
  }
];
