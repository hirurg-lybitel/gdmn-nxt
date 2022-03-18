import './deals.module.less';
import KanbanBoard from '../../../components/Kanban/kanban-board/kanban-board';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { toggleMenu } from '../../../store/settingsSlice';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import { CircularIndeterminate } from '../../../components/circular-indeterminate/circular-indeterminate';

/* eslint-disable-next-line */
export interface DealsProps {}

export function Deals(props: DealsProps) {
  const dispatch = useDispatch()

  const { data: columns, isFetching: columnsIsFetching } = useGetKanbanDealsQuery();

  useEffect(() => {
    dispatch(toggleMenu(false));
  }, []);

  return (
    <>
      <KanbanBoard columns={columns || []} />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          zIndex: 999
        }}
      >
        <CircularIndeterminate open={columnsIsFetching} size={100} />
      </div>
    </>
  );
}

export default Deals;
