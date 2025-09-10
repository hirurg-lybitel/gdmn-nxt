import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import styles from './ticketsList.module.less';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import { Autocomplete, Avatar, Box, Button, CardContent, Checkbox, Chip, Divider, ListItem, Popper, Stack, TextField, Theme, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import AdjustIcon from '@mui/icons-material/Adjust';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAddTicketMutation, useGetAllTicketsQuery, useGetAllTicketsStatesQuery } from '../../../features/tickets/ticketsApi';
import { IFilteringData, IPaginationData, ITicket, ticketStateCodes, UserType } from '@gsbelarus/util-api-types';
import UserTooltip from '@gdmn-nxt/components/userTooltip/user-tooltip';
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
import { formatToFullDate, timeAgo } from '@gsbelarus/util-useful';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import { useSnackbar } from '@gdmn-nxt/helpers/hooks/useSnackbar';
import { useGetAllTicketUserQuery } from '../../../features/tickets/ticketsUserApi';
import LabelMarker from '@gdmn-nxt/components/Labels/label-marker/label-marker';
import { useGetTicketsLabelsQuery } from '../../../features/tickets/ticketsLabelsApi';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { IconByName } from '@gdmn-nxt/components/icon-by-name';
import { te } from 'date-fns/locale';

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
    textOverflow: 'ellipsis',
    textWrap: 'nowrap'
  }
}));

