import styles from './deals.module.less';
import KanbanBoard from '../../../components/Kanban/kanban-board/kanban-board';
import { useDispatch, useSelector } from 'react-redux';
import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useAddCardMutation, useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import { RootState } from '../../../store';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { Autocomplete, Badge, IconButton, Skeleton, Stack, TextField, Tooltip, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import KanbanList from '../../../components/Kanban/kanban-list/kanban-list';
import { IKanbanCard, IKanbanFilterDeadline } from '@gsbelarus/util-api-types';
import DealsFilter, { IFilteringData } from '../../../components/Kanban/deals-filter/deals-filter';
import { clearFilterData, saveFilterData } from '../../../store/filtersSlice';
import { useGetFiltersDeadlineQuery, useGetLastUsedFilterDeadlineQuery, usePostLastUsedFilterDeadlineMutation } from '../../../features/kanban/kanbanFiltersApi';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/components/helpers/hooks/usePermissions';
import KanbanEditCard from '@gdmn-nxt/components/Kanban/kanban-edit-card/kanban-edit-card';

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
  const filtersStorage = useSelector((state: RootState) => state.filtersStorage);
  const userId = useSelector<RootState, number>(state => state.user.userProfile?.id || -1);

  const { data: cardDateFilter = [], isFetching: cardDateFilterFetching } = useGetFiltersDeadlineQuery();
  const { data: lastCardDateFilter, isFetching: lastCardDateFilterFetching, isLoading: lastCardDateFilterLoading } = useGetLastUsedFilterDeadlineQuery(userId);
  const [postLastUsedFilter] = usePostLastUsedFilterDeadlineMutation();

  const [upsertCard, setUpsertCard] = useState(false);

  useEffect(() => {
    if (lastCardDateFilterLoading) return;
    if (filtersStorage.filterData.deals?.deadline) return;

    const currentDeadline = (() => {
      /** по умолчанию Все сделки */
      const deadlineDefault = cardDateFilter?.find(f => f.CODE === 6);
      if (!lastCardDateFilter) return deadlineDefault;
      return lastCardDateFilter;
    })();
    if (filtersStorage.filterData.deals?.deadline?.ID === currentDeadline?.ID) return;

    saveFilters({ ...filtersStorage.filterData.deals, deadline: [currentDeadline] });
  }, [lastCardDateFilterLoading]);

  const {
    data: nonCachedData,
    currentData: columns = nonCachedData || [],
    isFetching: columnsIsFetching,
    isLoading,
    refetch
  } = useGetKanbanDealsQuery({
    userId,
    ...(Object.keys(filtersStorage.filterData.deals || {}).length > 0 ? { filter: filtersStorage.filterData.deals } : {}),
  }, {
    skip: Object.keys(filtersStorage.filterData.deals || {}).length === 0
  });

  const [addCard] = useAddCardMutation();

  const saveFilters = (filteringData: IFilteringData) => {
    dispatch(saveFilterData({ 'deals': filteringData }));
  };

  const refreshBoard = useCallback(() => refetch(), []);

  const filterHandlers = {
    filterClick: useCallback(() => {
      setOpenFilters(true);
    }, []),
    filterClose: async (event: any) => {
      if (
        event?.type === 'keydown' &&
        (event?.key === 'Tab' || event?.key === 'Shift')
      ) {
        return;
      }
      setOpenFilters(false);
    },
    filterClear: () => {
      dispatch(clearFilterData('deals'));
    },
    filteringDataChange: async(newValue: IFilteringData) => {
      saveFilters(newValue);
    },
    filterDeadlineChange: (e: SyntheticEvent<Element, Event>, value: IKanbanFilterDeadline) => {
      saveFilters({ ...filtersStorage.filterData.deals, deadline: [value] });

      postLastUsedFilter({
        filter: value,
        userId
      });
    },
    requestSearch: async (value: string) => {
      const newObject = { ...filtersStorage.filterData.deals };
      delete newObject.name;
      saveFilters({
        ...newObject,
        ...(value !== '' ? { name: [value] } : {})
      });
    },
    cancelSearch: async () => {
      const newObject = { ...filtersStorage.filterData.deals };
      delete newObject.name;
      saveFilters(newObject);
    }
  };

  const cardHandlers = {
    handleSubmit: async (newCard: IKanbanCard, deleting: boolean) => {
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
      filteringData={filtersStorage.filterData.deals}
      onClose={filterHandlers.filterClose}
      onFilteringDataChange={filterHandlers.filteringDataChange}
      onFilterClear={filterHandlers.filterClear}
    />,
  [openFilters, filtersStorage.filterData.deals]);

  const componentIsFetching = isLoading || Object.keys(filtersStorage.filterData.deals || {}).length === 0;

  const addDealClick = () => setUpsertCard(true);

  const Header = useMemo(() => {
    return (
      <>
        <CustomizedCard
          direction="row"
          className={styles.headerCard}
        >
          <Stack
            direction="row"
            spacing={2}
            flex={1}
          >
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
            <Autocomplete
              style={{
                width: '210px',
                minWidth: '210px'
              }}
              options={cardDateFilter}
              disableClearable
              getOptionLabel={option => option.NAME}
              isOptionEqualToValue={(option, value) => option.ID === value.ID}
              value={filtersStorage.filterData.deals?.deadline?.length > 0 ? filtersStorage.filterData.deals.deadline[0] : null}
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
            <SearchBar
              // disabled={columnsIsFetching}
              onCancelSearch={filterHandlers.cancelSearch}
              onRequestSearch={filterHandlers.requestSearch}
              cancelOnEscape
              fullWidth
              placeholder="Поиск сделки"
              iconPosition="start"
              value={
                filtersStorage.filterData.deals && filtersStorage.filterData.deals.name
                  ? filtersStorage.filterData.deals.name[0]
                  : undefined
              }
            />
            <Stack direction="row" alignItems="center">
              <PermissionsGate actionAllowed={userPermissions?.deals?.POST}>
                <IconButton
                  disabled={columnsIsFetching}
                  onClick={addDealClick}
                  color="primary"
                  size="small"
                >
                  <Tooltip title="Добавить новую сделку" arrow>
                    <AddCircleIcon />
                  </Tooltip>
                </IconButton>
              </PermissionsGate>
              <CustomLoadingButton
                hint="Обновить данные"
                loading={columnsIsFetching}
                onClick={refreshBoard}
              />
              <IconButton
                onClick={filterHandlers.filterClick}
                disabled={columnsIsFetching}
                size="small"
              >
                <Tooltip
                  title={Object.keys(filtersStorage.filterData.deals || {}).filter(f => f !== 'deadline' && f !== 'name').length > 0
                    ? 'У вас есть активные фильтры'
                    : 'Выбрать фильтры'
                  }
                  arrow
                >
                  <Badge
                    color="error"
                    variant={Object.keys(filtersStorage.filterData.deals || {}).filter(f => f !== 'deadline' && f !== 'name').length > 0
                      ? 'dot'
                      : 'standard'}
                  >
                    <FilterListIcon color="primary" />
                  </Badge>
                </Tooltip>
              </IconButton>
            </Stack>
          </Stack>
        </CustomizedCard>
      </>
    );
  }
  , [tabNo, filtersStorage.filterData.deals, columnsIsFetching]);

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
