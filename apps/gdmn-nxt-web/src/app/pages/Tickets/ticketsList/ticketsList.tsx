import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import styles from './ticketsList.module.less';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import { Avatar, Button, CardContent, Chip, Divider, Theme, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import AdjustIcon from '@mui/icons-material/Adjust';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAddTicketMutation, useGetAllTicketsQuery, useGetAllTicketsStatesQuery, useGetAllTicketUserQuery } from '../../../features/tickets/ticketsApi';
import { IFilteringData, IPaginationData, ISortingData, ITicket, UserType } from '@gsbelarus/util-api-types';
import UserTooltip from '@gdmn-nxt/components/userTooltip/user-tooltip';
import pluralize from 'libs/util-useful/src/lib/pluralize';
import TicketEdit from './tickets-edit/ticket-edit';
import { UserState } from '../../../features/user/userSlice';
import { RootState } from '@gdmn-nxt/store';
import { useDispatch, useSelector } from 'react-redux';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid-pro';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import SortSelect from './sortSelect';
import { customerApi, useGetCustomerQuery, useGetCustomersQuery } from '../../../features/customer/customerApi_new';
import { useGetUsersQuery } from '../../../features/systemUsers';
import { saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import { formatFullDateDate, timeAgo } from '@gsbelarus/util-useful';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import CustomFilterButton from '@gdmn-nxt/helpers/custom-filter-button';
import { useSnackbar } from '@gdmn-nxt/helpers/hooks/useSnackbar';

/* eslint-disable-next-line */
export interface ticketsListProps { }

const useStyles = makeStyles((theme: Theme) => ({
  itemTitle: {
    fontSize: '16px',
    color: 'inherit',
    textDecoration: 'none',
    marginBottom: '6px',
    '&:hover': {
      color: theme.palette.primary.main,
      textDecoration: 'underline'
    }
  },
  openBy: {
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.primary.main,
      textDecoration: 'underline'
    },
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}));

export function TicketsList(props: ticketsListProps) {
  const [addTicket] = useAddTicketMutation();

  const [openEdit, setOpenEdit] = useState(false);
  const filterEntityName = 'ticketsUsers';
  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName, { 'active': true });
  const filtersStorage = useSelector(
    (state: RootState) => state.filtersStorage
  );
  const filteringData = filtersStorage.filterData?.[`${filterEntityName}`];
  const dispatch = useDispatch();

  const setFilteringData = useCallback((newFilter: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: newFilter }));
  }, [dispatch]);

  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: 20
  });

  const { data, isLoading, isFetching, refetch } = useGetAllTicketsQuery({
    pagination: paginationData,
    ...(Object.keys(filteringData || {}).length > 0 ? { filter: { ...filteringData, state: filteringData?.active ? filteringData?.state : undefined } } : {}),
  });

  const handleRequestSearch = (value: string) => {
    const newObject = { ...filteringData };
    delete newObject.name;
    setFilteringData({
      ...newObject,
      ...(value !== '' ? { name: [value] } : {})
    });
    setPaginationData(prev => ({ ...prev, pageNo: 0 }));
  };

  const handleCancelSearch = () => {
    const newObject = { ...filteringData };
    delete newObject.name;
    setFilteringData(newObject);
  };

  const handleOnFilterChange = useCallback((entity: string, value: any) => {
    const newObject = { ...filteringData };
    delete newObject[entity];

    const newValue = (() => {
      if (typeof value === 'boolean' && !value) {
        return {};
      }
      if (value?.toString().length > 0) {
        return { [entity]: value };
      }
      return {};
    })();

    setFilteringData({ ...newObject, ...newValue });
  }, [filteringData, setFilteringData]);


  const { addSnackbar } = useSnackbar();

  const handleSubmit = useCallback(async (ticket: ITicket, isDelete: boolean) => {
    setOpenEdit(false);
    const res = await addTicket(ticket);
    if ('error' in res) return;
    addSnackbar('Спасибо за ваше обращение. Мы постараемся ответить как можно скорее.', {
      variant: 'success'
    });
    dispatch(customerApi.util.invalidateTags(['Customers']));
  }, [addSnackbar, addTicket, dispatch]);

  const companyKey = useSelector<RootState, number>(state => state.user.userProfile?.companyKey ?? -1);
  const { data: company, isFetching: companyIsFetching, isLoading: companyIsLoading } = useGetCustomerQuery({ customerId: companyKey }, { skip: companyKey === -1 });

  const memoEdit = useMemo(() => (
    <TicketEdit
      open={openEdit}
      ticket={company ? { company } as ITicket : undefined}
      onSubmit={handleSubmit}
      onCancelClick={() => setOpenEdit(false)}
    />
  ), [company, handleSubmit, openEdit]);

  const ticketsUser = useSelector<RootState, boolean>(state => state.user.userProfile?.type === UserType.Tickets);
  const isAdmin = useSelector<RootState, boolean>(state => state.user.userProfile?.isAdmin ?? false);

  const { data: systemUsers, isLoading: systemUsersIsLoading, isFetching: systemUsersIsFetching } = useGetUsersQuery();

  const performerSelect = useMemo(() => {
    return (
      <SortSelect
        isLoading={systemUsersIsLoading || systemUsersIsFetching}
        options={systemUsers}
        filteringData={filteringData}
        handleOnFilterChange={handleOnFilterChange}
        field={'performerKey'}
        label={'Исполнитель'}
        fullWidth
        getOptionLabel={(option) => option?.CONTACT?.NAME ?? option.NAME}
        getReturnedValue={(value) => value?.ID}
      />
    );
  }, [filteringData, handleOnFilterChange, systemUsers, systemUsersIsFetching, systemUsersIsLoading]);

  const { data: customersResponse, isLoading: customersIsLoading, isFetching: customersIsFetching } = useGetCustomersQuery({ filter: { ticketSystem: true } }, { skip: ticketsUser });

  const customerSelect = useMemo(() => {
    return (
      <SortSelect
        isLoading={customersIsFetching || customersIsLoading}
        options={customersResponse?.data}
        filteringData={filteringData}
        handleOnFilterChange={handleOnFilterChange}
        field={'companyKey'}
        label={'Клиент'}
        fullWidth
        getOptionLabel={(option) => option?.FULLNAME ?? option?.NAME}
        getReturnedValue={(value) => value?.ID}
      />
    );
  }, [customersIsFetching, customersIsLoading, customersResponse?.data, filteringData, handleOnFilterChange]);

  const { data: states, isFetching: statesIsFetching, isLoading: statesIsLoading } = useGetAllTicketsStatesQuery();

  const stateSelect = useMemo(() => {
    return (
      <SortSelect
        isLoading={statesIsFetching || statesIsLoading}
        options={states}
        disabled={!filteringData?.active}
        filteringData={filteringData}
        handleOnFilterChange={handleOnFilterChange}
        field={'state'}
        label={'Статус'}
        fullWidth
        getOptionLabel={(option) => option.name}
        getReturnedValue={(value) => value?.ID}
      />
    );
  }, [filteringData, handleOnFilterChange, states, statesIsFetching, statesIsLoading]);

  const { data: users, isFetching: usersIsFetching, isLoading: usersIsLoading } = useGetAllTicketUserQuery(undefined, { skip: ticketsUser && !isAdmin });

  const openerSelect = useMemo(() => {
    return (
      <SortSelect
        isLoading={usersIsLoading || usersIsFetching}
        options={users?.users}
        filteringData={filteringData}
        handleOnFilterChange={handleOnFilterChange}
        field={'userId'}
        label={'Постановщик'}
        getOptionLabel={(option) => option.fullName ?? option.userName ?? ''}
        getReturnedValue={(value) => value?.ID}
        sx={{ width: '100%', minWidth: '200px', flex: 1, maxWidth: '300px' }}
      />
    );
  }, [filteringData, handleOnFilterChange, users?.users, usersIsFetching, usersIsLoading]);

  const theme = useTheme();
  const matchDownXl = useMediaQuery(theme.breakpoints.down('xl'));
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));

  const columns: GridColDef<ITicket>[] = [
    {
      field: 'title',
      headerName: 'Меню',
      flex: 1,
      minWidth: matchDownXl ? 400 : 516,
      sortable: false,
      resizable: false,
      renderHeader: () => (
        <div style={{ display: 'flex', justifyContent: 'center', height: '100%', flex: 1, paddingLeft: '8px' }}>
          <Button
            sx={(theme) => ({ gap: '5px', paddingRight: '6px', color: !filteringData?.active ? theme.palette.text.primary : undefined })}
            onClick={(e) => {
              e.stopPropagation();
              const newObject = { ...filteringData };
              setFilteringData({ ...newObject, 'active': true });
            }}
          >
            Активные
            <Chip label={data?.open} size="small" />
          </Button>
          <Button
            sx={(theme) => ({ gap: '5px', paddingRight: '6px', color: filteringData?.active ? theme.palette.text.primary : undefined })}
            onClick={(e) => {
              e.stopPropagation();
              const newObject = { ...filteringData };
              setFilteringData({ ...newObject, 'active': false });
            }}
          >
            Завершенные
            <Chip
              label={data?.closed}
              size="small"
            />
          </Button>
          <div style={{ flex: 1, paddingLeft: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            {((!ticketsUser || isAdmin) && !matchDownXl) && openerSelect}
          </div>
        </div>
      ),
      renderCell: (params) => {
        return (
          <Item
            key={params.row.ID}
            {...params.row}
          />
        );
      }
    },
    {
      field: 'state',
      headerName: 'Статус',
      width: matchDownLg ? 120 : 180,
      sortable: false,
      resizable: false,
      renderCell: (params) => {
        return <div style={{ textAlign: matchDownLg ? undefined : 'center', width: '100%' }}>{params.row.state.name}</div>;
      },
      renderHeader: () => matchDownLg ? <div style={{ fontSize: '14px', fontWeight: 600 }}>Статус</div> : stateSelect
    },
    ...(ticketsUser ? [] : [{
      field: 'company',
      headerName: 'Клиент',
      width: 200,
      sortable: false,
      resizable: false,
      renderCell: (params: GridRenderCellParams<ITicket, any, any, GridTreeNodeWithRender>) => {
        const company = params.row.company;

        const getLetters = (str: string) => {
          const isLetter = (char: string) => /^[A-Za-zА-Яа-яЁё]$/.test(char);
          let result = '';

          for (let i = 0; i < str.length; i++) {
            if (isLetter(str[i])) {
              result += str[i];
              if (result.length === 2) break;
            }
          }

          return result;
        };

        const avatar = (
          <div
            style={{
              background: 'var(--color-primary-bg)', height: '40px', width: '40px', borderRadius: '100%',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontWeight: 500, fontSize: '15px', position: 'relative'
            }}
          >
            <span style={{ zIndex: 1 }}>{getLetters(company?.NAME ?? '')}</span>
          </div>
        );

        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
          <UserTooltip
            name={company?.FULLNAME ?? company?.NAME}
            phone={company?.PHONE}
            email={company?.EMAIL}
            customAvatar={avatar}
          >
            <span style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company?.FULLNAME ?? company?.NAME}</span>
          </UserTooltip >
        </div>;
      },
      renderHeader: () => matchDownLg ? <div style={{ fontSize: '14px', fontWeight: 600 }}>Клиент</div> : customerSelect
    }]),
    {
      field: 'performer',
      headerName: 'Исполнитель',
      width: matchDownXl ? 100 : 200,
      sortable: false,
      resizable: false,
      renderCell: (params: GridRenderCellParams<ITicket, any, any, GridTreeNodeWithRender>) => {
        const performer = params.row.performer;
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {(performer && performer.fullName) && <UserTooltip
            name={performer.fullName ?? ''}
            phone={performer.phone}
            email={performer.email}
            avatar={performer.avatar}
            placement="bottom-start"
          >
            <Avatar src={performer.avatar} />
          </UserTooltip>}
        </div>;
      },
      renderHeader: () => matchDownXl ? <div style={{ fontSize: '14px', fontWeight: 600 }}>Исполнитель</div> : <div style={{ paddingRight: '8px', width: '100%' }}>{performerSelect}</div>
    },
    ...(matchDownXl ? [{
      field: 'sort',
      type: 'actions',
      width: 40,
      sortable: false,
      resizable: false,
      renderCell: () => null,
      renderHeader: () => {
        return (
          <MenuBurger
            hasFilters={filteringData?.userId || filteringData?.performerKey || (matchDownLg && (filteringData?.state || filteringData?.companyKey))}
            filter
            items={({ closeMenu }) => [
              <div key="openerSelect">
                <div style={{ width: '250px' }} >
                  {openerSelect}
                </div>
              </div>,
              ...(matchDownLg ? [<div key="performerSelect">
                <div style={{ width: '250px' }} >
                  {stateSelect}
                </div>
              </div>,
              <div key="customerSelect">
                <div style={{ width: '250px' }} >
                  {customerSelect}
                </div>
              </div>] : []),
              <div key="performerSelect">
                <div style={{ width: '250px' }} >
                  {performerSelect}
                </div>
              </div>
            ]}
          />
        );
      }
    }] : [])
  ];

  return (
    <>
      {memoEdit}
      <CustomizedCard style={{ width: '100%' }}>
        <CustomCardHeader
          title={ticketsUser ? 'Заявки' : 'Тикеты'}
          addButton={ticketsUser}
          addButtonHint={'Создать заявку'}
          onAddClick={() => setOpenEdit(true)}
          onRefetch={refetch}
          refetch
          isLoading={isLoading || companyIsLoading}
          isFetching={isFetching || companyIsFetching}
          search
          searchPlaceholder={ticketsUser ? 'Поиск заявки' : 'Поиск тикета'}
          onCancelSearch={handleCancelSearch}
          onRequestSearch={handleRequestSearch}
          searchValue={filteringData?.name?.[0]}
        />
        <Divider />
        <CardContent style={{ padding: 0 }}>
          <StyledGrid
            columnHeaderHeight={60}
            rowHeight={85}
            columns={columns}
            rows={data?.tickets ?? []}
            disableColumnMenu
            sx={{
              '& .MuiDataGrid-columnSeparator': {
                display: 'none'
              },
              '& .MuiDataGrid-columnHeaderTitleContainerContent': {
                overflow: 'visible',
                width: '100%'
              },
              '& .MuiDataGrid-columnHeaderTitleContainer': {
                overflow: 'visible',
                width: '100%'
              },
              '& .MuiDataGrid-cell': {
                padding: '8px'
              },
              '& .MuiDataGrid-columnHeader': {
                padding: '8px'
              }
            }}
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
          />
        </CardContent>
      </CustomizedCard>
    </>
  );
}

