import styles from './deal-sources.module.less';
import { Box, Button, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';
import { GridActionsCellItem, GridColumns, GridRowParams } from '@mui/x-data-grid-pro';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import StyledGrid from 'apps/gdmn-nxt-web/src/app/components/Styled/styled-grid/styled-grid';
import { useAddDealSourceMutation, useDeleteDealSourceMutation, useGetDealSourcesQuery, useUpdateDealSourceMutation } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanCatalogsApi';
import EditIcon from '@mui/icons-material/Edit';
import DealSourceUpsert from 'apps/gdmn-nxt-web/src/app/components/Kanban/deal-source-upsert/deal-source-upsert';
import { useCallback, useMemo, useState } from 'react';
import { IDealSource } from '@gsbelarus/util-api-types';
import CardToolbar from 'apps/gdmn-nxt-web/src/app/components/Styled/card-toolbar/card-toolbar';


/* eslint-disable-next-line */
export interface DealSourcesProps {}

export function DealSources(props: DealSourcesProps) {
  const { data = [], isLoading, isFetching } = useGetDealSourcesQuery(undefined, { pollingInterval: 5 * 60 * 1000 });
  const [insertDealSource] = useAddDealSourceMutation();
  const [updateDealSource, { isLoading: updateDealSourceIsLoading }] = useUpdateDealSourceMutation();
  const [deleteDealSource, { isLoading: deleteDealSourceIsLoading }] = useDeleteDealSourceMutation();

  const [upsertSource, setUpsertSource] = useState(false);
  const [dealSource, setDealSource] = useState<IDealSource>();

  const handleCancel = useCallback(() => setUpsertSource(false), []);

  const handleAddSource = useCallback(() => {
    setDealSource(undefined);
    setUpsertSource(true);
  }, []);

  const handleEditSource = useCallback((dealSource?: IDealSource) => () => {
    setDealSource(dealSource);
    setUpsertSource(true);
  }, []);

  const handleSubmit = useCallback((dealSource: IDealSource) => {
    if (dealSource.ID > 0) {
      updateDealSource(dealSource);
    } else {
      insertDealSource(dealSource);
    };
    setUpsertSource(false);
  }, []);

  const handleDelete = useCallback((id: number) => {
    deleteDealSource(id);
    setUpsertSource(false);
  }, []);

  const columns: GridColumns = [
    { field: 'NAME', headerName: 'Наименование', flex: 1, cellClassName: styles.ColName, },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      getActions: (params: GridRowParams) => [
        Object.keys(params.row).length > 0
          ? <GridActionsCellItem
            key={1}
            icon={<EditIcon />}
            onClick={handleEditSource(params.row)}
            label="Edit"
            color="primary"
            disabled={isFetching || deleteDealSourceIsLoading || updateDealSourceIsLoading}
          />
          : <></>
      ]
    }
  ];

  const memoUpsertDealSource = useMemo(() =>
    <DealSourceUpsert
      open={upsertSource}
      dealSource={dealSource}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onDelete={handleDelete}
    />, [upsertSource, dealSource]);


  return (
    <CustomizedCard
      borders
      className={styles.Card}
    >
      <CardHeader title={<Typography variant="pageHeader">Источники заявок</Typography>} />
      <Divider />
      <CardToolbar>
        <Stack direction="row">
          <Box flex={1} />
          <Button
            variant="contained"
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
          rowHeight={80}
          hideHeaderSeparator
        />
        {memoUpsertDealSource}
      </CardContent>
    </CustomizedCard>
  );
}

export default DealSources;
