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
    name: 'Сначала большие суммы',
    value: 'amount',
    sort: 'desc'
  },
  {
    id: 2,
    name: 'Сначала маленькие суммы',
    value: 'amount',
    sort: 'asc'
  }
];
