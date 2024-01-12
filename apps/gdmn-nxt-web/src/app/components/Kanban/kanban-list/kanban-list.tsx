import { IKanbanCard, IKanbanColumn, Permissions } from '@gsbelarus/util-api-types';
import { DataGridProProps, GridColDef, GridRowParams } from '@mui/x-data-grid-pro';
import { useMemo, useState } from 'react';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import StyledGrid, { renderCellExpand } from '../../Styled/styled-grid/styled-grid';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import EditIcon from '@mui/icons-material/Edit';
import { useAddCardMutation, useAddTaskMutation, useDeleteCardMutation, useDeleteTaskMutation, useUpdateCardMutation, useUpdateTaskMutation } from '../../../features/kanban/kanbanApi';
import { RootState } from '../../../store';
import { useSelector } from 'react-redux';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import { CustomGridTreeDataGroupingCell } from './custom-grid-tree-data-grouping-cell';
import { IconButton } from '@mui/material';

export interface KanbanListProps {
  columns?: IKanbanColumn[]
  gridColumns?: GridColDef[];
  disableAddCard?: boolean;
}

export function KanbanList(props: KanbanListProps) {
  const { columns = [], gridColumns, disableAddCard = false } = props;

  const defaultGridColumns: GridColDef[] = [
    {
      field: 'CONTACT',
      headerName: 'Клиент',
      flex: 1,
      minWidth: 200,
      sortComparator: (a, b) => ('' + a?.NAME || '').localeCompare(b?.NAME || ''),
      renderCell: (params) => renderCellExpand(params, params.value?.NAME),
    },
    {
      field: 'USR$DEADLINE',
      headerName: 'Срок',
      type: 'date',
      width: 150,
      resizable: false,
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleDateString() || null : null,
    },
    {
      field: 'USR$AMOUNT',
      headerName: 'Сумма',
      type: 'number',
      width: 150,
      minWidth: 100,
      valueGetter: ({ value }) => value || '',
    },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      getActions: (params: GridRowParams) => [
        Object.keys(params.row).length > 0
          ? <>
            <PermissionsGate actionAllowed={userPermissions?.deals.PUT}>
              <IconButton
                key={1}
                color="primary"
                size="small"
                onClick={handleCardEdit(params.row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </PermissionsGate>
          </>
          : <></>
      ]
    }
  ];

  const [addCard, setAddCard] = useState(false);
  const [editCard, setEditCard] = useState(false);
  const [card, setCard] = useState<IKanbanCard>();
  const [column, setColumn] = useState<IKanbanColumn>();
  const [cols, setCols] = useState<GridColDef[]>(gridColumns || defaultGridColumns);
  const [insertCard, { isSuccess: addCardSuccess, data: addedCard, isLoading: insertIsLoading }] = useAddCardMutation();
  const [updateCard, { isSuccess: updateCardSuccess, isLoading: updateIsLoading }] = useUpdateCardMutation();
  const [deleteCard, { isLoading: deleteIsLoading }] = useDeleteCardMutation();
  const [deletingCardIDs, setDeletingCardIDs] = useState<number[]>([]);
  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);
  const [addTask, { isSuccess: addTaskSuccess }] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const rows: IKanbanCard[] = useMemo(() => {
    const newRows: any[] = [];
    columns?.forEach(col => col.CARDS.forEach(card => {
      if (!deletingCardIDs.includes(card.ID)) {
        newRows.push({ ...card, ...card.DEAL, ID: card.ID, hierarchy: [col.ID, card.ID] });
      }
    }));
    return newRows;
  }, [columns, deletingCardIDs]);

  const deleteTasks = (newCard: IKanbanCard) => {
    const findIndex = rows.findIndex(r => r.ID === newCard.ID);
    if (findIndex < 0) return;

    const oldCard: IKanbanCard = rows[findIndex];
    const deletedTasks = oldCard.TASKS?.filter(task => (newCard.TASKS?.findIndex(({ ID }) => ID === task.ID) ?? -1) < 0) ?? [];
    deletedTasks.forEach(task => deleteTask(task.ID));
  };

  const upsertTasks = (newCard: IKanbanCard) => {
    const findIndex = rows.findIndex(r => r.ID === newCard.ID);
    if (findIndex < 0) return;

    const oldCard: IKanbanCard = rows[findIndex];

    newCard.TASKS?.forEach(task => {
      const oldTask = oldCard.TASKS?.find(({ ID }) => ID === task.ID);
      if (!oldTask) {
        addTask({ ...task, ID: -1 });
        return;
      };

      if (JSON.stringify(task) !== JSON.stringify(oldTask)) {
        updateTask(task);
      };
    });
  };

  const onEditCard = async (newCard: IKanbanCard) => {
    updateCard(newCard);

    let oldCard: IKanbanCard = newCard;
    columns.every(column => {
      const value = column.CARDS.find(card => card.ID === newCard.ID);

      if (value) {
        oldCard = value;
        return false;
      };

      return true;
    });
  };

  const onDelete = async (deletingCard: IKanbanCard) => {
    deleteCard(deletingCard);
    setDeletingCardIDs(prev => prev.concat(deletingCard.ID));
  };

  const onAddCard = async (newCard: IKanbanCard) => {
    insertCard(newCard);
  };

  const cardHandlers = {
    handleSubmit: async (newCard: IKanbanCard, deleting: boolean) => {
      if (deleting) {
        onDelete(newCard);
      } else {
        if (newCard.ID) {
          onEditCard(newCard);
        };
        if (!newCard.ID) {
          editCard && setEditCard(false);
          addCard && setAddCard(false);
          onAddCard(newCard);
        }
        deleteTasks(newCard);
        upsertTasks(newCard);
      };
      editCard && setEditCard(false);
      addCard && setAddCard(false);
    },
    handleCancel: async (newCard: IKanbanCard) => {
      editCard && setEditCard(false);
      addCard && setAddCard(false);

      if (newCard.ID > 0) {
        deleteTasks(newCard);
        upsertTasks(newCard);
      }
    },
  };

  const handleCardEdit = (id: any): any => () => {
    setCard(id);
    setEditCard(true);
  };

  const handleCardAdd = (columnId: number) => {
    setColumn(columns.find(c => c.ID === columnId));
    setAddCard(true);
  };

  const memoEditCard = useMemo(() => {
    return (
      <KanbanEditCard
        open={editCard}
        card={card}
        currentStage={columns?.find(column => column.ID === card?.USR$MASTERKEY)}
        stages={columns}
        onSubmit={cardHandlers.handleSubmit}
        onCancelClick={cardHandlers.handleCancel}
      />
    );
  }, [editCard]);

  const memoAddCard = useMemo(() => {
    return (
      <KanbanEditCard
        open={addCard}
        currentStage={column}
        stages={columns}
        onSubmit={cardHandlers.handleSubmit}
        onCancelClick={cardHandlers.handleCancel}
      />
    );
  }, [addCard]);


  const groupingColDef: DataGridProProps['groupingColDef'] = {
    headerName: 'Сделка',
    flex: 1,
    minWidth: 200,
    renderCell: (params) => <CustomGridTreeDataGroupingCell
      {...params}
      columns={columns}
      onCardAddClick={handleCardAdd}
      disableAddCard={disableAddCard}
                            />,
  };

  const getTreeDataPath: DataGridProProps['getTreeDataPath'] = (row) => {
    return row?.hierarchy || [];
  };

  return (
    <CustomizedCard
      borders
      style={{
        flex: 1,
      }}
    >
      <StyledGrid
        treeData
        rows={rows || []}
        columns={cols}
        loading={cols.length === 0}
        getTreeDataPath={getTreeDataPath}
        groupingColDef={groupingColDef}
        hideFooter
        hideHeaderSeparator
      />
      {memoEditCard}
      {memoAddCard}
    </CustomizedCard>
  );
}

export default KanbanList;
