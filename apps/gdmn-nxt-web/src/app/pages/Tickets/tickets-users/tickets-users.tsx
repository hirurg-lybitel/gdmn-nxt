import { GridColDef, GridSortModel } from '@mui/x-data-grid-pro';
import Stack from '@mui/material/Stack/Stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery, Theme, Divider, CardContent, Checkbox } from '@mui/material';
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
import TicketsUserEdit from './tickets-users-edit/tickets-users-edit';
import { useAddTicketUserMutation, useDeleteTicketUserMutation, useGetAllTicketUserQuery, useUpdateTicketUserMutation } from '../../../features/tickets/ticketsUserApi';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';

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
  const [openEditForm, setOpenEditForm] = useState(false);
  const [editedUser, setEditedUser] = useState<ITicketUser | undefined>();
  const [openFilters, setOpenFilters] = useState(false);
  const filtersStorage = useSelector(
    (state: RootState) => state.filtersStorage
  );
  const filteringData = filtersStorage.filterData?.[`${filterEntityName}`];
  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: 20
  });
  const [sortingData, setSortingData] = useState<ISortingData | null>();

  const setFilteringData = (newFilter: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: newFilter }));
  };

  const userId = useSelector<RootState, number | undefined>(state => state.user.userProfile?.id);

  const { data, isFetching: usersIsFetching, isLoading: usersIsLoading, refetch: usersRefetch } = useGetAllTicketUserQuery(
    {
      pagination: paginationData,
      ...(Object.keys(filteringData || {}).length > 0 ? { filter: filteringData, notUserId: userId } : {}),
      ...(sortingData ? { sort: sortingData } : {})
    }
  );

  const companyKey = useSelector<RootState, number>(state => state.user.userProfile?.companyKey ?? -1);
  const { data: company, isFetching: companyIsFetching, isLoading: companyIsLoading } = useGetCustomerQuery({ customerId: companyKey }, { skip: companyKey === -1 });

  const [addUser, { isLoading: addIsLoading }] = useAddTicketUserMutation();
  const [updateUser, { isLoading: updateIsLoading }] = useUpdateTicketUserMutation();
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
      minWidth: 220
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 220
    },
    {
      field: 'phone',
      headerName: 'Телефон',
      flex: 1,
      minWidth: 220
    },
    {
      field: 'isAdmin',
      headerName: 'Администратор',
      flex: 1,
      minWidth: 140,
      type: 'boolean'
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
            <ItemButtonEdit
              disabled={deleteUserIsLoading || updateIsLoading}
              onClick={() => handleEditClick(params.row)}
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

  const handleSubmit = useCallback(async (values: ITicketUser, isDelete: boolean) => {
    if (isDelete) {
      deleteUser(values.ID);
      setOpenEditForm(false);
      return;
    };

    if (values.ID !== -1) {
      setOpenEditForm(false);
      updateUser(values);
      return;
    }

    const result = await addUser(values);
    if ('data' in result) {
      setOpenEditForm(false);
    }
    return result;
  }, [addUser, deleteUser, updateUser]);

  const handleAddClick = () => {
    setEditedUser(undefined);
    setOpenEditForm(true);
  };

  const handleEditClick = (user: ITicketUser) => {
    setEditedUser(user);
    setOpenEditForm(true);
  };

  const memoEdit = useMemo(() => {
    const user = { company: company as ICustomer } as ITicketUser;
    return (
      <TicketsUserEdit
        open={openEditForm}
        user={editedUser ?? user ?? null}
        onCancel={() => setOpenEditForm(false)}
        onSubmit={handleSubmit}
        isLoading={addIsLoading}
      />
    );
  }, [company, editedUser, handleSubmit, addIsLoading, openEditForm]);

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
          onAddClick={handleAddClick}
          addButtonHint="Создать ответственного"
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
                rowCount={data?.count ?? 0}
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
              />
            </Stack>
          </Stack>
        </CardContent>
      </CustomizedCard>
    </>
  );
}

export default TicketsUsers;
