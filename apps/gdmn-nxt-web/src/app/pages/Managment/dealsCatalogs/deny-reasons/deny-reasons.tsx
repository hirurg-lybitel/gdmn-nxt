import styles from './deny-reasons.module.less';
import { IDenyReason } from '@gsbelarus/util-api-types';
import { GridColDef, GridRowParams } from '@mui/x-data-grid-pro';
import { useAddDenyReasonMutation, useDeleteDenyReasonMutation, useGetDenyReasonsQuery, useUpdateDenyReasonMutation } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanCatalogsApi';
import { useCallback, useMemo, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DenyReasonsUpsert from 'apps/gdmn-nxt-web/src/app/components/Kanban/deny-reasons-upsert/deny-reasons-upsert';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import { Box, Button, CardContent, CardHeader, Divider, IconButton, Stack, Typography } from '@mui/material';
import StyledGrid from 'apps/gdmn-nxt-web/src/app/components/Styled/styled-grid/styled-grid';
import CardToolbar from 'apps/gdmn-nxt-web/src/app/components/Styled/card-toolbar/card-toolbar';
import AddIcon from '@mui/icons-material/Add';

/* eslint-disable-next-line */
export interface DenyReasonsProps {}

export function DenyReasons(props: DenyReasonsProps) {
  const { data = [], isLoading, isFetching } = useGetDenyReasonsQuery(undefined, { pollingInterval: 5 * 60 * 1000 });
  const [insertDenyReason] = useAddDenyReasonMutation();
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
  }, []);

  const handleDelete = useCallback((id: number) => {
    deleteDenyReason(id);
    setUpsertDenyReason(false);
  }, []);

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

  const memoUpsertDenyReason = useMemo(() =>
    <DenyReasonsUpsert
      open={upsertDenyReason}
      denyReason={denyReason}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onDelete={handleDelete}
    />, [upsertDenyReason, denyReason]);


  return (
    <CustomizedCard
      className={styles.Card}
    >
      <CardHeader title={<Typography variant="pageHeader">Причины отказа</Typography>} />
      <Divider />
      <CardToolbar>
        <Stack direction="row">
          <Box flex={1} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={isLoading}
            onClick={handleAddSource}
          >
            Добавить
          </Button>
        </Stack>
      </CardToolbar>
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