export function TicketsList(props: ticketsListProps) {
  const [addTicket] = useAddTicketMutation();

  const ticketsUser = useSelector<RootState, boolean>(state => state.user.userProfile?.type === UserType.Tickets);

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

  const { data: states, isFetching: statesIsFetching, isLoading: statesIsLoading } = useGetAllTicketsStatesQuery();
  const hiddenActiveStates = useMemo(() => ticketsUser ? [ticketStateCodes.confirmed] : [ticketStateCodes.done, ticketStateCodes.confirmed], [ticketsUser]);

  const stateFilter = useMemo(() => {
    if (!filteringData?.active && ticketsUser) {
      return undefined;
    }
    if (filteringData?.state) {
      const filterStateCode = states?.find((state => state.ID === filteringData?.state))?.code;
      const includesHiddenActive = filterStateCode && hiddenActiveStates.includes(filterStateCode);
      if ((filteringData?.active ? includesHiddenActive : !includesHiddenActive)) {
        return undefined;
      }
    }
    return filteringData?.state;
  }, [filteringData?.active, filteringData?.state, hiddenActiveStates, states, ticketsUser]);

  const { data, isLoading, isFetching, refetch } = useGetAllTicketsQuery({
    pagination: paginationData,
    ...(Object.keys(filteringData || {}).length > 0 ? { filter: { ...filteringData, state: stateFilter } } : {}),
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

  const isAdmin = useSelector<RootState, boolean>(state => state.user.userProfile?.isAdmin ?? false);

  const mainColumnSizes = useMemo(() => {
    if (ticketsUser && !isAdmin) {
      return [470, 420, 420];
    }
    return [650, 500, 420];
  }, [isAdmin, ticketsUser]);
  const statusColumnSizes = useMemo(() => [200, 120], []);
  const customerColumnSizes = useMemo(() => ticketsUser ? [0, 0] : [200, 160], [ticketsUser]);
  const performerColumnSizes = useMemo(() => [200, 120], []);

  const ref = useRef<any>(null);

  const [headerWidth, setHeaderWidth] = useState(0);

  const getHiddenSelectors = useCallback((arrays: number[][]): boolean[] => {
    let result: number[] = [...arrays[0]];

    for (let i = 1; i < arrays.length; i++) {
      const currentMas = arrays[i];
      const temp: number[] = [];

      for (let ii = 0; ii < currentMas.length; ii++) {
        if (ii === 0) {
          for (const prev of result) {
            temp.push(prev + currentMas[0]);
          }
        } else {
          temp.push(result[result.length - 1] + currentMas[ii]);
        }
      }

      result = temp;
    }

    return result.map((size, index) => (index === 0 ? size : size + 50) > headerWidth);
  }, [headerWidth]);

  const hiddenSelectors = useMemo(() => (
    getHiddenSelectors([mainColumnSizes, statusColumnSizes, customerColumnSizes, performerColumnSizes])
  ), [customerColumnSizes, getHiddenSelectors, mainColumnSizes, performerColumnSizes, statusColumnSizes]);

  const [labelsHidden, openerHidden, statusHidden, customerHidden, performerHidden] = hiddenSelectors;

  const getColumnWidth = useCallback((arrays: number[][]): number[] => {
    const result = [];
    let index = 0;
    for (const array of arrays) {
      for (let i = 0; i < array.length; i++) {
        if (!hiddenSelectors[index] || array.length - 1 === i) {
          result.push(array[i]);
          index += array.length - 1 - i;
          break;
        }
        index += 1;
      }
    }
    return result;
  }, [hiddenSelectors]);

  const [mainColumnWidth, statusColumnWidth, customerColumnWidth, performerColumnWidth] = useMemo(() => (
    getColumnWidth([mainColumnSizes, statusColumnSizes, customerColumnSizes, performerColumnSizes])
  ), [customerColumnSizes, getColumnWidth, mainColumnSizes, performerColumnSizes, statusColumnSizes]);

  const [sizeUpdate, setSizeUpdate] = useState(0);

  useEffect(() => {
    const setSize = () => {
      const headerWidth = ref?.current?.getElementsByClassName('MuiDataGrid-columnHeaders')[0]?.getBoundingClientRect().width;
      setHeaderWidth(headerWidth ? headerWidth - 20 : 0);
    };
    setSize();
    if (!isLoading && headerWidth === 0) {
      setSizeUpdate(sizeUpdate + 1);
    }
    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, [headerWidth, isLoading, sizeUpdate]);

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

  const stateSelect = useMemo(() => {
    return (
      <SortSelect
        isLoading={statesIsFetching || statesIsLoading}
        options={states?.filter((state) => {
          if (filteringData?.active) {
            return !hiddenActiveStates.includes(state.code);
          }
          return hiddenActiveStates.includes(state.code);
        })}
        disabled={!filteringData?.active && ticketsUser}
        filteringData={filteringData}
        handleOnFilterChange={handleOnFilterChange}
        field={'state'}
        label={'Статус'}
        fullWidth
        getOptionLabel={(option) => option.name}
        getReturnedValue={(value) => value?.ID}
      />
    );
  }, [filteringData, handleOnFilterChange, hiddenActiveStates, states, statesIsFetching, statesIsLoading, ticketsUser]);

  const { data: users, isFetching: usersIsFetching, isLoading: usersIsLoading } = useGetAllTicketUserQuery(undefined, { skip: ticketsUser && !isAdmin });

  const openerSelect = useMemo(() => {
    return (
      <SortSelect
        isLoading={usersIsLoading || usersIsFetching}
        options={users?.users}
        filteringData={filteringData}
        handleOnFilterChange={handleOnFilterChange}
        field={'sender'}
        label={'Постановщик'}
        getOptionLabel={(option) => option.fullName ?? option.userName ?? ''}
        getReturnedValue={(value) => value?.ID}
        sx={{ width: '100%', minWidth: '200px', flex: 1, maxWidth: '300px' }}
      />
    );
  }, [filteringData, handleOnFilterChange, users?.users, usersIsFetching, usersIsLoading]);

  const { data: labels = [], isFetching: labelsFetching, isLoading: labelsLoading } = useGetTicketsLabelsQuery();

  const labelSelect = useMemo(() => {
    const CustomPopper = (props: any) => {
      return <Popper {...props} style={{ width: 'fit-content' }} />;
    };

    return (
      <Autocomplete
        loading={labelsFetching || labelsLoading}
        sx={{ height: '40px', width: '100%', minWidth: '150px', flex: 1, maxWidth: labelsHidden ? '100%' : '200px' }}
        slotProps={{
          paper: {
            style: {
              width: 'max-content',
              maxWidth: 'calc(100vw - 40px)'
            }
          }
        }}
        multiple
        PopperComponent={CustomPopper}
        size="small"
        loadingText="Загрузка данных..."
        options={labels}
        value={filteringData?.labels ?? []}
        onChange={(e, value) => {
          handleOnFilterChange('labels', value);
        }}
        disableCloseOnSelect
        getOptionLabel={opt => opt.USR$NAME}
        renderTags={() => [<div key={0}>
          {(filteringData?.labels && filteringData?.labels.length > 0) && (
            <Chip
              size="small"
              label={filteringData?.labels.length}
            />
          )}
        </div>]}
        renderOption={(props, option, { selected }) => (
          <ListItem
            {...props}
            key={option.ID}
            disablePadding
            sx={{
              dusplay: 'flex',
              gap: '8px',
              py: '2px !important',
              '&:hover .action': {
                display: 'inline-flex !important',
                opacity: '1 !important',
                visibility: 'visible !important',
              }
            }}
          >
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              <Stack direction="column" style={{ minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  style={{ minWidth: 0 }}
                >
                  <Box style={{ display: 'flex', width: '30px', alignItems: 'center', justifyContent: 'center' }}>
                    {option.USR$ICON
                      ? <IconByName name={option.USR$ICON} style={{ color: option.USR$COLOR }} />
                      : <Box
                        component="span"
                        style={{
                          backgroundColor: option.USR$COLOR,
                          width: 14,
                          height: 14,
                          borderRadius: 'var(--border-radius)',
                        }}
                      />
                    }
                  </Box>
                  <Box style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {option.USR$NAME}
                  </Box>
                </Stack>
                <Typography variant="caption">{option.USR$DESCRIPTION}</Typography>
              </Stack>
            </div>
          </ListItem>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Метки"
            placeholder="Метки"
            InputProps={{
              ...params.InputProps
            }}
          />
        )}
      />
    );
  }, [filteringData?.labels, handleOnFilterChange, labels, labelsFetching, labelsLoading, labelsHidden]);

  console.log(stateFilter);

  const columns: GridColDef<ITicket>[] = [
    {
      field: 'title',
      headerName: 'Меню',
      flex: 1,
      minWidth: mainColumnWidth,
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '40px', gap: '16px', width: '100%' }}>
              {!labelsHidden && labelSelect}
              {((!ticketsUser || isAdmin) && !openerHidden) && openerSelect}
            </div>
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
      width: statusColumnWidth,
      sortable: false,
      resizable: false,
      renderCell: (params) => {
        return <div style={{ textAlign: statusHidden ? undefined : 'center', width: '100%', textOverflow: 'ellipsis', overflow: 'hidden' }}>{params.row.state.name}</div>;
      },
      renderHeader: () => statusHidden ? <div style={{ fontSize: '14px', fontWeight: 600 }}>Статус</div> : stateSelect
    },
    ...(ticketsUser ? [] : [{
      field: 'company',
      headerName: 'Клиент',
      width: customerColumnWidth,
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
      renderHeader: () => customerHidden ? <div style={{ fontSize: '14px', fontWeight: 600 }}>Клиент</div> : customerSelect
    }]),
    {
      field: 'performer',
      headerName: 'Исполнитель',
      width: performerColumnWidth,
      sortable: false,
      resizable: false,
      renderCell: (params: GridRenderCellParams<ITicket, any, any, GridTreeNodeWithRender>) => {
        const performer = params.row.performer;
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {performer?.fullName && <UserTooltip
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
      renderHeader: () => performerHidden ? <div style={{ fontSize: '14px', fontWeight: 600 }}>Исполнитель</div> : <div style={{ width: '100%' }}>{performerSelect}</div>
    },
    ...((labelsHidden && headerWidth !== 0) ? [{
      field: 'sort',
      type: 'actions',
      width: 40,
      sortable: false,
      resizable: false,
      renderCell: () => null,
      renderHeader: () => {
        const hasFilters = filteringData?.labels
          || (openerHidden && (!ticketsUser || isAdmin) && filteringData?.userId)
          || (statusHidden && stateFilter)
          || (customerHidden && filteringData?.companyKey && !ticketsUser)
          || (performerHidden && filteringData?.performerKey);
        return (
          <MenuBurger
            hasFilters={hasFilters}
            filter
            items={({ closeMenu }) => [
              <div key="labelSelect">
                <div style={{ width: '250px' }} >
                  {labelSelect}
                </div>
              </div>,
              ...((openerHidden && (!ticketsUser || isAdmin)) ? [
                <div key="openerSelect">
                  <div style={{ width: '250px' }} >
                    {openerSelect}
                  </div>
                </div>
              ] : []),
              ...(statusHidden ? [
                <div key="stateSelect">
                  <div style={{ width: '250px' }} >
                    {stateSelect}
                  </div>
                </div>,
              ] : []),
              ...((customerHidden && !ticketsUser) ? [
                <div key="customerSelect">
                  <div style={{ width: '250px' }} >
                    {customerSelect}
                  </div>
                </div>
              ] : []),
              ...(performerHidden ? [
                <div key="performerSelect">
                  <div style={{ width: '250px' }} >
                    {performerSelect}
                  </div>
                </div>
              ] : []),
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
        <CardContent ref={ref} style={{ padding: 0 }}>
          <StyledGrid
            getRowHeight={() => 'auto'}
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

const Item = ({ ID, title, sender, openAt, closeAt, closeBy, state, labels }: IItemProps) => {
  const classes = useStyles();

  const user = useSelector<RootState, UserState>(state => state.user);
  const ticketsUser = user.userProfile?.type === UserType.Tickets;

  const ticketIcon = useMemo(() => {
    const startDate = new Date(openAt);
    const now = new Date();

    const msInDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.floor((now.getTime() - startDate.getTime()) / msInDay);

    if (state.code === ticketStateCodes.confirmed) {
      return <CheckCircleOutlineIcon color={'success'} />;
    }
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
  }, [closeAt, openAt, state.code, user.userProfile?.type]);

  const openCloseWord = ticketsUser ? ['Открыта', 'Закрыта'] : ['Закрыт', 'Открыт'];

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '0px 8px', width: '100%' }}>
      {ticketIcon}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Link to={ID + ''} className={classes.itemTitle} >
          {title}
        </Link>
        <Typography variant="caption" color="text.secondary">
          # {ID}
        </Typography>
        {(labels && labels?.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', margin: '6px 0px', gap: '6px' }}>
            {labels?.map((label, index) => {
              return (
                <div key={index} style={{ cursor: 'pointer' }}>
                  <Tooltip
                    title={label.USR$DESCRIPTION}
                    arrow
                  >
                    <div>
                      <LabelMarker label={label} />
                    </div>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          style={{ display: 'flex', gap: '5px' }}
        >
          {closeAt ? openCloseWord[1] : openCloseWord[0]}
          <UserTooltip
            name={closeBy ? closeBy.fullName : sender.fullName}
            phone={closeBy ? closeBy.phone : sender.phone}
            email={closeBy ? closeBy.email : sender.email}
            avatar={closeBy ? closeBy.avatar : sender.avatar}
          >
            <div className={classes.openBy}>{closeBy ? closeBy.fullName : sender.fullName}</div>
          </UserTooltip>
          <Tooltip arrow title={formatToFullDate(closeAt ?? openAt)}>
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
