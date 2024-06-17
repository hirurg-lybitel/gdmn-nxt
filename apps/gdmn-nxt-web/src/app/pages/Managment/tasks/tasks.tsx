import styles from './tasks.module.less';
import { useCallback, useMemo, useState } from 'react';
import { useAddTaskMutation, useGetKanbanTasksQuery } from '../../../features/kanban/kanbanApi';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { Autocomplete, Badge, BottomNavigation, BottomNavigationAction, Box, CircularProgress, Divider, IconButton, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import CustomLoadingButton from '../../../components/helpers/custom-loading-button/custom-loading-button';
import KanbanTasksBoard from '../../../components/Kanban/kanban-tasks-board/kanban-tasks-board';
import KanbanTasksList from '../../../components/Kanban/kanban-tasks-list/kanban-tasks-list';
import KanbanEditTask from '../../../components/Kanban/kanban-edit-task/kanban-edit-task';
import { IKanbanTask } from '@gsbelarus/util-api-types';
import PermissionsGate from '../../../components/Permissions/permission-gate/permission-gate';
import usePermissions from '../../../components/helpers/hooks/usePermissions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import TasksFilter, { IFilteringData } from '../../../components/Kanban/tasks-filter/tasks-filter';
import { clearFilterData, saveFilterData } from '../../../store/filtersSlice';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { useFilterStore } from '../../../features/common/useFilterStore';

export interface TasksProps {}

export function Tasks(props: TasksProps) {
  const [tabNo, setTabNo] = useState('0');
  const userId = useSelector<RootState, number>(state => state.user.userProfile?.id ?? -1);
  const filterEntityName = 'tasks';
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[`${filterEntityName}`]);
  const { data: columns = [], isFetching: columnsIsFetching, isLoading, refetch } = useGetKanbanTasksQuery({
    userId, ...filterData
  });

  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName);

  const [addTask, { isSuccess: addedTaskSuccess, data: addedTask }] = useAddTaskMutation();
  const [addTaskForm, setAddTaskForm] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);

  const userPermissions = usePermissions();


  const dispatch = useDispatch();

  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: filteringData }));
  }, []);

  const handleAddTaskFormOnSubmit = useCallback((newTask: IKanbanTask) => {
    addTask(newTask);
    setAddTaskForm(false);
  }, []);

  const handleFilteringDataChange = useCallback((newValue: IFilteringData) => saveFilters(newValue), []);

  const filterClear = useCallback(() => {
    dispatch(clearFilterData(filterEntityName));
  }, [dispatch]);

  const filterClose = useCallback((event: any) => {
    setOpenFilters(false);
  }, []);

  const filterClick = useCallback(() => {
    setOpenFilters(true);
  }, []);

  const requestSearch = useCallback((value: string) => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange({
      ...newObject,
      ...(value !== '' ? { name: [value] } : {})
    });
  }, []);

  const cancelSearch = useCallback(() => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange(newObject);
  }, []);


  const memoAddTask = useMemo(() => {
    return (
      <KanbanEditTask
        open={addTaskForm}
        onSubmit={handleAddTaskFormOnSubmit}
        onCancelClick={() => setAddTaskForm(false)}
      />
    );
  }, [addTaskForm]);

  const TasksFilterMemo = useMemo(() =>
    <TasksFilter
      open={openFilters}
      filteringData={filterData}
      onClose={filterClose}
      onFilteringDataChange={handleFilteringDataChange}
      onFilterClear={filterClear}
    />,
  [openFilters, filterData, filterClose]);


  const Header = useMemo(() => {
    const refreshBoard = async () => refetch();
    const addTaskClick = async () => setAddTaskForm(true);
    return (
      <>
        <CustomizedCard
          direction="row"
          className={styles.headerCard}
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
          <SearchBar
            disabled={isLoading}
            onCancelSearch={cancelSearch}
            onRequestSearch={requestSearch}
            cancelOnEscape
            fullWidth
            placeholder="Поиск задачи"
            iconPosition="start"
            style={{
              margin: '0 8px'
            }}
            value={
              filterData && filterData.name
                ? filterData.name[0]
                : undefined
            }
          />
          <PermissionsGate actionAllowed={userPermissions?.tasks?.POST}>
            <IconButton
              disabled={columnsIsFetching}
              onClick={addTaskClick}
              color="primary"
              size="small"
            >
              <Tooltip title="Добавить новую задачу" arrow>
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
            onClick={filterClick}
            disabled={columnsIsFetching}
            size="small"
          >
            <Tooltip
              title={Object.keys(filterData || {}).filter(f => f !== 'name').length > 0
                ? 'У вас есть активные фильтры'
                : 'Выбрать фильтры'
              }
              arrow
            >
              <Badge
                color="error"
                variant={Object.keys(filterData || {}).filter(f => f !== 'name').length > 0
                  ? 'dot'
                  : 'standard'}
              >
                <FilterListIcon color={columnsIsFetching ? 'disabled' : 'primary'} />
              </Badge>
            </Tooltip>
          </IconButton>
        </CustomizedCard>
      </>
    );
  }
  , [tabNo, columnsIsFetching, filterData]);

  const KanbanBoardMemo = useMemo(() => <KanbanTasksBoard columns={columns} isLoading={isLoading} />, [columns, isLoading]);

  const KanbanListMemo = useMemo(() => <KanbanTasksList columns={columns} isLoading={isLoading} />, [columns, isLoading]);

  return (
    <Stack
      spacing={2}
      style={{
        width: '100%'
      }}
    >
      {Header}
      {memoAddTask}
      {TasksFilterMemo}
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
    </Stack>
  );
}
