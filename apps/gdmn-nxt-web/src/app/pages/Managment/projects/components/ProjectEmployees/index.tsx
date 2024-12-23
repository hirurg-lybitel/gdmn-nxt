import AddCircleIcon from '@mui/icons-material/AddCircle';
import './ProjectEmployees.module.css';
import { IContactPerson, IPaginationData } from '@gsbelarus/util-api-types';
import { useAddContactPersonMutation, useDeleteContactPersonMutation, useGetContactPersonsQuery, useUpdateConstactPersonsMutation, useUpdateContactPersonMutation } from 'apps/gdmn-nxt-web/src/app/features/contact/contactApi';
import { useMemo, useState } from 'react';
import ContactCards from '@gdmn-nxt/components/Contacts/contact-cards/contact-cards';
import EditContact from '@gdmn-nxt/components/Contacts/edit-contact/edit-contact';
import AddContact from '@gdmn-nxt/components/Contacts/add-contact/add-contact';
import { Box, IconButton, Stack, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import ContactsChoose from '@gdmn-nxt/components/Contacts/contacts-choose';

export interface ProjectEmployeesProps {
  employees: IContactPerson[],
  onChange: (empls: IContactPerson[]) => void
}

export function ProjectEmployees({
  employees,
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

  const sortPersons = useMemo(() => persons?.records?.filter(person => {
    for (const empl of employees) {
      if (empl.ID === person.ID) return true;
    }
    return false;
  }), [employees, persons?.records]) || [];

  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: matchUpUW ? 16 : 9,
  });

  const userPermissions = usePermissions();

  const [addPerson] = useAddContactPersonMutation();
  const [updatePerson] = useUpdateContactPersonMutation();
  const [updatePersons] = useUpdateConstactPersonsMutation();
  const [deletePerson] = useDeleteContactPersonMutation();

  const [upsertContact, setUpsertContact] = useState<{
    addContact?: boolean;
    editContact?: boolean;
    contact?: IContactPerson
  }>({
    addContact: false,
    editContact: false
  });

  const handleContactEdit = (contact: IContactPerson) => {
    setUpsertContact({ editContact: true, contact });
  };

  const handleCancel = () => {
    setUpsertContact({ addContact: false, editContact: false });
  };

  const handlePersonEditSubmit = async (person: IContactPerson, deleting?: boolean) => {
    deleting ? deletePerson(person.ID) : updatePerson(person);
    handleCancel();
  };

  const handlePersonAddSubmit = async (person: IContactPerson) => {
    handleCancel();

    addPerson(person);
  };

  const handlePersonAdd = () => {
    setUpsertContact({
      addContact: true,
      contact: {
        ID: -1,
        NAME: '',
      }
    });
  };

  const handleContactsChooseSubmit = (values: IContactPerson[]) => {
    const contacts = employees ?? [];

    const addedContacts = values?.reduce((acc, contact) => {
      if (contacts.findIndex(({ ID }) => ID === contact.ID) < 0) {
        const { ID, NAME } = contact;
        acc.push({
          ID,
          NAME
        });
      }
      return acc;
    }, [] as Partial<IContactPerson[]>);

    const deletedContacts = contacts.reduce((acc, contact) => {
      if (values.findIndex(({ ID }) => ID === contact.ID) < 0) {
        const { ID, NAME } = contact;
        acc.push({
          ID,
          NAME,
          COMPANY: null
        });
      }
      return acc;
    }, [] as Partial<IContactPerson[]>);

    updatePersons(addedContacts);
    updatePersons(deletedContacts);
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
      contact={upsertContact.contact}
      onSubmit={handlePersonAddSubmit}
      onCancel={handleCancel}
    />,
  [upsertContact.addContact]);

  return (
    <Stack className="contacts-container">
      <Stack direction="row" spacing={1}>
        <ContactsChoose
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
        contacts={sortPersons}
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
