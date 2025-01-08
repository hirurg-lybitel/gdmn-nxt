import { IKanbanCard, IKanbanColumn, ITimeTrackProject, Permissions } from '@gsbelarus/util-api-types';
import { DataGridProProps, GRID_DETAIL_PANEL_TOGGLE_COL_DEF, GridColDef, GridGroupNode, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid-pro';
import { useCallback, useMemo, useState } from 'react';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import StyledGrid, { renderCellExpand } from '../../Styled/styled-grid/styled-grid';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import EditIcon from '@mui/icons-material/Edit';
import { useAddCardMutation, useAddTaskMutation, useDeleteCardMutation, useDeleteTaskMutation, useUpdateCardMutation, useUpdateTaskMutation } from '../../../features/kanban/kanbanApi';
import { RootState } from '@gdmn-nxt/store';
import { useSelector } from 'react-redux';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import { CustomGridTreeDataGroupingCell } from './custom-grid-tree-data-grouping-cell';
import { IconButton } from '@mui/material';
import ItemButtonEdit from '@gdmn-nxt/components/item-button-edit/item-button-edit';
import DetailPanel from './detailPanel';

export interface KanbanListProps {
  columns?: IKanbanColumn[]
  loading?: boolean;
  gridColumns?: GridColDef[];
  disableAddCard?: boolean;
  editable?: boolean;
}

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
  }
];

export function KanbanList(props: KanbanListProps) {
  const {
    columns = [],
    gridColumns = defaultGridColumns,
    disableAddCard = false,
    loading = false,
    editable = true
  } = props;

  const [addCard, setAddCard] = useState(false);
  const [editCard, setEditCard] = useState(false);
  const [card, setCard] = useState<IKanbanCard>();
  const [column, setColumn] = useState<IKanbanColumn>();
  const [insertCard, { isSuccess: addCardSuccess, data: addedCard, isLoading: insertIsLoading }] = useAddCardMutation();
  const [updateCard, { isSuccess: updateCardSuccess, isLoading: updateIsLoading }] = useUpdateCardMutation();
  const [deleteCard, { isLoading: deleteIsLoading }] = useDeleteCardMutation();
  const [addTask, { isSuccess: addTaskSuccess }] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const handleCardAdd = useCallback((columnId: number) => {
    setColumn(columns.find(c => c.ID === columnId));
    setAddCard(true);
  }, [columns]);

  const cols: GridColDef<IKanbanColumn>[] = useMemo(() => ([
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      headerName: 'Сделка',
      flex: 1,
      width: 320,
      maxWidth: 320,
      minWidth: 320,
      renderHeader: () => 'Сделка',
      renderCell: (params) => (
        <CustomGridTreeDataGroupingCell
          {...params as GridRenderCellParams<any, any, any, GridGroupNode>}
          columns={columns}
          onCardAddClick={handleCardAdd}
          disableAddCard={disableAddCard}
        />
      )
    },
    ...gridColumns,
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      renderCell: (params) => <div />
    }
  ]), [columns, disableAddCard, gridColumns, handleCardAdd]);

  const deleteTasks = useCallback((newCard: IKanbanCard) => {
    let cardIndex = 0;
    const columnIndex = columns.findIndex(r => {
      const index = r.CARDS.findIndex(card => card.ID === newCard.ID);
      if (index < 0) return true;
      cardIndex = index;
      return true;
    });
    if (columnIndex < 0 || cardIndex < 0) return;
    const oldCard: IKanbanCard = columns[columnIndex].CARDS[cardIndex];
    const deletedTasks = oldCard.TASKS?.filter(task => (newCard.TASKS?.findIndex(({ ID }) => ID === task.ID) ?? -1) < 0) ?? [];
    deletedTasks.forEach(task => deleteTask(task.ID));
  }, [columns, deleteTask]);

  const upsertTasks = useCallback((newCard: IKanbanCard) => {
    let cardIndex = 0;
    const columnIndex = columns.findIndex(r => {
      const index = r.CARDS.findIndex(card => card.ID === newCard.ID);
      if (index < 0) return true;
      cardIndex = index;
      return true;
    });
    if (columnIndex < 0 || cardIndex < 0) return;
    const oldCard: IKanbanCard = columns[columnIndex].CARDS[cardIndex];
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
  }, [addTask, columns, updateTask]);

  const onEditCard = useCallback(async (newCard: IKanbanCard) => {
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
  }, [columns, updateCard]);

  const onDelete = useCallback(async (deletingCard: IKanbanCard) => deleteCard(deletingCard), [deleteCard]);

  const onAddCard = useCallback(async (newCard: IKanbanCard) => insertCard(newCard), [insertCard]);

  const cardHandlers = {
    handleSubmit: useCallback(async (newCard: IKanbanCard, deleting: boolean) => {
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
    }, [addCard, deleteTasks, editCard, onAddCard, onDelete, onEditCard, upsertTasks]),
    handleCancel: useCallback(async (newCard: IKanbanCard) => {
      editCard && setEditCard(false);
      addCard && setAddCard(false);

      if (newCard.ID > 0) {
        deleteTasks(newCard);
        upsertTasks(newCard);
      }
    }, [addCard, deleteTasks, editCard, upsertTasks]),
  };

  const handleCardEdit = useCallback((card: IKanbanCard) => {
    setCard(card);
    setEditCard(true);
  }, []);

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
  }, [card, cardHandlers.handleCancel, cardHandlers.handleSubmit, columns, editCard]);

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
  }, [addCard, cardHandlers.handleCancel, cardHandlers.handleSubmit, column, columns]);

  const getDetailPanelContent = useCallback(({ row }: GridRowParams<IKanbanColumn>) =>
    <DetailPanel
      column={row}
      onEditClick={handleCardEdit}
      gridColumns={gridColumns}
      editable={editable}
    />
  , [editable, gridColumns, handleCardEdit]);

  return (
    <CustomizedCard
      borders
      style={{
        flex: 1,
      }}
    >
      <StyledGrid
        rows={columns || []}
        columns={cols}
        loading={loading}
        getDetailPanelHeight={() => 'auto'}
        getDetailPanelContent={getDetailPanelContent}
        hideFooter
        hideHeaderSeparator
      />
      {memoEditCard}
      {memoAddCard}
    </CustomizedCard>
  );
}

export default KanbanList;
