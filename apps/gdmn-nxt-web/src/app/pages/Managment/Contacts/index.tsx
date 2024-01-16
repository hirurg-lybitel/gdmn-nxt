import CardToolbar from '@gdmn-nxt/components/Styled/card-toolbar/card-toolbar';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import { LoadingButton } from '@mui/lab';
import { Badge, Box, CardContent, CardHeader, Divider, IconButton, List, ListItemButton, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import { MouseEvent, useState } from 'react';
import AddContact from '@gdmn-nxt/components/add-contact/add-contact';
import { useAddContactPersonMutation, useDeleteContactPersonMutation, useGetContactPersonsQuery, useUpdateContactPersonMutation } from '../../../features/contact/contactApi';
import { useFormik } from 'formik';
import { IContactPerson, ILabel } from '@gsbelarus/util-api-types';
import { GridColDef, GridColumns } from '@mui/x-data-grid-pro';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import { IPaginationData } from '../../../features/customer/customerApi_new';
import LabelMarker from '@gdmn-nxt/components/Labels/label-marker/label-marker';
import EditContact from '@gdmn-nxt/components/edit-contact/edit-contact';
import { useMemo } from 'react';

export default function Contacts() {
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
    pageSize: 10
  });

  const {
    data: persons,
    isFetching: personsIsFetching,
    isLoading,
    refetch: personsRefetch
  } = useGetContactPersonsQuery({
    pagination: paginationData,
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

  const columns: GridColumns<IContactPerson> = [
    {
      field: 'NAME', headerName: 'Имя', flex: 0.5, minWidth: 200,
      renderCell: ({ value, row }) => {
        const labels = row.LABELS ?? [];
        const emails = row.EMAILS ?? [];
        const phones = row.PHONES ?? [];

        return (
          <Stack>
            <Typography>{value}</Typography>
            {emails?.length > 0
              ? <Typography variant="caption">{emails[0].EMAIL}</Typography>
              : <></>}
            {phones?.length > 0
              ? <Typography variant="caption">{phones[0].USR$PHONENUMBER}</Typography>
              : <></>}
          </Stack>
        );
      }
    },
    {
      field: 'LABELS', headerName: 'Метки', flex: 1,
      renderCell: ({ value }) => {
        const labels: ILabel[] = value ?? [];

        return (
          <Stack spacing={1}>
            {labels?.length
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
    <CustomizedCard style={{ flex: 1 }}>
      <CardHeader title={<Typography variant="pageHeader">Контакты</Typography>} />
      <Divider />
      <CardToolbar>
        <Stack direction="row">
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
          <Box flex={1} />
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
              width: 40
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
      <CardContent>
        <StyledGrid
          rows={persons?.records ?? []}
          columns={columns}
          onRowDoubleClick={({ row }) => handleContactEdit(row)()}
          loading={isLoading}
          rowHeight={65}
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
