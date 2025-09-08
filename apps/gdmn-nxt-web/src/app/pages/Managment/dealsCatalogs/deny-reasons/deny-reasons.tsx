import styles from './deny-reasons.module.less';
import { IDenyReason } from '@gsbelarus/util-api-types';
import { GridColDef, GridRowParams } from '@mui/x-data-grid-pro';
import { useAddDenyReasonMutation, useDeleteDenyReasonMutation, useGetDenyReasonsQuery, useUpdateDenyReasonMutation } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanCatalogsApi';
import { useCallback, useMemo, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DenyReasonsUpsert from 'apps/gdmn-nxt-web/src/app/components/Kanban/deny-reasons-upsert/deny-reasons-upsert';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import { CardContent, Divider, IconButton } from '@mui/material';
import StyledGrid from 'apps/gdmn-nxt-web/src/app/components/Styled/styled-grid/styled-grid';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';

/* eslint-disable-next-line */
export interface DenyReasonsProps { }

export function DenyReasons(props: DenyReasonsProps) {
  const { data = [], isLoading, isFetching, refetch } = useGetDenyReasonsQuery(undefined, { pollingInterval: 5 * 60 * 1000 });
  const [insertDenyReason, { isLoading: insertDenyReasonIsLoading }] = useAddDenyReasonMutation();
  const [updateDenyReason, { isLoading: updateDenyReasonIsLoading }] = useUpdateDenyReasonMutation();
  const [deleteDenyReason, { isLoading: deleteDenyReasonIsLoading }] = useDeleteDenyReasonMutation();

  const [upsertDenyReason, setUpsertDenyReason] = useState(false);
  const [denyReason, setDenyReason] = useState<IDenyReason>();

  const handleCancel = useCallback(() => setUpsertDenyReason(false), []);

  const handleAddSource = useCallback(() => {
    setDenyReason(undefined);
    setUpsertDenyReason(true);
  }, []);

  const handleEditSource = useCallback((denyReason?: IDenyReason) => () => {
    setDenyReason(denyReason);
    setUpsertDenyReason(true);
  }, []);

  const handleSubmit = useCallback((denyReason: IDenyReason) => {
    if (denyReason.ID > 0) {
      updateDenyReason(denyReason);
    } else {
      insertDenyReason(denyReason);
    };
    setUpsertDenyReason(false);
  }, [insertDenyReason, updateDenyReason]);

  const handleDelete = useCallback((id: number) => {
    deleteDenyReason(id);
    setUpsertDenyReason(false);
  }, [deleteDenyReason]);

  const columns: GridColDef[] = [
    { field: 'NAME', headerName: 'Наименование', flex: 1, cellClassName: styles.ColName, },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      getActions: (params: GridRowParams) => [
        Object.keys(params.row).length > 0
          ?
          <IconButton
            key={1}
            color="primary"
            size="small"
            disabled={isFetching || deleteDenyReasonIsLoading || updateDenyReasonIsLoading}
            onClick={handleEditSource(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          : <></>
      ]
    }
  ];

  const memoUpsertDenyReason = useMemo(() => (
    <DenyReasonsUpsert
      open={upsertDenyReason}
      denyReason={denyReason}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onDelete={handleDelete}
    />
  ), [upsertDenyReason, denyReason, handleSubmit, handleCancel, handleDelete]);


  return (
    <CustomizedCard
      className={styles.Card}
    >
      <CustomCardHeader
        title={'Причины отказа'}
        addButton
        onAddClick={handleAddSource}
        addButtonHint="Создать причину отказа"
        refetch
        onRefetch={refetch}
        isFetching={isFetching || insertDenyReasonIsLoading || updateDenyReasonIsLoading || deleteDenyReasonIsLoading}
        isLoading={isLoading}
      />
      <Divider />
      <CardContent
        className={styles.CardContent}
      >
        <StyledGrid
          rows={data}
          columns={columns}
          loading={isLoading}
          hideHeaderSeparator
        />
        {memoUpsertDenyReason}
      </CardContent>
    </CustomizedCard>
  );
}

export default DenyReasons;
