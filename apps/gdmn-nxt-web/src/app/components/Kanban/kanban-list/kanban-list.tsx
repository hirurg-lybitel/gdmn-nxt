import { IKanbanCard, IKanbanColumn, Permissions } from '@gsbelarus/util-api-types';
import { DataGridProProps, GridActionsCellItem, GridColumns, GridRowParams } from '@mui/x-data-grid-pro';
import { useEffect, useMemo, useRef, useState } from 'react';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import StyledGrid, { renderCellExpand } from '../../Styled/styled-grid/styled-grid';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import styles from './kanban-list.module.less';
import EditIcon from '@mui/icons-material/Edit';
import { useAddCardMutation, useDeleteCardMutation, useUpdateCardMutation } from '../../../features/kanban/kanbanApi';
import { IChanges } from '../../../pages/Managment/deals/deals';
import { RootState } from '../../../store';
import { UserState } from '../../../features/user/userSlice';
import { useSelector } from 'react-redux';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import { CustomGridTreeDataGroupingCell } from './custom-grid-tree-data-grouping-cell';
import { getArchive } from '../../../pages/Managment/getArchive';

export interface KanbanListProps {
  columns?: IKanbanColumn[]
  gridColumns?: GridColumns;
  disableAddCard?: boolean;
  archive?:boolean;
}

export function KanbanList(props: KanbanListProps) {
  const { columns:sourceColumns = [], gridColumns, disableAddCard = false, archive } = props;

  const columns = archive ? getArchive(sourceColumns) : sourceColumns

  const defaultGridColumns: GridColumns = [
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
              <GridActionsCellItem
                key={1}
                icon={<EditIcon />}
                onClick={handleCardEdit(params.row)}
                label="Edit"
                color="primary"
              />
            </PermissionsGate>
          </>
          : <></>
      ]
    }
  ];

  const changes = useRef<IChanges[]>([]);
  const [addCard, setAddCard] = useState(false);
  const [editCard, setEditCard] = useState(false);
  const [card, setCard] = useState<IKanbanCard>();
  const [column, setColumn] = useState<IKanbanColumn>();
  const [cols, setCols] = useState<GridColumns>(gridColumns || defaultGridColumns);
  const [insertCard, { isSuccess: addCardSuccess, data: addedCard, isLoading: insertIsLoading }] = useAddCardMutation();
  const [updateCard, { isSuccess: updateCardSuccess, isLoading: updateIsLoading }] = useUpdateCardMutation();
  const [deleteCard, { isLoading: deleteIsLoading }] = useDeleteCardMutation();
  const [lastAddedCard, setLastAddedCard] = useState<undefined | IKanbanCard>(undefined);
  const [lastCardShouldClear, setLastCardShouldClear] = useState<boolean>(false);
  const user = useSelector<RootState, UserState>(state => state.user);
  const [deletingCardIDs, setDeletingCardIDs] = useState<number[]>([]);
  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const lastCard = useMemo(() => {
    if (!lastAddedCard) return undefined;
    const cards = (columns.flatMap(cards => (cards.CARDS.map(card => card)))).find(card => card.ID === lastAddedCard?.ID);
    return cards;
  }, [columns, lastAddedCard]);

  const clearLastCard = (isAdd?: boolean) => {
    if (isAdd) {
      setLastCardShouldClear(true);
    }
    setLastAddedCard(undefined);
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
    handleSubmit: async (card: IKanbanCard, deleting: boolean) => {
      if (deleting) {
        onDelete(card);
      } else {
        if (card.ID) {
          onEditCard(card);
        };
        if (!card.ID) {
          editCard && setEditCard(false);
          addCard && setAddCard(false);
          clearLastCard(true);
          onAddCard(card);
        }
      };
      clearLastCard();
      editCard && setEditCard(false);
      addCard && setAddCard(false);
    },
    handleCancel: async (isFetching?: boolean) => {
      clearLastCard(!!isFetching);
      editCard && setEditCard(false);
      addCard && setAddCard(false);
    },
    handleClose: async (e: any, reason: string) => {
      if (reason === 'backdropClick') {
        editCard && setEditCard(false);
        addCard && setAddCard(false);
      }
    },
  };

  const rows = useMemo(() => {
    const newRows: any[] = [];
    columns?.forEach(col => col.CARDS.forEach(card => {
      if (!deletingCardIDs.includes(card.ID)) {
        newRows.push({ ...card, ...card.DEAL, ID: card.ID, hierarchy: [col.ID, card.ID] });
      }
    }));
    return newRows;
  }, [columns, deletingCardIDs]);

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
        card={lastCard}
        currentStage={column}
        stages={columns}
        onSubmit={cardHandlers.handleSubmit}
        onCancelClick={cardHandlers.handleCancel}
      />
    );
  }, [addCard, lastCard]);


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
