import styles from './deals.module.less';
import KanbanBoard from '../../../components/Kanban/kanban-board/kanban-board';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toggleMenu } from '../../../store/settingsSlice';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import { CircularIndeterminate } from '../../../components/helpers/circular-indeterminate/circular-indeterminate';
import { RootState } from '../../../store';
import { UserState } from '../../../features/user/userSlice';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { Autocomplete, Badge, BottomNavigation, BottomNavigationAction, Button, CircularProgress, IconButton, Skeleton, Stack, TextField, Tooltip, Box } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import KanbanList from '../../../components/Kanban/kanban-list/kanban-list';
import { IKanbanCard, IKanbanColumn, IPermissionByUser } from '@gsbelarus/util-api-types';
import DealsFilter, { IFilteringData } from '../../../components/Kanban/deals-filter/deals-filter';
import { clearFilterData, saveFilterData } from '../../../store/filtersSlice';
import { usePermissions } from '../../../features/common/usePermissions';

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
    ID: 1,
    name: 'Только активные'
  },
  {
    ID: 2,
    name: 'Срок сегодня'
  },
  {
    ID: 3,
    name: 'Срок завтра'
  },
  {
    ID: 4,
    name: 'Срок просрочен'
  },
  {
    ID: 5,
    name: 'Без срока'
  },
  {
    ID: 6,
    name: 'Все сделки'
  },

];

export const compareCards = (columns: IKanbanColumn[], newCard: any, oldCard: IKanbanCard) => {
  const changesArr: IChanges[] = [];

  const deal = newCard.DEAL;
  const contact = newCard.DEAL.CONTACT || {};
  const performer = newCard.DEAL.PERFORMER || {};

  if ((deal.USR$AMOUNT || 0) !== (oldCard.DEAL?.USR$AMOUNT || 0)) {
    changesArr.push({
      id: newCard.ID,
      fieldName: 'Сумма',
      oldValue: Number(oldCard.DEAL?.USR$AMOUNT) || 0,
      newValue: deal.USR$AMOUNT || 0
    });
  }
  if (contact.ID !== oldCard.DEAL?.CONTACT?.ID) {
    changesArr.push({
      id: newCard.ID,
      fieldName: 'Клиент',
      oldValue: oldCard.DEAL?.CONTACT?.NAME,
      newValue: contact.NAME
    });
  };
  if (deal.USR$NAME !== oldCard.DEAL?.USR$NAME) {
    changesArr.push({
      id: newCard.ID,
      fieldName: 'Наименование',
      oldValue: oldCard.DEAL?.USR$NAME,
      newValue: deal.USR$NAME
    });
  };
  if (performer.ID !== oldCard.DEAL?.PERFORMER?.ID) {
    changesArr.push({
      id: newCard.ID,
      fieldName: 'Исполнитель',
      oldValue: oldCard.DEAL?.PERFORMER?.NAME,
      newValue: performer.NAME
    });
  };
  if (newCard.USR$MASTERKEY !== oldCard.USR$MASTERKEY) {
    changesArr.push({
      id: newCard.ID,
      fieldName: 'Этап',
      oldValue: columns.find(column => column.ID === oldCard.USR$MASTERKEY)?.USR$NAME || '',
      newValue: columns.find(column => column.ID === newCard.USR$MASTERKEY)?.USR$NAME || ''
    });
  };

  return changesArr;
};


/* eslint-disable-next-line */
export interface DealsProps {}

