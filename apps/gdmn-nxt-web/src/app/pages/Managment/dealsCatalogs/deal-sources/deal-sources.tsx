import styles from './deal-sources.module.less';
import { CardContent, Divider, IconButton } from '@mui/material';
import { GridColDef, GridRowParams } from '@mui/x-data-grid-pro';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import StyledGrid from 'apps/gdmn-nxt-web/src/app/components/Styled/styled-grid/styled-grid';
import { useAddDealSourceMutation, useDeleteDealSourceMutation, useGetDealSourcesQuery, useUpdateDealSourceMutation } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanCatalogsApi';
import EditIcon from '@mui/icons-material/Edit';
import DealSourceUpsert from 'apps/gdmn-nxt-web/src/app/components/Kanban/deal-source-upsert/deal-source-upsert';
import { useCallback, useMemo, useState } from 'react';
import { IDealSource } from '@gsbelarus/util-api-types';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';

/* eslint-disable-next-line */
export interface DealSourcesProps { }

export function DealSources(props: DealSourcesProps) {
  const { data = [], isLoading, isFetching, refetch } = useGetDealSourcesQuery(undefined, { pollingInterval: 5 * 60 * 1000 });
  const [insertDealSource, { isLoading: insertDealSourceIsLoading }] = useAddDealSourceMutation();
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
  }, [insertDealSource, updateDealSource]);

  const handleDelete = useCallback((id: number) => {
    deleteDealSource(id);
    setUpsertSource(false);
  }, [deleteDealSource]);

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
            onClick={handleEditSource(params.row)}
            disabled={isFetching || deleteDealSourceIsLoading || updateDealSourceIsLoading}
          >
            <EditIcon fontSize="small" />
          </IconButton>
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
    />, [upsertSource, dealSource, handleSubmit, handleCancel, handleDelete]);


  return (
    <CustomizedCard
      className={styles.Card}
    >
      <CustomCardHeader
        title={'Источники заявок'}
        addButton
        onAddClick={handleAddSource}
        addButtonHint="Создать источник заявок"
        refetch
        onRefetch={refetch}
        isFetching={isFetching || insertDealSourceIsLoading || updateDealSourceIsLoading || deleteDealSourceIsLoading}
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
        {memoUpsertDealSource}
      </CardContent>
    </CustomizedCard>
  );
}

export default DealSources;
