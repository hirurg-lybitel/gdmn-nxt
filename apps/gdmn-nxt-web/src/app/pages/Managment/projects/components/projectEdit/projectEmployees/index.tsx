import AddCircleIcon from '@mui/icons-material/AddCircle';
import './ProjectEmployees.module.css';
import { IContactWithID, IPaginationData } from '@gsbelarus/util-api-types';
import { useAddContactPersonMutation, useDeleteContactPersonMutation, useGetContactPersonsQuery, useUpdateConstactPersonsMutation, useUpdateContactPersonMutation } from 'apps/gdmn-nxt-web/src/app/features/contact/contactApi';
import { useCallback, useMemo, useState } from 'react';
import ContactCards from '@gdmn-nxt/components/Contacts/contact-cards/contact-cards';
import EditContact from '@gdmn-nxt/components/Contacts/edit-contact/edit-contact';
import AddContact from '@gdmn-nxt/components/Contacts/add-contact/add-contact';
import { Box, IconButton, Stack, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import EmployeesChoose from './employee-choose';

export interface ProjectEmployeesProps {
  employees?: IContactWithID[],
  onChange: (empls: IContactWithID[]) => void
}

export function ProjectEmployees({
  employees = [],
  onChange
}: ProjectEmployeesProps) {
  const theme = useTheme();
  const matchUpUW = useMediaQuery(theme.breakpoints.up('ultraWide'));

  const {
    data: persons,
    isFetching: personsIsFetching,
    isLoading,
    refetch: personsRefetch
  } = useGetContactPersonsQuery();

  const sortPersons = useMemo(() => {
    return persons?.records?.filter(person => {
      for (const empl of employees) {
        if (empl.ID === person.ID) return true;
      }
      return false;
    }) || [];
  }, [employees, persons?.records]);

  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: matchUpUW ? 16 : 9,
  });

  const personsWithPagination = useMemo(() => {
    const fromRecord = Number(paginationData.pageNo) * Number(paginationData.pageSize);
    const toRecord = fromRecord + Number(paginationData.pageSize);

    return sortPersons.slice(fromRecord, toRecord);
  }, [paginationData.pageNo, paginationData.pageSize, sortPersons]);

  const userPermissions = usePermissions();

  const [addPerson] = useAddContactPersonMutation();
  const [updatePerson] = useUpdateContactPersonMutation();
  const [deletePerson] = useDeleteContactPersonMutation();

  const [upsertContact, setUpsertContact] = useState<{
    addContact?: boolean;
    editContact?: boolean;
    contact?: IContactWithID
  }>({
    addContact: false,
    editContact: false
  });

  const handleContactEdit = useCallback((contact: IContactWithID) => {
    setUpsertContact({ editContact: true, contact });
  }, []);

  const handleCancel = useCallback(() => {
    setUpsertContact({ addContact: false, editContact: false });
  }, []);

  const handlePersonEditSubmit = useCallback((person: IContactWithID, deleting?: boolean) => {
    deleting ? deletePerson(person.ID) : updatePerson(person);
    handleCancel();
  }, [deletePerson, handleCancel, updatePerson]);

  const handlePersonAddSubmit = useCallback((person: IContactWithID) => {
    handleCancel();
    addPerson(person);
  }, [addPerson, handleCancel]);

  const handlePersonAdd = useCallback(() => {
    setUpsertContact({
      addContact: true,
      contact: {
        ID: -1,
        NAME: '',
      }
    });
  }, []);

  const memoEditContact = useMemo(() =>
    <EditContact
      open={!!upsertContact.editContact}
      contact={upsertContact.contact!}
      onSubmit={handlePersonEditSubmit}
      onCancel={handleCancel}
    />,
  [handleCancel, handlePersonEditSubmit, upsertContact.contact, upsertContact.editContact]);

  const memoAddContact = useMemo(() =>
    <AddContact
      open={!!upsertContact.addContact}
      contact={upsertContact.contact}
      onSubmit={handlePersonAddSubmit}
      onCancel={handleCancel}
    />,
  [handleCancel, handlePersonAddSubmit, upsertContact.addContact, upsertContact.contact]);

  return (
    <Stack className="contacts-container">
      <Stack direction="row" spacing={1}>
        <EmployeesChoose
          label={'Сотрудники'}
          placeholder={'Выберите сотрудников'}
          value={employees ?? []}
          disabled={personsIsFetching}
          onSubmit={onChange}
        />
        <Box display="inline-flex" alignSelf="center">
          <PermissionsGate actionAllowed={userPermissions?.contacts?.POST}>
            <IconButton
              size="small"
              disabled={personsIsFetching}
              onClick={handlePersonAdd}
            >
              <Tooltip arrow title="Создать контакт">
                <AddCircleIcon color={personsIsFetching ? 'disabled' : 'primary'} />
              </Tooltip>
            </IconButton>
          </PermissionsGate>
        </Box>
        <Box display="inline-flex" alignSelf="center">
          <CustomLoadingButton
            hint="Обновить данные"
            loading={personsIsFetching}
            onClick={() => personsRefetch()}
          />
        </Box>
      </Stack>
      <ContactCards
        contacts={personsWithPagination}
        contactsCount={sortPersons.length ?? 0}
        onEditClick={handleContactEdit}
        paginationData={paginationData}
        paginationClick={(data) => setPaginationData(data)}
      />
      {memoAddContact}
      {memoEditContact}
    </Stack>
  );
}
