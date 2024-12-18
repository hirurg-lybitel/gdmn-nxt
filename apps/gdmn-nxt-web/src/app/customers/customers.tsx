import { GridColDef, GridSortModel, GridEventListener } from '@mui/x-data-grid-pro';
import Stack from '@mui/material/Stack/Stack';
import React, { ForwardedRef, forwardRef, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Box, List, ListItemButton, IconButton, useMediaQuery, Theme, CardHeader, Typography, Divider, CardContent, Badge, Tooltip } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import CustomerEdit from './customer-edit/customer-edit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { IContactWithID, ICustomer, ICustomerContract, ILabel, IWorkType } from '@gsbelarus/util-api-types';
import { useTheme } from '@mui/material';
import CustomizedCard from '../components/Styled/customized-card/customized-card';
import CustomersFilter, {
  IFilteringData
} from './customers-filter/customers-filter';
import SearchBar from '../components/search-bar/search-bar';
import { makeStyles } from '@mui/styles';
import { useGetCustomersQuery, useUpdateCustomerMutation, useAddCustomerMutation, IPaginationData, useDeleteCustomerMutation, useGetCustomersCrossQuery, ISortingData, useAddFavoriteMutation, useDeleteFavoriteMutation } from '../features/customer/customerApi_new';
import { clearFilterData, saveFilterData, saveFilterModel } from '../store/filtersSlice';
import LabelMarker from '../components/Labels/label-marker/label-marker';
import { useGetWorkTypesQuery } from '../features/work-types/workTypesApi';
import { useGetDepartmentsQuery } from '../features/departments/departmentsApi';
import { useGetCustomerContractsQuery } from '../features/customer-contracts/customerContractsApi';
import { useGetBusinessProcessesQuery } from '../features/business-processes';
import style from './customers.module.less';
import DataField from './dataField/DataField';
import StyledGrid from '../components/Styled/styled-grid/styled-grid';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import PermissionsGate from '../components/Permissions/permission-gate/permission-gate';
import ItemButtonEdit from '@gdmn-nxt/components/item-button-edit/item-button-edit';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';

const useStyles = makeStyles<Theme>((theme) => ({
  DataGrid: {
    border: 'none',
    '& ::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
      backgroundColor: 'transparent',
      borderRadius: '6px'
    },
    '& ::-webkit-scrollbar:hover': {
      backgroundColor: '#f0f0f0'
    },
    '& ::-webkit-scrollbar-thumb': {
      position: 'absolute',
      right: 10,
      borderRadius: '6px',
      backgroundColor: 'rgba(170, 170, 170, 0.5)'
    },
    '& ::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#999'
    },
    '&.MuiDataGrid-root .MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus':
      {
        outline: 'none'
      },
    '&.MuiDataGrid-root .MuiDataGrid-cell:focus-within': {
      outline: 'none !important'
    },
    '& .MuiDataGrid-iconSeparator': {
      display: 'none'
    },
    '& .MuiDataGrid-columnHeader': {
      padding: '24px'
    },
    '& .MuiDataGrid-columnHeader .MuiDataGrid-cell': {
      fontSize: '1rem',
    }
  },
  row: {
    '& .MuiDataGrid-row': {
      cursor: 'pointer !important',
    }
  }
}));

/* eslint-disable-next-line */
export interface CustomersProps {}

