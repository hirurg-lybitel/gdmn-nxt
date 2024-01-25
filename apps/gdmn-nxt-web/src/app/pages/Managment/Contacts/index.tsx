import styles from './contacts.module.less';
import CardToolbar from '@gdmn-nxt/components/Styled/card-toolbar/card-toolbar';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import { LoadingButton } from '@mui/lab';
import { Badge, Box, CardContent, CardHeader, Divider, IconButton, List, ListItemButton, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import { MouseEvent, useCallback, useEffect, useState } from 'react';
import AddContact from '@gdmn-nxt/components/Contacts/add-contact/add-contact';
import { useAddContactPersonMutation, useDeleteContactPersonMutation, useGetContactPersonsQuery, useUpdateContactPersonMutation } from '../../../features/contact/contactApi';
import { useFormik } from 'formik';
import { IContactPerson, IEmail, IFilteringData, ILabel, IPhone } from '@gsbelarus/util-api-types';
import { GridColDef, GridColumns } from '@mui/x-data-grid-pro';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import { IPaginationData } from '../../../features/customer/customerApi_new';
import LabelMarker from '@gdmn-nxt/components/Labels/label-marker/label-marker';
import EditContact from '@gdmn-nxt/components/Contacts/edit-contact/edit-contact';
import { useMemo } from 'react';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { saveFilterData } from '../../../store/filtersSlice';
import ContactCards from '@gdmn-nxt/components/Contacts/contact-cards/contact-cards';
import ContactList from '@gdmn-nxt/components/Contacts/contact-list/contact-list';

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

  const [viewMode, setViewMode] = useState(1);

  const theme = useTheme();
  const matchUpUW = useMediaQuery(theme.breakpoints.up('ultraWide'));


  useEffect(() => {
    if (viewMode === 2) {
      setPaginationData(prev => ({ ...prev, pageSize: 20 }));
      return;
    }
    setPaginationData(prev => ({ ...prev, pageSize: matchUpUW ? 25 : 12 }));
  }, [matchUpUW]);


  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: 12,
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

  const handleContactEdit = (contact: IContactPerson) => {
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
      <CardHeader
        title={<Typography variant="pageHeader">Контакты</Typography>}
        action={
          <Stack direction="row" spacing={1}>
            <Box paddingX={'4px'} />
            <ToggleButtonGroup
              color="primary"
              value={viewMode}
              exclusive
              size="small"
              onChange={(e, value) => {
                if (!value) return;

                if (value === 2) {
                  setPaginationData(prev => ({ ...prev, pageSize: 20 }));
                  // return;
                } else {
                  setPaginationData(prev => ({ ...prev, pageSize: matchUpUW ? 25 : 12 }));
                }

                setViewMode(value);
              }}
            >
              <ToggleButton value={1} className={styles.toggleButton}>
                <Tooltip title="Карточки" arrow >
                  <ViewWeekIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value={2} className={styles.toggleButton}>
                <Tooltip title="Список" arrow>
                  <ViewStreamIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            <SearchBar
              disabled={personsIsFetching}
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
              <IconButton
                size="small"
                disabled={personsIsFetching}
                onClick={() => setUpsertContact({ addContact: true })}
              >
                <Tooltip arrow title="Создать контакт">
                  <AddCircleIcon color="primary" />
                </Tooltip>
              </IconButton>
            </Box>
            <Box display="inline-flex" alignSelf="center">
              <CustomLoadingButton
                hint="Обновить данные"
                loading={personsIsFetching}
                onClick={() => personsRefetch()}
              />
            </Box>
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
        }
      />
      <Divider />
      {/* <CardToolbar>
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
      </CardToolbar> */}
      <CardContent style={{ padding: 0 }}>
        {viewMode === 1
          ? <ContactCards
            contacts={persons?.records}
            contactsCount={persons?.count ?? 0}
            onEditClick={handleContactEdit}
            paginationData={paginationData}
            paginationClick={(data) => setPaginationData(data)}
          />
          : <ContactList
            contacts={persons?.records ?? []}
            contactsCount={persons?.count ?? 0}
            onEditClick={handleContactEdit}
            isLoading={isLoading}
            paginationData={paginationData}
            paginationClick={(data) => setPaginationData(data)}
          />}
        {/* <StyledGrid
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
        /> */}
        {memoAddContact}
        {memoEditContact}
      </CardContent>
    </CustomizedCard>
  );
};
