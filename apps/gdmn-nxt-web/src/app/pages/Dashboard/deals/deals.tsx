import './deals.module.less';
import KanbanBoard from '../../../components/Kanban/kanban-board/kanban-board';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { toggleMenu } from '../../../store/settingsSlice';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import { CircularIndeterminate } from '../../../components/circular-indeterminate/circular-indeterminate';
import { RootState } from '../../../store';
import { UserState } from '../../../features/user/userSlice';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { Stack } from '@mui/material';

/* eslint-disable-next-line */
export interface DealsProps {}

export function Deals(props: DealsProps) {
  const user = useSelector<RootState, UserState>(state => state.user);
  const { data: columns, isFetching: columnsIsFetching, isLoading } = useGetKanbanDealsQuery({ userId: user.userProfile?.id || -1 });

  // const dispatch = useDispatch();
  // useEffect(() => {
  //   dispatch(toggleMenu(false));
  // }, []);

  return (
    <>

      {!isLoading && <KanbanBoard columns={columns || []} />}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          zIndex: 999
        }}
      >
        <CircularIndeterminate open={isLoading} size={100} />
      </div>
    </>
  );
}

export default Deals;
