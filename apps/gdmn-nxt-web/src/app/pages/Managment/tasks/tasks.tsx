import styles from './tasks.module.less';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAddTaskMutation, useGetKanbanTasksQuery } from '../../../features/kanban/kanbanApi';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { Autocomplete, Badge, BottomNavigation, BottomNavigationAction, Box, CircularProgress, Divider, IconButton, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import KanbanTasksBoard from '../../../components/Kanban/kanban-tasks-board/kanban-tasks-board';
import KanbanTasksList from '../../../components/Kanban/kanban-tasks-list/kanban-tasks-list';
import KanbanEditTask from '../../../components/Kanban/kanban-edit-task/kanban-edit-task';
import { IKanbanTask } from '@gsbelarus/util-api-types';
import PermissionsGate from '../../../components/Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import TasksFilter, { IFilteringData } from '../../../components/Kanban/tasks-filter/tasks-filter';
import { clearFilterData, saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';

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
    dispatch(clearFilterData({ filterEntityName }));
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
      <CustomCardHeader
        search
        filter
        refetch
        searchPlaceholder="Поиск задачи"
        isLoading={isLoading}
        isFetching={columnsIsFetching}
        searchValue={filterData?.name?.[0]}
        onRefetch={refreshBoard}
        onFilterClick={filterClick}
        onCancelSearch={cancelSearch}
        onRequestSearch={requestSearch}
        hasFilters={Object.keys(filterData || {}).filter(f => f !== 'name').length > 0}
        addButton={userPermissions?.tasks?.POST}
        onAddClick={addTaskClick}
        addButtonHint="Создать задачу"
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
      />
    );
  }
  , [isLoading, columnsIsFetching, filterData, filterClick, cancelSearch, requestSearch, userPermissions?.tasks?.POST, tabNo, refetch]);

  const KanbanBoardMemo = useMemo(() => <KanbanTasksBoard columns={columns} isLoading={isLoading} />, [columns, isLoading]);

  const KanbanListMemo = useMemo(() => <KanbanTasksList columns={columns} isLoading={isLoading} />, [columns, isLoading]);

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

  return (
    <Stack
      ref={refContainer}
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
