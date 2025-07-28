import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import styles from './ticketsList.module.less';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import { Avatar, Button, CardContent, Chip, Divider, Theme, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
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
    }
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
    ...(Object.keys(filteringData || {}).length > 0 ? { filter: filteringData } : {}),
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

  const handleSubmit = useCallback(async (ticket: ITicket, isDelete: boolean) => {
    setOpenEdit(false);
    await addTicket(ticket);
    dispatch(customerApi.util.invalidateTags(['Customers']));
  }, [addTicket, dispatch]);

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

  const CustomerSelect = useMemo(() => {
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

  const { data: users, isFetching: usersIsFetching, isLoading: usersIsLoading } = useGetAllTicketUserQuery(undefined, { skip: !isAdmin });

  const openerSelect = useMemo(() => {
    return (
      <SortSelect
        isLoading={usersIsLoading || usersIsFetching}
        options={users?.users}
        filteringData={filteringData}
        handleOnFilterChange={handleOnFilterChange}
        field={'userId'}
        label={'Поставновщик'}
        getOptionLabel={(option) => option.fullName}
        getReturnedValue={(value) => value?.ID}
        sx={{ width: '100%', minWidth: '200px', flex: 1, maxWidth: '300px' }}
      />
    );
  }, [filteringData, handleOnFilterChange, users?.users, usersIsFetching, usersIsLoading]);

  const columns: GridColDef<ITicket>[] = [
    {
      field: 'title',
      headerName: 'Меню',
      flex: 1,
      minWidth: 516,
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
            {(!ticketsUser || isAdmin) && openerSelect}
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
      width: 180,
      sortable: false,
      resizable: false,
      renderCell: (params) => {
        return <div style={{ textAlign: 'center', width: '100%' }}>{params.row.state.name}</div>;
      },
      renderHeader: () => stateSelect
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
              fontWeight: 500, fontSize: '15px', position: 'relative', overflow: 'hidden'
            }}
          >
            <span style={{ zIndex: 1 }}>{getLetters(company?.NAME ?? '')}</span>
          </div>
        );

        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <UserTooltip
            name={company?.FULLNAME ?? company?.NAME}
            phone={company?.PHONE}
            email={company?.EMAIL}
            customAvatar={avatar}
          >
            <span>{company?.FULLNAME ?? company?.NAME}</span>
          </UserTooltip >
        </div>;
      },
      renderHeader: () => CustomerSelect
    }]),
    {
      field: 'performer',
      headerName: 'Исполнитель',
      width: 200,
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
      renderHeader: () => <div style={{ paddingRight: '8px', width: '100%' }}>{performerSelect}</div>
    }
  ];

  return (
    <>
      {memoEdit}
      <CustomizedCard style={{ width: '100%' }}>
        <CustomCardHeader
          title={'Тикеты'}
          addButton={ticketsUser}
          addButtonHint="Создать тикет"
          onAddClick={() => setOpenEdit(true)}
          onRefetch={refetch}
          refetch
          isLoading={isLoading || companyIsLoading}
          isFetching={isFetching || companyIsFetching}
          search
          searchPlaceholder="Поиск тикета"
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
            rowCount={data?.count}
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

  function timeAgo(date: Date): string {
    const now = new Date();
    const openAt = new Date(date);
    const diffMs = now.getTime() - openAt.getTime();

    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hour = Math.floor(min / 60);
    const day = Math.floor(hour / 24);
    const month = Math.floor(day / 30);
    const year = Math.floor(month / 12);

    if (sec < 60) return `${sec} ${pluralize(sec, 'секунду', 'секунды', 'секунд')} назад`;
    if (min < 60) return `${min} ${pluralize(min, 'минуту', 'минуты', 'минут')} назад`;
    if (hour < 24) return `${hour} ${pluralize(hour, 'час', 'часа', 'часов')} назад`;
    if (day < 30) return `${day} ${pluralize(day, 'день', 'дня', 'дней')} назад`;
    if (month < 12) return `${month} ${pluralize(month, 'месяц', 'месяца', 'месяцев')} назад`;
    return `${year} ${pluralize(year, 'год', 'года', 'лет')} назад`;
  }

  function formatDate(dateString: Date): string {
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // месяцы от 0
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

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
          <Tooltip arrow title={formatDate(closeAt ?? openAt)}>
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
