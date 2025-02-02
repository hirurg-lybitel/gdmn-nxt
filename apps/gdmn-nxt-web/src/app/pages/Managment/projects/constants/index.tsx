export interface IStatusFilter {
    id: number;
    name: string;
    value: string
  }

export const statusItems: IStatusFilter[] = [
  {
    id: 0,
    name: 'Все',
    value: 'all'
  },
  {
    id: 1,
    name: 'Активные',
    value: 'active'
  },
  {
    id: 2,
    name: 'Закрытые',
    value: 'closed'
  }
];