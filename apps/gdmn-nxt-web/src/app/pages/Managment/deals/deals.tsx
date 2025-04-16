import styles from './deals.module.less';
import KanbanBoard from '../../../components/Kanban/kanban-board/kanban-board';
import { useDispatch, useSelector } from 'react-redux';
import { SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAddCardMutation, useAddTaskMutation, useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import { RootState } from '@gdmn-nxt/store';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { Autocomplete, Badge, IconButton, Skeleton, Stack, TextField, Tooltip, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import KanbanList from '../../../components/Kanban/kanban-list/kanban-list';
import { IKanbanCard, IKanbanFilterDeadline } from '@gsbelarus/util-api-types';
import DealsFilter, { IFilteringData } from '../../../components/Kanban/deals-filter/deals-filter';
import { clearFilterData, saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import { useGetFiltersDeadlineQuery, useGetLastUsedFilterDeadlineQuery, usePostLastUsedFilterDeadlineMutation } from '../../../features/kanban/kanbanFiltersApi';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import KanbanEditCard from '@gdmn-nxt/components/Kanban/kanban-edit-card/kanban-edit-card';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import PageContentHeader from '@gdmn-nxt/components/pageContentHeader/pageContentHeader';

export interface IChanges {
  id: number;
  fieldName: string,
  oldValue: string | number | undefined;
  newValue: string | number | undefined;
};

/* eslint-disable-next-line */
export interface DealsProps {}

export function Deals(props: DealsProps) {
  const [tabNo, setTabNo] = useState('0');
  const [openFilters, setOpenFilters] = useState(false);

  const userPermissions = usePermissions();

  const dispatch = useDispatch();
  const filterEntityName = 'deals';
  const filtersStorage = useSelector((state: RootState) => state.filtersStorage);
  const { data: cardDateFilter = [], isFetching: cardDateFilterFetching } = useGetFiltersDeadlineQuery();
  const deadlineDefault = cardDateFilter?.find(f => f.CODE === 6);
  const filterData = filtersStorage.filterData?.[`${filterEntityName}`];
  const userId = useSelector<RootState, number>(state => state.user.userProfile?.id || -1);

  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName, deadlineDefault ? { deadline: [deadlineDefault] } : null);

  // const { data: lastCardDateFilter, isFetching: lastCardDateFilterFetching, isLoading: lastCardDateFilterLoading } = useGetLastUsedFilterDeadlineQuery(userId);
  // const [postLastUsedFilter] = usePostLastUsedFilterDeadlineMutation();

  const [upsertCard, setUpsertCard] = useState(false);

  const addingCard = useRef<IKanbanCard>();
  const [addTask, { isSuccess: addTaskSuccess }] = useAddTaskMutation();

  // useEffect(() => {
  //   if (lastCardDateFilterLoading) return;
  //   if (filterData?.deadline) return;

  //   const currentDeadline = (() => {
  //     /** по умолчанию Все сделки */
  //     if (!lastCardDateFilter) return deadlineDefault;
  //     return lastCardDateFilter;
  //   })();
  //   if (filterData?.deadline?.ID === currentDeadline?.ID) return;

  //   saveFilters({ ...filterData, deadline: [currentDeadline] });
  // }, [lastCardDateFilterLoading]);

  const {
    data: nonCachedData,
    currentData: columns = nonCachedData || [],
    isFetching: columnsIsFetching,
    isLoading,
    refetch
  } = useGetKanbanDealsQuery({
    userId,
    ...(Object.keys(filterData || {}).length > 0 ? { filter: filterData } : {}),
  }, {
    skip: Object.keys(filterData || {}).length === 0
  });

  const [addCard, { isSuccess: addCardSuccess, data: addedCard }] = useAddCardMutation();

  const saveFilters = (filteringData: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: filteringData }));
  };

  const refreshBoard = useCallback(() => refetch(), []);

  const filterHandlers = {
    filterClick: useCallback(() => {
      setOpenFilters(true);
    }, []),
    filterClose: useCallback((event: any) => {
      if (
        event?.type === 'keydown' &&
        (event?.key === 'Tab' || event?.key === 'Shift')
      ) {
        return;
      }
      setOpenFilters(false);
    }, []),
    filterClear: useCallback(() => {
      dispatch(clearFilterData({ filterEntityName, saveFields: ['deadline'] }));
    }, [dispatch]),
    filteringDataChange: async(newValue: IFilteringData) => {
      saveFilters(newValue);
    },
    filterDeadlineChange: (e: SyntheticEvent<Element, Event>, value: IKanbanFilterDeadline) => {
      saveFilters({ ...filterData, deadline: [value] });

      // postLastUsedFilter({
      //   filter: value,
      //   userId
      // });
    },
    requestSearch: async (value: string) => {
      const newObject = { ...filterData };
      delete newObject.name;
      saveFilters({
        ...newObject,
        ...(value !== '' ? { name: [value] } : {})
      });
    },
    cancelSearch: async () => {
      const newObject = { ...filterData };
      delete newObject.name;
      saveFilters(newObject);
    }
  };

  const cardHandlers = {
    handleSubmit: async (newCard: IKanbanCard, deleting: boolean) => {
      addingCard.current = newCard;
      addCard(newCard);
      setUpsertCard(false);
    },
    handleCancel: async (newCard: IKanbanCard) => {
      setUpsertCard(false);
    },
  };

  const DealsFilterMemo = useMemo(() =>
    <DealsFilter
      open={openFilters}
      filteringData={filterData}
      onClose={filterHandlers.filterClose}
      onFilteringDataChange={filterHandlers.filteringDataChange}
      onFilterClear={filterHandlers.filterClear}
    />,
  [openFilters, filterData, filterHandlers.filterClear, filterHandlers.filterClose, filterHandlers.filteringDataChange]);

  const componentIsFetching = isLoading || Object.keys(filterData || {}).length === 0;

  const addDealClick = () => setUpsertCard(true);

  const Header = useMemo(() => {
    return (
      <PageContentHeader
        searchPlaceholder="Поиск сделки"
        isLoading={isLoading}
        isFetching={columnsIsFetching}
        onCancelSearch={filterHandlers.cancelSearch}
        onRequestSearch={filterHandlers.requestSearch}
        searchValue={filterData?.name?.[0]}
        onRefetch={refreshBoard}
        onFilterClick={filterHandlers.filterClick}
        hasFilters={Object.keys(filterData || {}).filter(f => f !== 'deadline' && f !== 'name').length > 0}
        addButton={userPermissions?.contacts?.POST}
        onAddClick={addDealClick}
        action={
          <ToggleButtonGroup
            color="primary"
            value={tabNo}
            exclusive
            size="small"
            onChange={(e, value) => {
              if (!value) return;
              setTabNo(value);
            }}
          >
            <ToggleButton value="0" className={styles.toggleButton}>
              <Tooltip title="Доска" arrow>
                <ViewWeekIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="1" className={styles.toggleButton}>
              <Tooltip title="Список" arrow>
                <ViewStreamIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

        }
        wrapAction={
          <Autocomplete
            sx={{
              width: { xs: '100%', sm: '160px', md: '210px' },
              minWidth: { sm: '160px', md: '210px' },
              margin: { xs: '0', sm: '0px 16px' }
            }}
            options={cardDateFilter}
            disableClearable
            getOptionLabel={option => option.NAME}
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
            value={filterData?.deadline?.length > 0 ? filterData.deadline[0] : null}
            onChange={filterHandlers.filterDeadlineChange}
            renderOption={(props, option, { selected }) => (
              <li {...props} key={option.ID}>
                {option.NAME}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  '& .MuiInputBase-root': {
                    height: '38px'
                  }
                }}
                size="small"
                placeholder="Фильтр по сроку"
              />
            )}
          />
        }
      />
    );
  }
  , [tabNo, filterData, columnsIsFetching]);

  const KanbanBoardMemo = useMemo(() => <KanbanBoard columns={columns} isLoading={componentIsFetching} />, [columns, componentIsFetching]);

  const KanbanListMemo = useMemo(() =>
    <Box className={styles.kanbanListContainer}>
      <KanbanList columns={columns} />
    </Box>
  , [columns]);

  const memoAddCard = useMemo(() =>
    <KanbanEditCard
      open={upsertCard}
      deleteable={false}
      stages={columns}
      onSubmit={cardHandlers.handleSubmit}
      onCancelClick={cardHandlers.handleCancel}
    />,
  [upsertCard, columns]);

  const refContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /** Для изменения общего внешнего контейнера */
    const parent = refContainer.current?.parentElement;
    if (!parent) {
      return;
    }
    const oldMaxWidth = parent.style.maxWidth;
    parent.style.maxWidth = '100%';

    return () => {
      parent.style.maxWidth = oldMaxWidth;
    };
  }, []);

  useEffect(() => {
    if (!addedCard) return;
    const cardId = addedCard[0].ID;
    const cardParentId = addedCard[0].USR$MASTERKEY;

    const column = columns.find(({ ID }) => ID === cardParentId);
    const cardFindIndex = column?.CARDS?.findIndex(({ ID }) => ID === cardId) ?? -1;
    const cachedCard = column?.CARDS[cardFindIndex];


    if (!((addingCard.current?.TASKS?.length ?? 0) > (cachedCard?.TASKS?.length ?? 0))) return;

    addingCard.current?.TASKS?.forEach(task => addTask({ ...task, USR$CARDKEY: cardId }));
  }, [addCardSuccess, addedCard]);

  return (
    <Stack
      ref={refContainer}
      spacing={2}
      style={{
        width: '100%'
      }}
    >
      {componentIsFetching
        ?
        <div>
          <Skeleton variant="rectangular" className={styles.skeletonHeader} />
          {/* <Skeleton variant="rectangular" className={styles.skeletonBody} /> */}
        </div>
        : Header
      }
      {DealsFilterMemo}
      <div className={styles.dataContainer}>
        {(() => {
          switch (tabNo) {
            case '0':
              return KanbanBoardMemo;
            case '1':
              return KanbanListMemo;
            default:
              return <></>;
          }
        })()}
      </div>
      {memoAddCard}
    </Stack>
  );
}

export default Deals;
