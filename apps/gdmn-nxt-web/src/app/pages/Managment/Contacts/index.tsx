import CardToolbar from '@gdmn-nxt/components/Styled/card-toolbar/card-toolbar';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import { LoadingButton } from '@mui/lab';
import { Badge, Box, CardContent, CardHeader, Divider, IconButton, List, ListItemButton, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import { MouseEvent, useCallback, useState } from 'react';
import AddContact from '@gdmn-nxt/components/add-contact/add-contact';
import { useAddContactPersonMutation, useDeleteContactPersonMutation, useGetContactPersonsQuery, useUpdateContactPersonMutation } from '../../../features/contact/contactApi';
import { useFormik } from 'formik';
import { IContactPerson, IEmail, IFilteringData, ILabel, IPhone } from '@gsbelarus/util-api-types';
import { GridColDef, GridColumns } from '@mui/x-data-grid-pro';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import { IPaginationData } from '../../../features/customer/customerApi_new';
import LabelMarker from '@gdmn-nxt/components/Labels/label-marker/label-marker';
import EditContact from '@gdmn-nxt/components/edit-contact/edit-contact';
import { useMemo } from 'react';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { saveFilterData } from '../../../store/filtersSlice';

export default function Contacts() {
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.contacts);
  const dispatch = useDispatch();

  const [upsertContact, setUpsertContact] = useState<{
    addContact?: boolean;
    editContact?: boolean;
    contact?: IContactPerson
  }>({
    addContact: false,
    editContact: false
  });

  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: 20
  });

  const {
    data: persons,
    isFetching: personsIsFetching,
    isLoading,
    refetch: personsRefetch
  } = useGetContactPersonsQuery({
    pagination: paginationData,
    filter: filterData
  });
  const [addPerson] = useAddContactPersonMutation();
  const [updatePerson] = useUpdateContactPersonMutation();
  const [deletePerson] = useDeleteContactPersonMutation();

  const handleCancel = () => {
    setUpsertContact({ addContact: false, editContact: false });
  };

  const handlePersonAddSubmit = async (person: IContactPerson) => {
    handleCancel();

    addPerson(person);
  };

  const handlePersonEditSubmit = async (person: IContactPerson, deleting?: boolean) => {
    deleting ? deletePerson(person.ID) : updatePerson(person);
    handleCancel();
  };

  const handleContactEdit = (contact: IContactPerson) => () => {
    setUpsertContact({ editContact: true, contact });
  };


  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ 'contacts': filteringData }));
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

  const columns: GridColumns<IContactPerson> = [
    {
      field: 'NAME', headerName: 'Имя', flex: 1, minWidth: 200,
      renderCell: ({ value, row }) => {
        const labels: ILabel[] = row.LABELS ?? [];
        return (
          <Stack spacing={1} direction="row">
            <Typography>{value}</Typography>
            {Array.isArray(labels)
              ?
              <List
                style={{
                  flexDirection: 'row',
                  padding: '0px',
                  width: 'fit-content',
                  display: 'flex',

                  flexWrap: 'wrap',
                  columnGap: '5px',
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
                          // onClick={handleLabelClick(label)}
                          // style={labelStyle}
                          sx={{
                            display: 'inline-block',
                            padding: '2.5px 0px',
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
      // renderCell: ({ value, row }) => {
      //   const labels = row.LABELS ?? [];
      //   const emails = row.EMAILS ?? [];
      //   const phones = row.PHONES ?? [];

      //   return (
      //     <Stack>
      //       <Typography>{value}</Typography>
      //       {emails?.length > 0
      //         ? <Typography variant="caption">{emails[0].EMAIL}</Typography>
      //         : <></>}
      //       {phones?.length > 0
      //         ? <Typography variant="caption">{phones[0].USR$PHONENUMBER}</Typography>
      //         : <></>}
      //     </Stack>
      //   );
      // }
    },
    {
      field: 'PHONES', headerName: 'Телефон', width: 150,
      renderCell: ({ value: phones }) => {
        return (
          <Stack>
            {phones?.slice(0, 2)?.map((phone: IPhone) => <Typography key={phone.ID} variant="caption">{phone.USR$PHONENUMBER}</Typography>)}
          </Stack>);
      }
    },
    {
      field: 'EMAILS', headerName: 'Email', width: 200,
      renderCell: ({ value: emails }) => {
        return (
          <Stack>
            {emails?.slice(0, 2)?.map((email: IEmail) => <Typography key={email.ID} variant="caption">{email.EMAIL}</Typography>)}
          </Stack>);
      }
    },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      getActions: ({ row }) => [
        Object.keys(row).length > 0
          ? <>
            {/* <PermissionsGate actionAllowed={userPermissions?.deals.PUT}> */}
            <IconButton
              key={1}
              color="primary"
              size="small"
              onClick={handleContactEdit(row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            {/* </PermissionsGate> */}
          </>
          : <></>
      ]
    }
    // { field: 'DOCUMENTDATE', headerName: 'Дата', width: 100, type: 'date',
    //   renderCell: ({ value }) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    // },
    // { field: 'DEPT_NAME', headerName: 'Отдел', width: 100 },
    // { field: 'JOB_NUMBER', headerName: 'Заказ', width: 100 },
    // { field: 'CSUMNCU', headerName: 'Сумма', minWidth: 100, align: 'right',
    //   renderCell: ({ value }) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    // { field: 'COMMENT', headerName: 'Комментарии', flex: 1, minWidth: 300,
    //   renderCell: ({ value }) => <Box style={{ width: '100%', whiteSpace: 'initial' }}>{value}</Box>
    // }
  ];

  const memoEditContact = useMemo(() =>
    <EditContact
      open={!!upsertContact.editContact}
      contact={upsertContact.contact!}
      onSubmit={handlePersonEditSubmit}
      onCancel={handleCancel}
    />,
  [upsertContact.contact, upsertContact.editContact]);

  const memoAddContact = useMemo(() =>
    <AddContact
      open={!!upsertContact.addContact}
      onSubmit={handlePersonAddSubmit}
      onCancel={handleCancel}
    />,
  [upsertContact.addContact]);

  return (
    <CustomizedCard borders style={{ flex: 1 }}>
      <CardHeader title={<Typography variant="pageHeader">Контакты</Typography>} />
      <Divider />
      <CardToolbar>
        <Stack direction="row" spacing={2}>
          <Box display="inline-flex" alignSelf="center">
            <LoadingButton
              loading={personsIsFetching}
              loadingPosition="start"
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setUpsertContact({ addContact: true })}
            >
                Добавить
            </LoadingButton>
          </Box>
          <SearchBar
            disabled={personsIsFetching}
            onCancelSearch={cancelSearch}
            onRequestSearch={requestSearch}
            cancelOnEscape
            value={
              filterData?.name
                ? filterData.name[0]
                : undefined
            }
          />
          <CustomLoadingButton
            hint="Обновить данные"
            loading={personsIsFetching}
            onClick={() => personsRefetch()}
          />
          <IconButton
            // onClick={filterHandlers.handleFilter}
            // disabled={personsIsFetching}
            disabled
            style={{
              width: 40,
              display: 'none'
            }}
          >
            <Tooltip
              title=""
              // title={Object.keys(filteringData || {}).length > 0 && (Object.keys(filteringData || {}).length === 1 ? !filteringData.NAME : true)
              //   ? 'У вас есть активные фильтры'
              //   : 'Выбрать фильтры'
              // }
              arrow
            >
              <Badge
                color="error"
                variant="dot"
                // variant={
                //   Object.keys(filteringData || {}).length > 0 && (Object.keys(filteringData || {}).length === 1 ? !filteringData.NAME : true)
                //     ? 'dot'
                //     : 'standard'
                // }
              >
                <FilterListIcon
                  color={personsIsFetching ? 'disabled' : 'primary'}
                />
              </Badge>
            </Tooltip>
          </IconButton>
        </Stack>
      </CardToolbar>
      <CardContent style={{ padding: 0 }}>
        <StyledGrid
          rows={persons?.records ?? []}
          columns={columns}
          onRowDoubleClick={({ row }) => handleContactEdit(row)()}
          loading={isLoading}
          rowHeight={40}
          rowCount={persons?.count ?? 0}
          hideHeaderSeparator
          disableMultipleSelection
          hideFooterSelectedRowCount
          disableColumnResize
          disableColumnReorder
          disableColumnFilter
          disableColumnMenu
          pagination
          paginationMode="server"
          onPageChange={(data) => {
            setPaginationData((prevState) => ({
              ...prevState,
              pageNo: data
            }));
          }}
          onPageSizeChange={(data) => {
            setPaginationData((prevState) => ({
              ...prevState,
              pageSize: data
            }));
          }}
          pageSize={paginationData.pageSize}
          rowsPerPageOptions={[10, 20, 50]}
          sortingMode="server"

        />
        {/* <AddContact
          open={!!upsertContact.addContact}
          onSubmit={handlePersonAddSubmit}
          onCancel={handleCancel}
        /> */}
        {memoAddContact}
        {memoEditContact}
        {/* {memoUpsertDenyReason} */}
      </CardContent>
    </CustomizedCard>
  );
};
