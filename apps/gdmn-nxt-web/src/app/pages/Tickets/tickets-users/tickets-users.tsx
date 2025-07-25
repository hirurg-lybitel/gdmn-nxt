import { GridColDef, GridSortModel } from '@mui/x-data-grid-pro';
import Stack from '@mui/material/Stack/Stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery, Theme, Divider, CardContent } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { ICustomer, IFilteringData, IPaginationData, ISortingData, ITicketUser } from '@gsbelarus/util-api-types';
import { useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import style from './tickets-customers.module.less';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import { RootState } from '@gdmn-nxt/store';
import { clearFilterData, saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import { useGetCustomerQuery } from '../../../features/customer/customerApi_new';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { useAddTicketUserMutation, useDeleteTicketUserMutation, useGetAllTicketUserQuery } from '../../../features/tickets/ticketsApi';
import TicketsUserEdit from './tickets-users-edit/tickets-users-edit';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';

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

export function TicketsUsers(props: TicketsCustomersProps) {
  const classes = useStyles();
  const filterEntityName = 'ticketsUsers';
  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName);
  const [currentOrganization, setCurrentUser] = useState(0);
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

  const { data, isFetching: usersIsFetching, isLoading: usersIsLoading, refetch: usersRefetch } = useGetAllTicketUserQuery(
    {
      pagination: paginationData,
      ...(Object.keys(filteringData || {}).length > 0 ? { filter: filteringData } : {}),
      ...(sortingData ? { sort: sortingData } : {})
    }
  );

  const companyKey = useSelector<RootState, number>(state => state.user.userProfile?.companyKey ?? -1);
  const { data: company, isFetching: companyIsFetching, isLoading: companyIsLoading } = useGetCustomerQuery({ customerId: companyKey }, { skip: companyKey === -1 });

  const [addUser] = useAddTicketUserMutation();
  const [deleteUser, { isLoading: deleteUserIsLoading }] = useDeleteTicketUserMutation();

  const users = useMemo(() => {
    return data?.users ?? [];
  }, [JSON.stringify(data?.users)]);

  const dispatch = useDispatch();

  const theme = useTheme();
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));

  const columns: GridColDef<ITicketUser>[] = [
    {
      field: 'fullName',
      headerName: 'ФИО',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'phone',
      headerName: 'Телефон',
      flex: 1,
    },
    {
      field: 'Actions',
      headerName: 'Действия',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => {
        return (
          <Box>
            <ItemButtonDelete
              disabled={deleteUserIsLoading}
              onClick={() => deleteUser(params.row.ID)}
              title={`Удаление пользователя ${params.row.fullName}`}
              button
            />
          </Box>
        );
      }
    }
  ];

  const filterHandlers = {
    handleFilter: async () => {
      setOpenFilters(!openFilters);
    },
    handleRequestSearch: async (value: string) => {
      const newObject = { ...filteringData };
      delete newObject.name;
      setFilteringData({
        ...newObject,
        ...(value !== '' ? { name: [value] } : {})
      });
      setPaginationData(prev => ({ ...prev, pageNo: 0 }));
    },
    handleCancelSearch: async () => {
      const newObject = { ...filteringData };
      delete newObject.name;
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

  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    setSortingData(sortModel.length > 0 ? { ...sortModel[0] } : null);
  }, []);

  const handleSubmit = useCallback((values: ITicketUser, isDelete: boolean) => {
    setOpenEditForm(false);
    if (isDelete) return;
    addUser(values);
  }, [addUser]);

  const memoEdit = useMemo(() => {
    const user = { ...users?.find((element) => element.ID === currentOrganization), company: company as ICustomer } as ITicketUser;
    return (
      <TicketsUserEdit
        open={openEditForm}
        user={user ?? null}
        onCancel={() => setOpenEditForm(false)}
        onSubmit={handleSubmit}
      />
    );
  }, [company, currentOrganization, handleSubmit, openEditForm, users]);

  return (
    <>
      {memoEdit}
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
          title={'Ответственные'}
          searchPlaceholder="Поиск ответственного"
          isLoading={usersIsLoading || filtersIsLoading || companyIsLoading}
          isFetching={usersIsFetching || filtersIsFetching || companyIsFetching}
          onCancelSearch={filterHandlers.handleCancelSearch}
          onRequestSearch={filterHandlers.handleRequestSearch}
          searchValue={filteringData?.name?.[0]}
          onRefetch={usersRefetch}
          addButton
          onAddClick={() => setOpenEditForm(true)}
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
                columns={columns}
                rows={users ?? []}
                loading={usersIsFetching}
                pagination
                paginationMode="server"
                paginationModel={{ page: paginationData.pageNo, pageSize: paginationData.pageSize }}
                rowCount={data?.count}
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
                  setCurrentUser(ids[0] ? Number(ids[0]) : 0)
                }
              />
            </Stack>
          </Stack>
        </CardContent>
      </CustomizedCard>
    </>
  );
}

export default TicketsUsers;