interface IItemProps extends ITicket {
}

const Item = ({ ID, title, sender, openAt, closeAt, closeBy }: IItemProps) => {
  const classes = useStyles();

  const user = useSelector<RootState, UserState>(state => state.user);

  const ticketIcon = useMemo(() => {
    const startDate = new Date(openAt);
    const now = new Date();

    const msInDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.floor((now.getTime() - startDate.getTime()) / msInDay);

    if (closeAt) {
      return <CheckCircleOutlineIcon color={'primary'} />;
    }
    if (user.userProfile?.type !== UserType.Tickets) {
      if (daysLeft === 1) {
        return <ErrorOutlineIcon color={'warning'} />;
      }
      if (daysLeft > 1) {
        return <ErrorOutlineIcon color={'error'} />;
      }
    }
    return <AdjustIcon color={'success'} />;
  }, [closeAt, openAt, user.userProfile?.type]);

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '8px' }}>
      {ticketIcon}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Link to={ID + ''} className={classes.itemTitle} >
          {title}
        </Link>
        <Typography variant="caption" color="text.secondary">
          # {ID}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          style={{ display: 'flex', gap: '5px' }}
        >
          {closeAt ? 'Закрыт' : 'Открыт'}
          <UserTooltip
            name={closeBy ? closeBy.fullName : sender.fullName}
            phone={closeBy ? closeBy.phone : sender.phone}
            email={closeBy ? closeBy.email : sender.email}
            avatar={closeBy ? closeBy.avatar : sender.avatar}
          >
            <div className={classes.openBy}>{closeBy ? closeBy.fullName : sender.fullName}</div>
          </UserTooltip>
          <Tooltip arrow title={formatFullDateDate(closeAt ?? openAt)}>
            <div>
              {timeAgo(closeAt ?? openAt)}
            </div>
          </Tooltip>
        </Typography>
      </div>
    </div >
  );
};

export default TicketsList;