export function Customers(props: CustomersProps) {
  const classes = useStyles();
  const userPermissions = usePermissions();
  const filterEntityName = 'customers';
  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName);
  const [currentOrganization, setCurrentOrganization] = useState(0);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const filtersStorage = useSelector(
    (state: RootState) => state.filtersStorage
  );
  const filteringData = filtersStorage.filterData?.[`${filterEntityName}`];
  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: 20
  });
  const [dataChanged, setDataChanged] = useState(false);
  const [sortingData, setSortingData] = useState<ISortingData | null>();

  const setFilteringData = (newFilter: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: newFilter }));
  };

  useEffect(() => {
    setDataChanged(false);
  }, [filteringData]);

  const { data: customersCross } = useGetCustomersCrossQuery();
  const {
    data: customersResponse,
    isFetching: customerFetching,
    isLoading: customerIsLoading,
    refetch: customerRefetch
  } = useGetCustomersQuery(
    {
      pagination: paginationData,
      ...(Object.keys(filteringData || {}).length > 0 ? { filter: filteringData } : {}),
      ...(sortingData ? { sort: sortingData } : {})
    },
    { refetchOnMountOrArgChange: dataChanged }
  );

  const customersData: ICustomer[] = useMemo(
    () => [...(customersResponse?.data || [])],
    [customersResponse?.data]
  );
  const customersCount: number | undefined = useMemo(
    () => customersResponse?.count ?? 0,
    [customersResponse?.count]
  );

  const { data: wotkTypes } = useGetWorkTypesQuery();
  const { data: departments } = useGetDepartmentsQuery();
  const { data: customerContracts } = useGetCustomerContractsQuery();
  const { data: businessProcesses } = useGetBusinessProcessesQuery();
  const [customers, setCustomers] = useState<ICustomer[] | undefined>();

  useEffect(() => {
    const newCustomers = customersData?.map((customer) => {
      const DEPARTMENTS: IContactWithID[] = [];
      customersCross?.departments[customer.ID]?.forEach((el: number) => {
        const department = departments?.find((wt) => wt.ID === el);
        if (!department) return;
        DEPARTMENTS.push(department);
      });

      const JOBWORKS: IWorkType[] = [];
      customersCross?.jobWorks[customer.ID]?.forEach((el: number) => {
        const wotkType = wotkTypes?.find((wt) => wt.ID === el);
        if (!wotkType) return;
        JOBWORKS.push(wotkType);
      });

      const CONTRACTS: ICustomerContract[] = [];
      customersCross?.contracts[customer.ID]?.forEach((el: number) => {
        const customerContract = customerContracts?.find((wt) => wt.ID === el);
        if (!customerContract) return;
        CONTRACTS.push(customerContract);
      });

      return {
        ...customer,
        DEPARTMENTS,
        CONTRACTS,
        JOBWORKS
      };
    });

    setCustomers(newCustomers);
  }, [
    customerFetching,
    customersData,
    customersCross,
    wotkTypes,
    departments,
    customerContracts,
    businessProcesses
  ]);

  const [updateCustomer] = useUpdateCustomerMutation();
  const [addCustomer] = useAddCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  const [addFavorite] = useAddFavoriteMutation();
  const [deleteFavorite] = useDeleteFavoriteMutation();

  const dispatch = useDispatch();

  const theme = useTheme();
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));

  const handleLabelClick = useCallback(
    (label: ILabel) => () => {
      if (filteringData?.['LABELS']?.findIndex((l: ILabel) => l.ID === label.ID) >= 0) return;
      filterHandlers.handleFilteringData({ ...filteringData, 'LABELS': [...(filteringData?.['LABELS'] || []), label] });
    },
    [filteringData]
  );

  const handleCustomerEdit = (id: number) => () => {
    setCurrentOrganization(id);
    setOpenEditForm(true);
  };

  const handleFavoriteClick = useCallback((customer: ICustomer) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    customer.isFavorite
      ? deleteFavorite(customer.ID)
      : addFavorite(customer.ID);
  }, []);

  const columns: GridColDef<ICustomer>[] = [
    {
      field: 'isFavorite',
      headerName: '',
      sortable: false,
      width: 50,
      cellClassName: style.starCell,
      renderCell: ({ value, row }) => (<SwitchStar selected={value} onClick={handleFavoriteClick(row)} />)
    },
    {
      field: 'NAME',
      headerName: 'Наименование',
      flex: 1,
      minWidth: 200,
      renderCell: ({ value, row }) => {
        const labels = (row as ICustomer)?.LABELS;

        return (
          <Stack
            spacing={1}
            direction="row"
            display="flex"
            alignItems="center"
          >
            <div>{value}</div>
            {Array.isArray(labels) && labels.length > 0
              ?
              <List
                style={{
                  flexDirection: 'row',
                  padding: '0px',
                  width: 'fit-content',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '2px 5px',
                }}
              >
                {labels.map((label) => {
                  return (
                    <div key={label.ID}>
                      <Tooltip
                        arrow
                        placement="bottom-start"
                        title={label.USR$DESCRIPTION}
                      >
                        <ListItemButton
                          key={label.ID}
                          onClick={handleLabelClick(label)}
                          sx={{
                            padding: 0,
                            borderRadius: 'var(--label-border-radius)',
                            '&:hover': {
                              backgroundColor: 'transparent'
                            }
                          }}
                        >
                          <LabelMarker label={label} />
                        </ListItemButton>
                      </Tooltip>
                    </div>

                  );
                }
                )}
              </List>
              : <></>}

          </Stack>
        );
      }
    },
    { field: 'PHONE', headerName: 'Телефон', width: 200 },
    {
      field: 'Actions',
      headerName: 'Действия',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => {
        const customerId = Number(params.id);

        // const detailsComponent = {
        //   // eslint-disable-next-line react/display-name
        //   component: forwardRef((props, ref: ForwardedRef<any>) => (
        //     <Link
        //       ref={ref}
        //       {...props}
        //       to={`details/${customerId}`}
        //       target="_self"
        //       onClick={SaveFilters}
        //     />
        //   ))
        // };

        return (
          <Box>
            <PermissionsGate actionAllowed={userPermissions?.customers.PUT}>
              <ItemButtonEdit
                onClick={handleCustomerEdit(customerId)}
                color="primary"
                disabled={customerFetching}
              />
            </PermissionsGate>
          </Box>
        );
      }
    }
  ];

  /** Cancel organization change */
  const handleOrganiztionEditCancelClick = () => {
    setOpenEditForm(false);
  };

  const handleOrganiztionEditSubmit = async (
    values: ICustomer,
    deleting: boolean
  ) => {
    setOpenEditForm(false);
    setDataChanged(true);
    if (deleting) {
      deleteCustomer(values.ID);
      return;
    }

    if (!values.ID) {
      addCustomer(values);
      return;
    }

    updateCustomer(values);
  };

  const handleAddOrganization = () => {
    setDataChanged(true);
    setCurrentOrganization(0);
    setOpenEditForm(true);
  };

  const filterHandlers = {
    handleFilter: async () => {
      setOpenFilters(!openFilters);
    },
    handleRequestSearch: async (value: string) => {
      const newObject = { ...filteringData };
      delete newObject.NAME;
      setFilteringData({
        ...newObject,
        ...(value !== '' ? { NAME: [value] } : {})
      });
      setPaginationData(prev => ({ ...prev, pageNo: 0 }));
    },
    handleCancelSearch: async () => {
      const newObject = { ...filteringData };
      delete newObject.NAME;
      setFilteringData(newObject);
    },
    handleFilteringData: async (newValue: IFilteringData) => {
      setFilteringData(newValue);
    },
    handleFilterClose: useCallback((event: any) => {
      if (
        event?.type === 'keydown' &&
        (event?.key === 'Tab' || event?.key === 'Shift')
      ) {
        return;
      }
      setOpenFilters(false);
    }, []),
    handleFilterClear: useCallback(() => {
      dispatch(clearFilterData(filterEntityName));
    }, [dispatch])
  };

  const lineDoubleClick: GridEventListener<'rowDoubleClick'> = (
    params,
    event,
    details,
  ) => {
    const id = Number(params.id);
    if (!userPermissions?.customers.PUT) return;
    handleCustomerEdit(id)();
  };

  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    setSortingData(sortModel.length > 0 ? { ...sortModel[0] } : null);
  }, []);

  const memoUpsertCustomer = useMemo(
    () => (
      <CustomerEdit
        open={openEditForm}
        deleteable
        customer={
          customers?.find((element) => element.ID === currentOrganization) ||
          null
        }
        onSubmit={handleOrganiztionEditSubmit}
        onCancel={handleOrganiztionEditCancelClick}
      />
    ),
    [openEditForm]
  );

  const memoSearchBar = useMemo(
    () => (
      <SearchBar
        disabled={customerIsLoading || filtersIsLoading}
        onCancelSearch={filterHandlers.handleCancelSearch}
        onRequestSearch={filterHandlers.handleRequestSearch}
        cancelOnEscape
        placeholder="Поиск клиента"
        value={
          filteringData && filteringData.NAME
            ? filteringData.NAME[0]
            : undefined
        }
      />
    ),
    [customerFetching, filteringData, filtersIsLoading]
  );

  const memoFilter = useMemo(
    () => (
      <CustomersFilter
        open={openFilters}
        onClose={filterHandlers.handleFilterClose}
        filteringData={filteringData}
        onFilteringDataChange={filterHandlers.handleFilteringData}
        onFilterClear={filterHandlers.handleFilterClear}
      />
    ),
    [openFilters, filteringData, filterHandlers.handleFilterClear, filterHandlers.handleFilterClose, filterHandlers.handleFilteringData]
  );

  const handleOnChange = (entity: string, value: any) => {
    const newObject: any = Object.assign({}, filteringData);

    if (entity === 'CONTRACTS') {
      delete newObject.WORKTYPES;
    };
    if (newObject[entity].length === 1) {
      delete newObject[entity];
    } else {
      newObject[entity] = newObject[entity].filter((item: any) => (item.NAME || item.USR$NUMBER || item.USR$NAME) !== value);
    }
    filterHandlers.handleFilteringData(Object.assign(newObject));
  };

  const haveFilter = useMemo(() => {
    const filters: IFilteringData = { ...filteringData };
    delete filters.METHODS;
    delete filters.NAME;
    return Object.keys(filters || {}).length > 0;
  }, [filteringData]);

  return (
    <CustomizedCard
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...(matchDownLg
          ? {}
          : {
            transition: `${theme.transitions.create('width', {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard
            })}`
          })
      }}
    >
      <CardHeader
        title={<Typography variant="pageHeader" fontWeight={600}>Клиенты</Typography>}
        action={
          <Stack direction="row" spacing={1}>
            <Box paddingX={'4px'} />
            {memoSearchBar}
            <Box display="inline-flex" alignSelf="center">
              <PermissionsGate actionAllowed={userPermissions?.customers.POST}>
                <IconButton
                  size="small"
                  onClick={handleAddOrganization}
                  disabled={customerFetching}
                >
                  <Tooltip arrow title="Добавить клиента">
                    <AddCircleIcon color={customerFetching ? 'disabled' : 'primary'} />
                  </Tooltip>
                </IconButton>
              </PermissionsGate>
            </Box>
            <Box display="inline-flex" alignSelf="center">
              <CustomLoadingButton
                hint="Обновить данные"
                loading={customerFetching}
                onClick={() => customerRefetch()}
              />
            </Box>
            <Box display="inline-flex" alignSelf="center">
              <IconButton
                onClick={filterHandlers.handleFilter}
                disabled={customerFetching || filtersIsLoading || filtersIsFetching}
                size="small"
              >
                <Tooltip
                  title={haveFilter
                    ? 'У вас есть активные фильтры'
                    : 'Выбрать фильтры'
                  }
                  arrow
                >
                  <Badge
                    color="error"
                    variant={
                      haveFilter
                        ? 'dot'
                        : 'standard'
                    }
                  >
                    <FilterListIcon
                      color={customerFetching ? 'disabled' : 'primary'}
                    />
                  </Badge>
                </Tooltip>
              </IconButton>
            </Box>
          </Stack>
        }
      />
      <Divider />
      <CardContent
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0
        }}
      >
        <Stack flex={1}>
          {haveFilter &&
            <Stack
              className={style.bodySelectedDataContainer}
              direction="row"
              spacing={2}
              p={3}
            >
              {filteringData?.DEPARTMENTS && (
                <DataField
                  name="Отдел"
                  data={filteringData.DEPARTMENTS}
                  masName={'DEPARTMENTS'}
                  deleteField={handleOnChange}
                />
              )}
              {filteringData?.CONTRACTS && (
                <DataField
                  name="Заказы"
                  data={filteringData.CONTRACTS}
                  masName={'CONTRACTS'}
                  deleteField={handleOnChange}
                />
              )}
              {filteringData?.WORKTYPES && (
                <DataField
                  name="Виды работ"
                  data={filteringData.WORKTYPES}
                  masName={'WORKTYPES'}
                  deleteField={handleOnChange}
                />
              )}
              {filteringData?.LABELS && (
                <DataField
                  name="Метки"
                  data={filteringData.LABELS}
                  masName={'LABELS'}
                  deleteField={handleOnChange}
                />
              )}
              {filteringData?.BUSINESSPROCESSES && (
                <DataField
                  name="Бизнес процессы"
                  data={filteringData.BUSINESSPROCESSES}
                  masName={'BUSINESSPROCESSES'}
                  deleteField={handleOnChange}
                />
              )}
            </Stack>
          }
          <Stack
            direction="row"
            flex={1}
            display="flex"
            className={classes.row}
          >
            <StyledGrid
              autoHeightForFields={['LABELS']}
              onRowDoubleClick={lineDoubleClick}
              columns={columns}
              rows={customers ?? []}
              loading={customerFetching}
              pagination
              paginationMode="server"
              paginationModel={{ page: paginationData.pageNo, pageSize: paginationData.pageSize }}
              rowCount={customersCount}
              pageSizeOptions={[10, 20, 50]}
              onPaginationModelChange={(data: any) => {
                setPaginationData((prevState) => ({
                  ...prevState,
                  pageNo: data.page,
                  pageSize: data.pageSize
                }));
              }}
              sortingMode="server"
              onSortModelChange={handleSortModelChange}
              disableMultipleRowSelection
              hideFooterSelectedRowCount
              hideHeaderSeparator
              disableColumnResize
              disableColumnReorder
              disableColumnFilter
              disableColumnMenu
              columnVisibilityModel={{
                CONTRACTS: false,
                DEPARTMENTS: false,
                WORKTYPES: false
              }}
              onRowSelectionModelChange={(ids: any) =>
                setCurrentOrganization(ids[0] ? Number(ids[0]) : 0)
              }
            />
            <Box>{memoFilter}</Box>
            {memoUpsertCustomer}
          </Stack>
        </Stack>
      </CardContent>
    </CustomizedCard>
  );
}

export default Customers;
