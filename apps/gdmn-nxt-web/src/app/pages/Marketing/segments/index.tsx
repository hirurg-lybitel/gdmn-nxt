import { SegmentUpsert } from '@gdmn-nxt/components/Segments/segment-upsert';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import CustomAddButton from '@gdmn-nxt/components/helpers/custom-add-button';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import usePermissions from '@gdmn-nxt/components/helpers/hooks/usePermissions';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { IFilteringData, IPaginationData, ISegment, ISortingData } from '@gsbelarus/util-api-types';
import { Box, CardContent, CardHeader, Divider, IconButton, Stack, Typography } from '@mui/material';
import { GridColDef, GridRenderCellParams, GridRowParams, GridSortModel } from '@mui/x-data-grid-pro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { saveFilterData } from '../../../store/filtersSlice';
import { useAddSegmentMutation, useDeleteSegmentMutation, useGetAllSegmentsQuery, useUpdateSegmentMutation } from '../../../features/Marketing/segments/segmentsApi';
import { useFilterStore } from '@gdmn-nxt/components/helpers/hooks/useFilterStore';

export default function CustomersSegments() {
  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: 20,
  });

  const filterEntityName = 'segments';
  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName);

  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[`${filterEntityName}`]);

  const dispatch = useDispatch();
  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: filteringData }));
  }, []);

  const handleFilteringDataChange = useCallback((newValue: IFilteringData) => saveFilters(newValue), []);

  const requestSearch = useCallback((value: string) => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange({
      ...newObject,
      ...(value !== '' ? { name: [value] } : {})
    });
    setPaginationData(prev => ({ ...prev, pageNo: 0 }));
  }, [filterData]);

  const cancelSearch = useCallback(() => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange(newObject);
  }, [filterData]);

  const [sortingData, setSortingData] = useState<ISortingData | null>();

  const { data: sermentsData = {
    count: 0,
    segments: []
  }, isFetching: segmentsIsFetching, isLoading: segmentsIsLoading, refetch: sermentsRefresh } = useGetAllSegmentsQuery({
    pagination: paginationData,
    ...(filterData && { filter: filterData }),
    ...(sortingData ? { sort: sortingData } : {})
  });

  const [addSegment, { isLoading: addIsLoading }] = useAddSegmentMutation();
  const [updateSegment, { isLoading: updateIsLoading }] = useUpdateSegmentMutation();
  const [deleteSegment, { isLoading: deleteIsLoading }] = useDeleteSegmentMutation();

  const isLoading = addIsLoading || updateIsLoading || deleteIsLoading || segmentsIsFetching || segmentsIsLoading;

  const [upsertSegment, setUpsertSegment] = useState<{
    addSegment: boolean;
    editSegment?: boolean;
    segment?: ISegment
  }>({
    addSegment: false,
    editSegment: false
  });

  const handleClose = () => {
    setUpsertSegment({ addSegment: false, editSegment: false });
  };

  const handleSegmentUpsertSubmit = async (segment: any, deleting?: boolean) => {
    handleClose();
    if (deleting) {
      deleteSegment(segment.ID);
      return;
    }
    if (upsertSegment.addSegment) {
      addSegment(segment);
      return;
    }
    updateSegment([segment, segment.ID]);
  };

  const itemEditClick = (segment: ISegment) => () => {
    setUpsertSegment({ addSegment: false, editSegment: true, segment });
  };

  const columns: GridColDef<any>[] = [
    { field: 'NAME', headerName: 'Наименование', flex: 1, },
    { field: 'QUANTITY', headerName: 'Получатели', width: 150, sortable: false, },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      // width: 50,
      renderCell: ({ value, row }: GridRenderCellParams) => {
        return (
          <IconButton
            color="primary"
            size="small"
            onClick={itemEditClick(row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        );
      }
    }
  ];

  const memoSegmentEdit = useMemo(() =>
    <SegmentUpsert
      open={!!upsertSegment.editSegment}
      segment={upsertSegment.segment!}
      onSubmit={handleSegmentUpsertSubmit}
      onCancel={handleClose}
    />,
  [upsertSegment.editSegment, upsertSegment.segment]);

  const memoSegmentAdd = useMemo(() =>
    <SegmentUpsert
      open={!!upsertSegment.addSegment}
      onSubmit={handleSegmentUpsertSubmit}
      onCancel={handleClose}
    />,
  [upsertSegment.addSegment]);
  const rowPerPage = 20;
  const [pageOptions, setPageOptions] = useState<number[]>([
    rowPerPage,
    rowPerPage * 2,
    rowPerPage * 5,
    rowPerPage * 10
  ]);

  useEffect(() => {
    setPageOptions([
      rowPerPage,
      rowPerPage * 2,
      rowPerPage * 5,
      rowPerPage * 10
    ]);
  }, [paginationData]);

  return (
    <CustomizedCard style={{ flex: 1 }}>
      {memoSegmentEdit}
      {memoSegmentAdd}
      <CardHeader
        title={<Typography variant="pageHeader">Сегменты</Typography>}
        action={
          <Stack direction="row" spacing={1}>
            <Box paddingX={'4px'} />
            <SearchBar
              disabled={segmentsIsLoading || filtersIsLoading}
              onCancelSearch={cancelSearch}
              onRequestSearch={requestSearch}
              fullWidth
              cancelOnEscape
              value={
                filterData?.name
                  ? filterData.name[0]
                  : undefined
              }
            />
            <Box display="inline-flex" alignSelf="center">
              <CustomAddButton
                disabled={(segmentsIsFetching || segmentsIsLoading)}
                label="Создать сегмент"
                onClick={() => setUpsertSegment({ addSegment: true })}
              />
            </Box>
            <Box display="inline-flex" alignSelf="center">
              <CustomLoadingButton
                hint="Обновить данные"
                loading={isLoading}
                onClick={() => sermentsRefresh()}
              />
            </Box>
          </Stack>
        }
      />
      <Divider />
      <CardContent style={{ padding: 0 }}>
        <StyledGrid
          columns={columns}
          rows={sermentsData.segments}
          pagination
          pageSizeOptions={pageOptions}
          paginationModel={{ page: paginationData.pageNo, pageSize: paginationData?.pageSize }}
          onPaginationModelChange={(data: {page: number, pageSize: number}) => {
            setPaginationData({
              ...paginationData,
              pageSize: data.pageSize,
              pageNo: data.page
            });
          }}
          rowCount={sermentsData.count}
          paginationMode="server"
          sortingMode="server"
          onSortModelChange={(sortModel: GridSortModel) => setSortingData(sortModel.length > 0 ? { ...sortModel[0] } : null)}
          hideHeaderSeparator
          disableMultipleRowSelection
          hideFooterSelectedRowCount
          disableColumnResize
          disableColumnReorder
          disableColumnFilter
          disableColumnMenu
          onRowDoubleClick={({ row }) => itemEditClick(row)}
          loading={isLoading}

        />
      </CardContent>
    </CustomizedCard>
  );
};
