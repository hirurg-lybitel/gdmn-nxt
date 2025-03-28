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
    name: 'Сумма договора (cначала большие)',
    value: 'amount',
    sort: 'desc'
  },
  {
    id: 2,
    name: 'Сумма договора (cначала маленькие)',
    value: 'amount',
    sort: 'asc'
  },
  {
    id: 3,
    name: 'Остаток (cначала большие суммы)',
    value: 'rest',
    sort: 'desc'
  },
  {
    id: 4,
    name: 'Остаток (cначала маленькие суммы)',
    value: 'rest',
    sort: 'asc'
  },
  {
    id: 5,
    name: 'Дата договора (сначала старые)',
    value: 'number',
    sort: 'asc'
  }, {
    id: 6,
    name: 'Дата договора (сначала новые)',
    value: 'number',
    sort: 'desc'
  },
];
