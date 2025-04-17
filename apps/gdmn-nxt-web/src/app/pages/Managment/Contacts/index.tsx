import styles from './contacts.module.less';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import { Badge, Box, CardContent, CardHeader, Divider, IconButton, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import { useCallback, useEffect, useState, useMemo } from 'react';
import AddContact from '@gdmn-nxt/components/Contacts/add-contact/add-contact';
import { useAddContactPersonMutation, useDeleteContactPersonMutation, useGetContactPersonsQuery, useUpdateContactPersonMutation } from '../../../features/contact/contactApi';
import { IContactPerson, IFilteringData, ISortingData } from '@gsbelarus/util-api-types';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import { IPaginationData } from '../../../features/customer/customerApi_new';
import EditContact from '@gdmn-nxt/components/Contacts/edit-contact/edit-contact';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import { clearFilterData, saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import ContactCards from '@gdmn-nxt/components/Contacts/contact-cards/contact-cards';
import ContactList from '@gdmn-nxt/components/Contacts/contact-list/contact-list';
import ContactsFilter from '@gdmn-nxt/components/Contacts/contacts-filter/contacts-filter';
import CircularIndeterminate from '@gdmn-nxt/helpers/circular-indeterminate/circular-indeterminate';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';

const highlightFields = (searchValue: string) => {
  const elements = document.querySelectorAll('[data-searchable=true]');

  elements.forEach(element => {
    const text = element.textContent?.toLowerCase();
    if (!text?.includes(searchValue)) {
      element.innerHTML = element.textContent ? element.textContent : '';
      return;
    }
    const regex = new RegExp(searchValue, 'i');
    element.innerHTML = element.textContent?.replace(
      regex,
      (match: string) => `<span class=${styles.highlight}>${match}</span>`
    ) ?? '';
  });
};

export default function Contacts() {
  const userPermissions = usePermissions();
  const [sortingData, setSortingData] = useState<ISortingData | null>();
  const filterEntityName = 'contacts';
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[`${filterEntityName}`]);

  const [openFilters, setOpenFilters] = useState(false);
  const dispatch = useDispatch();

  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName);

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
    setPaginationData(prev => ({ ...prev, pageSize: matchUpUW ? 16 : 9 }));
  };

  useEffect(() => {
    handleViewModeChange(viewMode);
  }, [matchUpUW]);


  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: matchUpUW ? 16 : 9,
  });

  const {
    data: persons,
    isFetching: personsIsFetching,
    isLoading,
    refetch: personsRefetch
  } = useGetContactPersonsQuery({
    pagination: paginationData,
    ...(filterData && { filter: filterData }),
    ...(sortingData ? { sort: sortingData } : {})
  });
  const [addPerson] = useAddContactPersonMutation();
  const [updatePerson] = useUpdateContactPersonMutation();
  const [deletePerson] = useDeleteContactPersonMutation();

  useEffect(() => {
    if (!persons?.records.length) {
      return;
    }
    const searchText = Array.isArray(filterData?.name) ? filterData.name[0] ?? '' : '';
    highlightFields(searchText);
  }, [persons?.records, filterData?.name]);

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
    dispatch(saveFilterData({ [`${filterEntityName}`]: filteringData }));
  }, []);

  const handleFilteringDataChange = useCallback((newValue: IFilteringData) => saveFilters(newValue), []);

  const requestSearch = useCallback((value: string) => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange({
      ...newObject,
      ...(value !== '' ? { name: [value] } : {})
    });
    setPaginationData(prev => ({ ...prev, pageNo: 0 }));
  }, [filterData]);

  const cancelSearch = useCallback(() => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange(newObject);
  }, [filterData]);

  const filterHandlers = {
    filterClick: useCallback(() => {
      setOpenFilters(true);
    }, []),
    filterClose: useCallback(() => {
      setOpenFilters(false);
    }, []),
    filterClear: useCallback(() => {
      setOpenFilters(false);
      dispatch(clearFilterData({ filterEntityName }));
    }, [dispatch])
  };

  const handleSortChange = useCallback((sortModel: ISortingData | null) => setSortingData(sortModel), []);

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
      filterClear={filterHandlers.filterClear}
    />,
  [openFilters, filterData, filterHandlers]);

  return (
    <CustomizedCard style={{ flex: 1 }}>
      <CustomCardHeader
        search
        filter
        refetch
        title={'Контакты'}
        isLoading={isLoading}
        isFetching={personsIsFetching}
        onCancelSearch={cancelSearch}
        onRequestSearch={requestSearch}
        searchValue={filterData?.name?.[0]}
        onRefetch={personsRefetch}
        onFilterClick={filterHandlers.filterClick}
        hasFilters={Object.keys(filterData || {}).filter(f => f !== 'name').length > 0}
        addButton={userPermissions?.contacts?.POST}
        addButtonTooltip="Создать контракт"
        onAddClick={() => setUpsertContact({ addContact: true })}
        action={
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
            onSortChange={handleSortChange}
          />}
        {memoAddContact}
        {memoEditContact}
        {memoFilter}
      </CardContent>
    </CustomizedCard>
  );
};
