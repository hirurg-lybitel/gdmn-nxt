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
    name: 'Сальдо на начало (сначала большое)',
    value: 'saldoBegin',
    sort: 'desc'
  },
  {
    id: 2,
    name: 'Сальдо на начало (сначала маленькое)',
    value: 'saldoBegin',
    sort: 'asc'
  },
  {
    id: 3,
    name: 'Выполнено (сначала большое)',
    value: 'done',
    sort: 'desc'
  },
  {
    id: 4,
    name: 'Выполнено (сначала маленькое)',
    value: 'done',
    sort: 'asc'
  },
  {
    id: 5,
    name: 'Оплачено (сначала большое)',
    value: 'paid',
    sort: 'desc'
  },
  {
    id: 6,
    name: 'Оплачено (сначала маленькое)',
    value: 'paid',
    sort: 'asc'
  },
  {
    id: 7,
    name: 'Сальдо на конец (сначала большое)',
    value: 'saldoEnd',
    sort: 'desc'
  },
  {
    id: 8,
    name: 'Сальдо на конец (сначала маленькое)',
    value: 'saldoEnd',
    sort: 'asc'
  },
  {
    id: 9,
    name: 'Изменение (сначала большое)',
    value: 'change',
    sort: 'desc'
  },
  {
    id: 10,
    name: 'Изменение (сначала маленькое)',
    value: 'change',
    sort: 'asc'
  }
];
