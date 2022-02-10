import './deals.module.less';
import KanbanBoard from '../../../components/Kanban/kanban-board/kanban-board';

export interface IColumn {
  id: number,
  title: string,
}

export interface ICard {
  id: number;
  title: string;
  status: number;
  amount?: number;
  customer: string;
}

const cards: ICard[] = [
  {
    id: 1,
    status: 1,
    title: 'Сделка 1',
    amount: 97.53,
    customer: 'ООО"Дисанайти"'
  },
  {
    id: 2,
    status: 1,
    title: 'Сделка 2',
    customer: 'Пипченко Денис Иванович'

  },
  {
    id: 3,
    status: 1,
    title: 'Сделка 3',
    amount: 140,
    customer: 'Минский государственный высший радиотехнический колледж'
  },
  {
    id: 4,
    status: 2,
    title: 'Сделка 4',
    customer: 'ООО "Новые Строительные Технологии Профтэк"'
  },
  {
    id: 5,
    status: 3,
    title: 'Сделка 5',
    amount: 88,
    customer: 'ООО "Королева Групп"'
  },
  {
    id: 6,
    status: 1,
    title: 'Сделка 6',
    customer: 'ДЦППК'
  },
]

const columns: IColumn[] = [
  {
    id: 1,
    title: 'Оценка',
  },
  {
    id: 2,
    title: 'Коммерческое предложение',
  },
  {
    id: 3,
    title: 'Оплата',
  },
]

/* eslint-disable-next-line */
export interface DealsProps {}

export function Deals(props: DealsProps) {
  return (
    <KanbanBoard
      columns={columns}
      cards={cards}
    />
  );
}

export default Deals;
