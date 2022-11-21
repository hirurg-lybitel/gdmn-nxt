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
import { Autocomplete, BottomNavigation, BottomNavigationAction, Button, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import TableRowsIcon from '@mui/icons-material/TableRows';

import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import { Box } from '@mui/system';
import KanbanList from '../../../components/Kanban/kanban-list/kanban-list';
import { IKanbanCard, IKanbanColumn } from '@gsbelarus/util-api-types';

export interface IChanges {
  id: number;
  fieldName: string,
  oldValue: string | number | undefined;
  newValue: string | number | undefined;
};

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

export const compareCards = (columns: IKanbanColumn[], newCard: any, oldCard: IKanbanCard) => {
  const changesArr: IChanges[] = [];

  const deal = newCard['DEAL'];
  const contact = newCard['DEAL']['CONTACT'] || {};
  const performer = newCard['DEAL']['PERFORMER'] || {};

  if ((deal['USR$AMOUNT'] || 0) !== (oldCard.DEAL?.USR$AMOUNT || 0)) {
    changesArr.push({
      id: newCard.ID,
      fieldName: 'Сумма',
      oldValue: Number(oldCard.DEAL?.USR$AMOUNT) || 0,
      newValue: deal['USR$AMOUNT'] || 0
    });
  }
  if (contact['ID'] !== oldCard.DEAL?.CONTACT?.ID) {
    changesArr.push({
      id: newCard.ID,
      fieldName: 'Клиент',
      oldValue: oldCard.DEAL?.CONTACT?.NAME,
      newValue: contact['NAME']
    });
  };
  if (deal['USR$NAME'] !== oldCard.DEAL?.USR$NAME) {
    changesArr.push({
      id: newCard.ID,
      fieldName: 'Наименование',
      oldValue: oldCard.DEAL?.USR$NAME,
      newValue: deal['USR$NAME']
    });
  };
  if (performer['ID'] !== oldCard.DEAL?.PERFORMER?.ID) {
    changesArr.push({
      id: newCard.ID,
      fieldName: 'Исполнитель',
      oldValue: oldCard.DEAL?.PERFORMER?.NAME,
      newValue: performer['NAME']
    });
  };
  if (newCard['USR$MASTERKEY'] !== oldCard.USR$MASTERKEY) {
    changesArr.push({
      id: newCard.ID,
      fieldName: 'Этап',
      oldValue: columns.find(column => column.ID === oldCard.USR$MASTERKEY)?.USR$NAME || '',
      newValue: columns.find(column => column.ID === newCard['USR$MASTERKEY'])?.USR$NAME || ''
    });
  };

  return changesArr;
};


/* eslint-disable-next-line */
export interface DealsProps {}

export function Deals(props: DealsProps) {
  const [kanbanFilter, setKanbanFilter] = useState<IKanbanFilter>({ deadline: cardDateFilter[0] });
  const [tabNo, setTabNo] = useState(0);

  const user = useSelector<RootState, UserState>(state => state.user);
  const { data: columns, isFetching: columnsIsFetching, isLoading } = useGetKanbanDealsQuery({
    userId: user.userProfile?.id || -1,
    filter: {
      ...kanbanFilter,
      deadline: kanbanFilter['deadline']?.id
    }
  });

  const Header = useMemo(() => {
    return (
      <>
        <CustomizedCard
          borders
          style={{
            padding: '15px',
            paddingTop: '13px',
            borderBottomLeftRadius: 0,
            // height: '100px'
          }}
        >
          <Autocomplete
            style={{
              maxWidth: '210px',
            }}
            options={cardDateFilter}
            disableClearable
            getOptionLabel={option => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
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
        <CustomizedCard
          borders
          style={{
            margin: 0,
            borderTop: 'none',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            width: '235px'
          }}
        >
          <BottomNavigation
            // showLabels
            value={tabNo}
            style={{
              height: 40
            }}
            onChange={(e, newValue: number) => {
              setTabNo(newValue);
            }}
          >
            <Tooltip title="Доска" arrow>
              <BottomNavigationAction style={{ padding: 0, margin: 0 }} icon={<ViewWeekIcon />} />
            </Tooltip>
            <Tooltip title="Список" arrow>
              <BottomNavigationAction style={{ padding: 0, margin: 0 }} icon={<ViewStreamIcon />} />
            </Tooltip>
          </BottomNavigation>

        </CustomizedCard>

      </>
    );}
  , [kanbanFilter['deadline'], tabNo]);

  const KanbanBoardMemo = useMemo(() => <KanbanBoard columns={columns} />, [columns]);

  const KanbanListMemo = useMemo(() => <KanbanList columns={columns} />, [columns]);

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
      <div style={{ marginTop: '5px', display: 'flex', flex: 1 }}>
        {(() => {
          switch (tabNo) {
            case 0:
              return KanbanBoardMemo;
            case 1:
              return KanbanListMemo;
            default:
              return <></>;
          }
        })()}
      </div>

    </Stack>

  );
}

export default Deals;
