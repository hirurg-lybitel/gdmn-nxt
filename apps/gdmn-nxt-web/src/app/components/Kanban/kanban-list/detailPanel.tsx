import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { IDeal, IKanbanCard, IKanbanColumn, Permissions } from '@gsbelarus/util-api-types';
import { useCallback, useMemo } from 'react';
import { GridColDef, GridRowParams } from '@mui/x-data-grid-pro';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import { RootState } from '@gdmn-nxt/store';
import { useSelector } from 'react-redux';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';

interface IGridCard extends IDeal{
  card: IKanbanCard
}

interface IDetailPanelProps {
  column: IKanbanColumn,
  onEditClick: (card: IKanbanCard) => void,
  gridColumns: GridColDef[]
  editable?: boolean
}

export default function DetailPanel({ column, onEditClick, gridColumns, editable = true }: IDetailPanelProps) {
  const cards = useMemo(() => column.CARDS.map(card => ({ ...card.DEAL, card: card })), [column.CARDS]) || [];

  const handleEditClick = useCallback((card: IGridCard) => () => {
    onEditClick(card.card);
  }, [onEditClick]);

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const editCell = useMemo(() => ({
    field: 'actions',
    type: 'actions',
    resizable: false,
    width: 100,
    getActions: (params: GridRowParams) => [
      Object.keys(params.row).length > 0
        ? <PermissionsGate actionAllowed={userPermissions?.deals.PUT}>
          <ItemButtonEdit
            button
            onClick={handleEditClick(params.row)}
          />
        </PermissionsGate>
        : <></>
    ]
  }), [handleEditClick, userPermissions?.deals.PUT]);

  const cols: GridColDef<IGridCard>[] = useMemo(() => ([
    {
      headerName: 'Сделка',
      field: 'USR$NAME',
      flex: 1,
      width: 320,
      maxWidth: 320,
      minWidth: 320,
      renderCell: ({ value }) => (
        <div style={{ display: 'flex' }}>
          <div style={{ width: '48px' }} />
          {value}
        </div>
      )
    },
    ...gridColumns,
    ...(editable ? [{ ...editCell }] : [])
  ]), [editCell, editable, gridColumns]);

  const getHeight = useCallback((recordsCount = 0) => recordsCount === 0 ? 200 : recordsCount * 40, []);

  return (
    <div
      style={{
        height: getHeight(cards.length),
        width: '100%'
      }}
    >
      <StyledGrid
        hideColumnHeaders
        rows={cards}
        columns={cols}
        hideFooter
        hideHeaderSeparator
      />
    </div>
  );
}
