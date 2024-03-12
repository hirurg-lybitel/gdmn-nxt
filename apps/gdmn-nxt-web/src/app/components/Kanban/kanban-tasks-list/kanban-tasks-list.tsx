import { useCallback, useMemo, useRef, useState } from 'react';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import StyledGrid, { renderCellExpand } from '../../Styled/styled-grid/styled-grid';
import { IKanbanColumn, IKanbanTask } from '@gsbelarus/util-api-types';
import { DataGridProProps, GridColDef, GridRowParams } from '@mui/x-data-grid-pro';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import { CustomGridTreeDataGroupingCell } from './custom-grid-tree-data-grouping-cell';
import KanbanEditTask from '../kanban-edit-task/kanban-edit-task';
import { useDeleteTaskMutation, useUpdateTaskMutation } from '../../../features/kanban/kanbanApi';
import usePermissions from '../../helpers/hooks/usePermissions';
import ItemButtonEdit from '@gdmn-nxt/components/item-button-edit/item-button-edit';

export interface KanbanTasksListProps {
  columns: IKanbanColumn[];
  isLoading?: boolean;
}

export function KanbanTasksList(props: KanbanTasksListProps) {
  const { columns, isLoading = false } = props;

  const [updateTask, { isSuccess: updateCardSuccess, isLoading: updateIsLoading }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: deleteIsLoading }] = useDeleteTaskMutation();

  const userPermissions = usePermissions();
  const [deletingCardIDs, setDeletingCardIDs] = useState<number[]>([]);
  const [editTaskForm, setEditTaskForm] = useState(false);
  const currentTask = useRef<IKanbanTask | undefined>();


  const rows = useMemo(() => {
    const newRows: any[] = [];
    columns?.forEach(col => col.CARDS.forEach(card => {
      if (!deletingCardIDs.includes(card.TASK?.ID || -1)) {
        newRows.push({ ...card, ...card.DEAL, ...card.TASK, ID: card.TASK?.ID, hierarchy: [col.ID, card.TASK?.ID] });
      }
    }));
    return newRows;
  }, [columns, deletingCardIDs]);

  const setTask = (task?: IKanbanTask) => {
    currentTask.current = task;
  };

  const handleTaskEdit = (id: any): any => () => {
    setTask(id);
    setEditTaskForm(true);
  };

  const getTreeDataPath: DataGridProProps['getTreeDataPath'] = (row) => {
    return row?.hierarchy || [];
  };

  const groupingColDef: DataGridProProps['groupingColDef'] = {
    headerName: 'Задача',
    width: 300,
    minWidth: 300,
    flex: 1,
    renderCell: (params) => <CustomGridTreeDataGroupingCell {...params} columns={columns} />,
  };

  const cols: GridColDef[] = [
    {
      field: 'USR$DEADLINE',
      headerName: 'Срок',
      type: 'dateTime',
      width: 200,
      resizable: false,
      sortComparator: (a, b) => a - b,
      valueFormatter: ({ value }) =>
        value
          ? new Date(value).getHours() !== 0
            ? new Date(value).toLocaleString('defualt', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : new Date(value).toLocaleDateString() + ', Весь день'
          : null,
    },
    {
      field: 'PERFORMER',
      headerName: 'Исполнитель',
      flex: 1,
      minWidth: 200,
      maxWidth: 300,
      sortComparator: (a, b) => ('' + a?.NAME || '').localeCompare(b?.NAME || ''),
      renderCell: (params) => renderCellExpand(params, params.value?.NAME.split(' ')
        .map((el: string[], idx: number) => idx === 0 ? el : (el[0] && `${el[0]}.`))
        ?.filter(Boolean)
        ?.join(' ')),
    },
    {
      field: 'CREATOR',
      headerName: 'Постановщик',
      flex: 1,
      minWidth: 200,
      maxWidth: 300,
      sortComparator: (a, b) => ('' + a?.NAME || '').localeCompare(b?.NAME || ''),
      renderCell: (params) => renderCellExpand(params, params.value?.NAME.split(' ')
        .map((el: string[], idx: number) => idx === 0 ? el : (el[0] && `${el[0]}.`))
        ?.filter(Boolean)
        ?.join(' ')),
    },
    {
      field: 'DEAL',
      headerName: 'Сделка',
      width: 250,
      resizable: false,
      sortComparator: (a, b) => ('' + a?.USR$NAME || '').localeCompare(b?.USR$NAME || ''),
      renderCell: (params) => renderCellExpand(params, params.value?.USR$NAME),
    },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      getActions: (params: GridRowParams) => [
        Object.keys(params.row).length > 0
          ? <PermissionsGate actionAllowed={userPermissions?.tasks?.PUT}>
            <ItemButtonEdit
              color="primary"
              onClick={handleTaskEdit(params.row)}
            />
          </PermissionsGate>
          : <></>
      ]
    }
  ];

  const onDelete = async (deletingTask: IKanbanTask) => {
    deleteTask(deletingTask.ID);
    setDeletingCardIDs(prev => prev.concat(deletingTask.ID));
  };

  const handleTaskEditSubmit = useCallback((task: IKanbanTask, deleting: boolean) => {
    deleting
      ? onDelete(task)
      : updateTask(task);
    setEditTaskForm(false);
  }, []);

  const handleTaskEditCancelClick = useCallback(() => setEditTaskForm(false), []);

  const memoKanbanEditTask = useMemo(() =>
    currentTask.current
      ? <KanbanEditTask
        open={editTaskForm}
        task={currentTask.current}
        onSubmit={handleTaskEditSubmit}
        onCancelClick={handleTaskEditCancelClick}
      />
      : <></>,
  [editTaskForm]);

  return (
    <CustomizedCard
      borders
      style={{
        flex: 1,
        marginTop: 45
      }}
    >
      <StyledGrid
        treeData
        rows={rows || []}
        columns={cols}
        loading={isLoading}
        getTreeDataPath={getTreeDataPath}
        groupingColDef={groupingColDef}
        hideFooter
        hideHeaderSeparator
      />
      {memoKanbanEditTask}
    </CustomizedCard>
  );
}

export default KanbanTasksList;