export function Deals(props: DealsProps) {
  const [kanbanFilter, setKanbanFilter] = useState<IKanbanFilter>({ deadline: cardDateFilter[5] });
  const [tabNo, setTabNo] = useState(0);
  const [openFilters, setOpenFilters] = useState(false);
  const [filteringData, setFilteringData] = useState<IFilteringData>({});

  const dispatch = useDispatch();
  const filtersStorage = useSelector((state: RootState) => state.filtersStorage);
  const user = useSelector<RootState, UserState>(state => state.user);

  const { data: columns, isFetching: columnsIsFetching, isLoading, refetch } = useGetKanbanDealsQuery({
    userId: user.userProfile?.id || -1,
    filter: {
      deadline: kanbanFilter.deadline?.ID,
      ...filteringData,
    }
  });

  useEffect(() => {
    setFilteringData(filtersStorage.filterData.deals);
  }, []);

  useEffect(() => {
    SaveFilters();
  }, [filteringData]);

  const SaveFilters = () => {
    dispatch(saveFilterData({ 'deals': filteringData }));
  };

  const refreshBoard = useCallback(() => refetch(), []);

  const filterHandlers = {
    filterClick: useCallback(() => {
      setOpenFilters(true);
    }, []),
    filterClose: async (event: any, reason: 'backdropClick' | 'escapeKeyDown') => {
      if (
        event?.type === 'keydown' &&
        (event?.key === 'Tab' || event?.key === 'Shift')
      ) {
        return;
      }
      setOpenFilters(false);
    },
    filterClear: () => {
      dispatch(clearFilterData());

      setFilteringData({});
    },
    lastFilter: () => {
      setFilteringData(filtersStorage.lastFilterData.deals);
    },
    filteringDataChange: async(newValue: IFilteringData) => {
      setFilteringData(newValue);
    }
  };

  const DealsFilterMemo = useMemo(() =>
    <DealsFilter
      open={openFilters}
      filteringData={filteringData}
      onClose={filterHandlers.filterClose}
      onFilteringDataChange={filterHandlers.filteringDataChange}
      onFilterClear={filterHandlers.filterClear}
      onLastFilter={filterHandlers.lastFilter}
    />,
  [openFilters, filteringData]);

  const [isFetching1] = usePermissions(1);
  const [isFetching2] = usePermissions(2);
  const [isFetching3] = usePermissions(3);
  const [isFetching4] = usePermissions(4);

  const componentIsFetching = isLoading || isFetching1 || isFetching2 || isFetching3 || isFetching4;
  const Header = useMemo(() => {
    return (
      <>
        <CustomizedCard
          borders
          className={styles.headerCard}
        >
          <Autocomplete
            style={{
              width: '210px',
            }}
            options={cardDateFilter}
            disableClearable
            getOptionLabel={option => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={kanbanFilter.deadline || null}
            onChange={(e, value) => setKanbanFilter({ deadline: value })}
            renderOption={(props, option, { selected }) => (
              <li {...props} key={option.ID}>
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
          <Box flex={1} />
          <IconButton
            onClick={refreshBoard}
            disabled={columnsIsFetching}
          >
            {columnsIsFetching
              ? <CircularProgress size={17}/>
              : <RefreshIcon color="primary" />
            }
          </IconButton>
          <IconButton
            onClick={filterHandlers.filterClick}
            disabled={columnsIsFetching}
          >
            <Badge
              color="error"
              variant={Object.keys(filteringData || {}).length > 0 ? 'dot' : 'standard'}
            >
              <FilterListIcon color="primary" />
            </Badge>
          </IconButton>
        </CustomizedCard>
        <CustomizedCard
          borders
          className={styles.switchViewCard}
        >
          <BottomNavigation
            value={tabNo}
            className={styles.bottomNavigation}
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
    );
  }
  , [kanbanFilter.deadline, tabNo, filteringData, columnsIsFetching]);

  const KanbanBoardMemo = useMemo(() => <KanbanBoard columns={columns} isLoading={componentIsFetching} />, [columns, componentIsFetching]);

  const KanbanListMemo = useMemo(() => <KanbanList columns={columns} isLoading={componentIsFetching} />, [columns, componentIsFetching]);

  return (
    <Stack
      spacing={2}
      style={{
        width: '100%'
      }}
    >
      {componentIsFetching
        ?
        <div>
          <Skeleton variant="rectangular" height={'70px'} style={{ borderRadius: '12px 12px 0 0' }}/>
          <Skeleton variant="rectangular" height={'40px'} width={'235px'} style={{ borderRadius: '0 0 12px 12px' }}/>
        </div>
        : Header
      }
      {DealsFilterMemo}
      <div className={styles.dataContainer}>
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
