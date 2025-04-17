import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { Box, CardContent, CardHeader, Divider, Stack, Typography, useMediaQuery } from '@mui/material';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import { useGetContractsListQuery } from '../../../features/contracts-list/contractsListApi';
import { useCallback, useMemo, useState } from 'react';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { columns } from './columns';
import useSystemSettings from '@gdmn-nxt/helpers/hooks/useSystemSettings';
import { ContractType, IContract, IFilteringData, ISortingData } from '@gsbelarus/util-api-types';
import CustomAddButton from '@gdmn-nxt/helpers/custom-add-button';
import { GridRowParams, GridSortModel } from '@mui/x-data-grid-pro';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import { clearFilterData, saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import DetailContent from './detail-content';
import CustomFilterButton from '@gdmn-nxt/helpers/custom-filter-button';
import { ContractsFilter } from '@gdmn-nxt/components/contracts/contracts-filter';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';

export interface ContractsProps {}

interface Pagination {
  pageNo: number;
  pageSize: number;
}

export function Contracts(props: ContractsProps) {
  const filterEntityName = 'contracts';
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[`${filterEntityName}`]);
  const [openFilters, setOpenFilters] = useState(false);
  const dispatch = useDispatch();
  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName);

  const [pagination, setPagination] = useState<Pagination>({
    pageNo: 0,
    pageSize: 20
  });
  const [sortingData, setSortingData] = useState<ISortingData | null>();

  const {
    data: contracts,
    isFetching: contractsIsFetching,
    isLoading: contactsIsLoading,
    refetch
  } = useGetContractsListQuery({
    pagination,
    ...(filterData && { filter: filterData }),
    ...(sortingData ? { sort: sortingData } : {})
  });

  const refreshClick = useCallback(() => refetch(), []);

  const userPermissions = usePermissions();
  const systemSettings = useSystemSettings();

  const mobile = useMediaQuery('(pointer: coarse)');

  const cols = columns[mobile ? 'mobile' : 'default'][ContractType.BG];

  const pageOnChange = useCallback((pageNo: number) =>
    setPagination(prev => ({
      ...prev,
      ...(!isNaN(pageNo) && { pageNo })
    })),
  []);

  const pageSizeOnChange = useCallback((pageSize: number) =>
    setPagination(prev => ({
      ...prev,
      ...(pageSize && { pageSize })
    })),
  []);

  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: filteringData }));
  }, []);

  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    setSortingData(sortModel.length > 0 ? { ...sortModel[0] } : null);
  }, []);

  const handleFilteringDataChange = useCallback((newValue: IFilteringData) => saveFilters(newValue), []);

  const requestSearch = useCallback((value: string) => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange({
      ...newObject,
      ...(value !== '' ? { name: [value] } : {})
    });
  }, []);

  const cancelSearch = useCallback(() => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange(newObject);
  }, []);

  const filterHandlers = {
    filterClick: useCallback(() => {
      setOpenFilters(true);
    }, []),
    filterClose: useCallback(() => {
      setOpenFilters(false);
    }, [setOpenFilters]),
    filterClear: useCallback(() => {
      dispatch(clearFilterData({ filterEntityName }));
    }, [dispatch]),
  };

  const getDetailPanelContent = useCallback(({ row }: GridRowParams<IContract>) => <DetailContent row={row} />, []);

  const memoFilter = useMemo(() =>
    <ContractsFilter
      open={openFilters}
      onClose={filterHandlers.filterClose}
      filteringData={filterData}
      onFilteringDataChange={handleFilteringDataChange}
      onClear={filterHandlers.filterClear}

    />,
  [openFilters, filterData, filterHandlers.filterClear, filterHandlers.filterClose, handleFilteringDataChange]);

  return (
    <CustomizedCard style={{ flex: 1 }}>
      <CustomCardHeader
        search
        filter
        refetch
        title={'Договоры'}
        isLoading={contactsIsLoading || filtersIsLoading}
        isFetching={contactsIsLoading || filtersIsFetching}
        onCancelSearch={cancelSearch}
        onRequestSearch={requestSearch}
        searchValue={filterData?.name?.[0]}
        onRefetch={refreshClick}
        onFilterClick={filterHandlers.filterClick}
        hasFilters={Object.keys(filterData || {}).filter(f => f !== 'name').length > 0}
        // addButton={userPermissions?.contacts?.POST}
        // onAddClick={() => setUpsertContact({ addContact: true })}
        // addButtonTooltip="Создать договор"

      />
      <Divider />
      <CardContent style={{ padding: 0 }}>
        <StyledGrid
          rows={contracts?.records ?? []}
          rowCount={contracts?.count ?? 0}
          columns={cols}
          loading={contractsIsFetching}
          pagination
          paginationMode="server"
          onPaginationModelChange={(data: {page: number, pageSize: number}) => {
            setPagination({
              ...pagination,
              pageSize: data.pageSize,
              pageNo: data.page
            });
          }}
          paginationModel={{ page: pagination.pageNo, pageSize: pagination?.pageSize }}
          pageSizeOptions={[10, 20, 50]}
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          getDetailPanelHeight={() => 'auto'}
          getDetailPanelContent={getDetailPanelContent}
        />
      </CardContent>
      {memoFilter}
    </CustomizedCard>
  );
};
