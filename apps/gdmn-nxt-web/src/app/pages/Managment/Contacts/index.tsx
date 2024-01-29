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
import ContactsFilter from '@gdmn-nxt/components/Contacts/contacts-filter/contacts-filter';
import CircularIndeterminate from '@gdmn-nxt/components/helpers/circular-indeterminate/circular-indeterminate';

export default function Contacts() {
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.contacts);
  const [openFilters, setOpenFilters] = useState(false);
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


  const handleViewModeChange = (mode: number) => {
    if (mode === 2) {
      setPaginationData(prev => ({ ...prev, pageSize: 20 }));
      return;
    }
    setPaginationData(prev => ({ ...prev, pageSize: matchUpUW ? 25 : 12 }));
  };

  useEffect(() => {
    handleViewModeChange(viewMode);
  }, [matchUpUW]);


  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: matchUpUW ? 25 : 12,
  });

  const {
    data: persons,
    isFetching: personsIsFetching,
    isLoading,
    refetch: personsRefetch
  } = useGetContactPersonsQuery({
    pagination: paginationData,
    ...(filterData && { filter: filterData })
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

  const filterHandlers = {
    filterClick: useCallback(() => {
      setOpenFilters(true);
    }, []),
    filterClose: async () => {
      setOpenFilters(false);
    },
  };

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

  const memoFilter = useMemo(() =>
    <ContactsFilter
      open={openFilters}
      onClose={filterHandlers.filterClose}
      filteringData={filterData}
      onFilteringDataChange={handleFilteringDataChange}
    />,
  [openFilters, filterData]);


  return (
    <CustomizedCard style={{ flex: 1 }}>
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
                handleViewModeChange(value);
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
                  <AddCircleIcon color={personsIsFetching ? 'disabled' : 'primary'} />
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
            <Box display="inline-flex" alignSelf="center">
              <IconButton
                onClick={filterHandlers.filterClick}
                disabled={personsIsFetching}
                size ="small"
              >
                <Tooltip
                  title={Object.keys(filterData || {}).filter(f => f !== 'name').length > 0
                    ? 'У вас есть активные фильтры'
                    : 'Выбрать фильтры'
                  }
                  arrow
                >
                  <Badge
                    color="error"
                    variant={
                      Object.keys(filterData || {}).filter(f => f !== 'name').length > 0
                        ? 'dot'
                        : 'standard'
                    }
                  >
                    <FilterListIcon
                      color={personsIsFetching ? 'disabled' : 'primary'}
                    />
                  </Badge>
                </Tooltip>
              </IconButton>
            </Box>
          </Stack>
        }
      />
      <Divider />
      <CardContent style={{ padding: 0 }}>
        {viewMode === 1
          ? isLoading
            ? <Box height={'100%'} display="flex">
              <CircularIndeterminate open={true} size={70} />
            </Box>
            : <ContactCards
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
        {memoAddContact}
        {memoEditContact}
        {memoFilter}
      </CardContent>
    </CustomizedCard>
  );
};
