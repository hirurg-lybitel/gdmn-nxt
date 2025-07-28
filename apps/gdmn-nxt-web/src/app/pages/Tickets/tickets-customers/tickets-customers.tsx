import { GridColDef, GridSortModel, GridEventListener } from '@mui/x-data-grid-pro';
import Stack from '@mui/material/Stack/Stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery, Theme, Divider, CardContent, Tooltip, IconButton } from '@mui/material';
import CustomerEdit from './tickets-customer-edit/tickets-customer-edit';
import { useDispatch, useSelector } from 'react-redux';
import { IContactWithID, ICustomer, ICustomerContract, IFilteringData, IPaginationData, ISortingData, IWorkType } from '@gsbelarus/util-api-types';
import { useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import style from './tickets-customers.module.less';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import { RootState } from '@gdmn-nxt/store';
import { clearFilterData, saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import { useAddCustomerTicketsMutation, useUpdateTicketsCustomerMutation, useGetCustomersCrossQuery, useGetCustomersQuery } from '../../../features/customer/customerApi_new';
import { useGetWorkTypesQuery } from '../../../features/work-types/workTypesApi';
import { useGetDepartmentsQuery } from '../../../features/departments/departmentsApi';
import { useGetCustomerContractsQuery } from '../../../features/customer-contracts/customerContractsApi';
import { useGetBusinessProcessesQuery } from '../../../features/business-processes';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import TicketsCustomerAdd from './tickects-customer-add/tickects-customer-add';
import EditIcon from '@mui/icons-material/Edit';

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
export interface TicketsCustomersProps { }

export function TicketsCustomers(props: TicketsCustomersProps) {
  const classes = useStyles();
  const userPermissions = usePermissions();
  const filterEntityName = 'ticketsCustomers';
  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName);
  const [currentOrganization, setCurrentOrganization] = useState(0);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openAddForm, setOpenAddForm] = useState(false);
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
      filter: { ...filteringData, ticketSystem: true, sortByFavorite: false },
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

  const [addToTicketSystem] = useAddCustomerTicketsMutation();
  const [updateTicketCustomer] = useUpdateTicketsCustomerMutation();

  const dispatch = useDispatch();

  const theme = useTheme();
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));

  const handleCustomerEdit = (id: number) => () => {
    setCurrentOrganization(id);
    setOpenEditForm(true);
  };

  const columns: GridColDef<ICustomer>[] = [
    {
      field: 'NAME',
      headerName: 'Наименование',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'ALLTICKETS', headerName: 'Количество тикетов', width: 200, renderCell: (params) => {
        return params.row.ALLTICKETS;
      }
    },
    { field: 'OPENTICKETS', headerName: 'Открытые тикеты', width: 200 },
    { field: 'CLOSEDTICKETS', headerName: 'Закрытые тикеты', width: 200 },
    {
      field: 'Actions',
      headerName: 'Действия',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => {
        const customerId = Number(params.id);

        return (
          <Box>
            <Tooltip title="Редактировать">
              <IconButton
                onClick={handleCustomerEdit(customerId)}
                disabled={customerFetching}
                color={'primary'}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  /** Cancel organization change */
  const handleOrganiztionEditCancelClick = () => {
    setOpenEditForm(false);
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
      dispatch(clearFilterData({ filterEntityName }));
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

  const handleUpdateCustomer = useCallback((value: ICustomer, isDelete: boolean) => {
    setOpenEditForm(false);
    if (isDelete) return;
    updateTicketCustomer(value);
  }, [updateTicketCustomer]);

  const memoEditCustomer = useMemo(
    () => (
      <CustomerEdit
        open={openEditForm}
        customer={
          customers?.find((element) => element.ID === currentOrganization) ||
          null
        }
        onCancel={handleOrganiztionEditCancelClick}
        onSubmit={handleUpdateCustomer}
      />
    ),
    [currentOrganization, customers, handleUpdateCustomer, openEditForm]
  );

  const memoAddCustomer = useMemo(() => {
    return (
      <TicketsCustomerAdd
        open={openAddForm}
        onSubmit={(values) => {
          addToTicketSystem(values);
          setOpenAddForm(false);
        }}
        onCancel={() => setOpenAddForm(false)}
      />
    );
  }, [addToTicketSystem, openAddForm]);

  return (
    <>
      {memoEditCustomer}
      {memoAddCustomer}
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
        <CustomCardHeader
          search
          refetch
          title={'Клиенты'}
          searchPlaceholder="Поиск клиента"
          isLoading={customerIsLoading || filtersIsLoading}
          isFetching={customerFetching || filtersIsFetching}
          onCancelSearch={filterHandlers.handleCancelSearch}
          onRequestSearch={filterHandlers.handleRequestSearch}
          searchValue={filteringData?.NAME?.[0]}
          onRefetch={customerRefetch}
          addButton
          onAddClick={() => setOpenAddForm(true)}
          addButtonHint="Создать клиента"
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
            </Stack>
          </Stack>
        </CardContent>
      </CustomizedCard>
    </>
  );
}

export default TicketsCustomers;
