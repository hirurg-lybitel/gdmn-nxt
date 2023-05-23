import styles from './tasks.module.less';
import { useCallback, useMemo, useState } from 'react';
import { useAddTaskMutation, useGetKanbanTasksQuery } from '../../../features/kanban/kanbanApi';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { Autocomplete, Badge, BottomNavigation, BottomNavigationAction, Box, CircularProgress, IconButton, Skeleton, Stack, Tooltip } from '@mui/material';
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

export interface TasksProps {}

export function Tasks(props: TasksProps) {
  const [tabNo, setTabNo] = useState(0);
  const userId = useSelector<RootState, number>(state => state.user.userProfile?.id || -1);
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.tasks);
  const { data: columns = [], isFetching: columnsIsFetching, isLoading, refetch } = useGetKanbanTasksQuery({
    userId, ...filterData
  });

  const [addTask, { isSuccess: addedTaskSuccess, data: addedTask }] = useAddTaskMutation();
  const [addTaskForm, setAddTaskForm] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);

  const userPermissions = usePermissions();


  const dispatch = useDispatch();

  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ 'tasks': filteringData }));
  }, []);

  const handleAddTaskFormOnSubmit = useCallback((newTask: IKanbanTask) => {
    addTask(newTask);
    setAddTaskForm(false);
  }, []);

  const handleFilteringDataChange = useCallback((newValue: IFilteringData) => saveFilters(newValue), []);

  const filterClear = useCallback(() => dispatch(clearFilterData('tasks')), []);

  const filterClose = useCallback((event: any) => setOpenFilters(false), []);

  const filterClick = useCallback(() => {
    setOpenFilters(true);
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
  [openFilters, filterData]);


  const Header = useMemo(() => {
    const refreshBoard = async () => refetch();
    const addTaskClick = async () => setAddTaskForm(true);
    return (
      <>
        <CustomizedCard
          borders
          className={styles.headerCard}
        >
          <Box flex={1} />
          <PermissionsGate actionAllowed={userPermissions?.tasks?.POST}>
            <IconButton
              disabled={columnsIsFetching}
              onClick={addTaskClick}
              color="primary"
            >
              <AddCircleIcon />
            </IconButton>
          </PermissionsGate>
          <CustomLoadingButton loading={columnsIsFetching} onClick={refreshBoard} />
          <IconButton
            onClick={filterClick}
            disabled={columnsIsFetching}
          >
            <Badge
              color="error"
              variant={Object.keys(filterData || {}).length > 0 ? 'dot' : 'standard'}
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
              <BottomNavigationAction className={styles.navigation} icon={<ViewWeekIcon />} />
            </Tooltip>
            <Tooltip title="Список" arrow>
              <BottomNavigationAction className={styles.navigation} icon={<ViewStreamIcon />} />
            </Tooltip>
          </BottomNavigation>
        </CustomizedCard>
      </>
    );
  }
  , [tabNo, columnsIsFetching]);

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
