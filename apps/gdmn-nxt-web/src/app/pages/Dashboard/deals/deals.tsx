import './deals.module.less';
import KanbanBoard from '../../../components/Kanban/kanban-board/kanban-board';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { toggleMenu } from '../../../store/settingsSlice';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import { CircularIndeterminate } from '../../../components/circular-indeterminate/circular-indeterminate';
import { RootState } from '../../../store';
import { UserState } from '../../../features/user/userSlice';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { Autocomplete, Stack, TextField } from '@mui/material';

interface IKanbanFilter {
  [key: string]: any;
};

const cardDateFilter = [
  {
    id: 1,
    name: 'Только активные'
  },
  {
    id: 2,
    name: 'Срок сегодня'
  },
  {
    id: 3,
    name: 'Срок завтра'
  },
  {
    id: 4,
    name: 'Срок просрочен'
  },
  {
    id: 5,
    name: 'Без срока'
  },
  {
    id: 6,
    name: 'Все сделки'
  },

];

/* eslint-disable-next-line */
export interface DealsProps {}

export function Deals(props: DealsProps) {
  const [kanbanFilter, setKanbanFilter] = useState<IKanbanFilter>({ deadline: cardDateFilter[0] });

  const user = useSelector<RootState, UserState>(state => state.user);
  const { data: columns, isFetching: columnsIsFetching, isLoading } = useGetKanbanDealsQuery({
    userId: user.userProfile?.id || -1,
    filter: {
      ...kanbanFilter,
      deadline: kanbanFilter['deadline']?.id
    }
  });

  const Header = useMemo(() =>
    <CustomizedCard borders style={{ padding: '15px', paddingTop: '13px' }}>
      <Autocomplete
        style={{
          maxWidth: '210px',
        }}
        options={cardDateFilter}
        disableClearable
        getOptionLabel={option => option.name}
        value={kanbanFilter['deadline'] || null}
        onChange={(e, value) => setKanbanFilter({ deadline: value })}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.id}>
            {option.name}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder="Фильтр по сроку"
          />
        )}
      />
    </CustomizedCard>
  , [kanbanFilter['deadline']]);

  const KanbanBoardMemo = useMemo(() => <KanbanBoard columns={columns}/>, [columns]);

  if (isLoading) {
    return (
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
    );
  }

  return (
    <Stack
      spacing={2}
      style={{
        width: '100%'
      }}
    >
      {Header}
      {/* <KanbanBoard columns={columns}/> */}
      {KanbanBoardMemo}
    </Stack>

  );

  return (
    <>
      {/* {!isLoading && <KanbanBoard />}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          zIndex: 999
        }}
      >
        <CircularIndeterminate open={isLoading} size={100} />
      </div> */}
    </>
  );
}

export default Deals;
