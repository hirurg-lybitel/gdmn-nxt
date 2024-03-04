import FilterListIcon from '@mui/icons-material/FilterList';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { Badge, Box, CardContent, CardHeader, Divider, IconButton, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import usePermissions from '@gdmn-nxt/components/helpers/hooks/usePermissions';
import { useGetContractsListQuery } from '../../../features/contracts-list/contractsListApi';
import { useCallback, useState } from 'react';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import ContractsList from '../../../customers/CustomerDetails/contracts-list/contracts-list';
import { columns } from './columns';
import useSystemSettings from '@gdmn-nxt/components/helpers/hooks/useSystemSettings';
import { ContractType, IFilteringData, ISortingData } from '@gsbelarus/util-api-types';
import CustomAddButton from '@gdmn-nxt/components/helpers/custom-add-button';
import { GridSortModel } from '@mui/x-data-grid-pro';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { saveFilterData } from '../../../store/filtersSlice';

export interface ContractsProps {}

interface Pagination {
  pageNo: number;
  pageSize: number;
}

export function Contracts(props: ContractsProps) {
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.contracts);
  const [openFilters, setOpenFilters] = useState(false);
  const dispatch = useDispatch();

  const [pagination, setPagination] = useState<Pagination>({
    pageNo: 0,
    pageSize: 20
  });
  const [sortingData, setSortingData] = useState<ISortingData | null>();

  const {
    data: contracts,
    isFetching: contractsIsFetching,
    // isLoading,
    refetch
  } = useGetContractsListQuery({
    pagination,
    ...(filterData && { filter: filterData }),
    ...(sortingData ? { sort: sortingData } : {})
  });

  const refreshClick = useCallback(() => refetch(), []);

  const userPermissions = usePermissions();
  const systemSettings = useSystemSettings();

  const cols = columns[systemSettings?.CONTRACTTYPE ?? ContractType.GS];

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
    dispatch(saveFilterData({ 'contracts': filteringData }));
  }, []);

  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    setSortingData(sortModel.length > 0 ? { ...sortModel[0] } : null);
  }, []);

  const handleFilteringDataChange = useCallback((newValue: IFilteringData) => saveFilters(newValue), []);

  const requestSearch = useCallback((value: string) => {
    console.log('requestSearch', filterData);
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
    filterClose: async () => {
      setOpenFilters(false);
    },
  };

  return (
    <CustomizedCard style={{ flex: 1 }}>
      <CardHeader
        title={<Typography variant="pageHeader">Договоры</Typography>}
        action={
          <Stack direction="row" spacing={1}>
            <Box paddingX={'4px'} />
            <SearchBar
              disabled={contractsIsFetching}
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
              <PermissionsGate actionAllowed={userPermissions?.contacts?.POST}>
                <CustomAddButton
                  // disabled={contractsIsFetching}
                  disabled
                  label="Создать договор"
                  // onClick={() => setUpsertContact({ addContact: true })}
                />
              </PermissionsGate>
            </Box>
            <Box display="inline-flex" alignSelf="center">
              <CustomLoadingButton
                hint="Обновить данные"
                loading={contractsIsFetching}
                onClick={refreshClick}
              />
            </Box>
            <Box display="inline-flex" alignSelf="center">
              <IconButton
                onClick={filterHandlers.filterClick}
                disabled={contractsIsFetching}
                size ="small"
              >
                <Tooltip
                  title={Object.keys(filterData || {}).filter(f => f !== 'name').length > 0
                    ? 'У вас есть активные фильтры'
                    : 'Выбрать фильтры'
                  }
                  arrow
                >
                  <Badge
                    color="error"
                    variant={
                      Object.keys(filterData || {}).filter(f => f !== 'name').length > 0
                        ? 'dot'
                        : 'standard'
                    }
                  >
                    <FilterListIcon
                      color={contractsIsFetching ? 'disabled' : 'primary'}
                    />
                  </Badge>
                </Tooltip>
              </IconButton>
            </Box>
          </Stack>
        }
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
          onPageChange={pageOnChange}
          onPageSizeChange={pageSizeOnChange}
          pageSize={pagination.pageSize}
          rowsPerPageOptions={[10, 20, 50]}
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
        />
      </CardContent>
    </CustomizedCard>
  );
};
