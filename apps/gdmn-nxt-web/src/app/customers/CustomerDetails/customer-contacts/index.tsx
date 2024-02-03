import ChecklistIcon from '@mui/icons-material/Checklist';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import './customer-contacts.css';
import { IContactPerson, IPaginationData } from '@gsbelarus/util-api-types';
import { useAddContactPersonMutation, useDeleteContactPersonMutation, useGetContactPersonsQuery, useUpdateContactPersonMutation } from '../../../features/contact/contactApi';
import { useMemo, useState } from 'react';
import ContactCards from '@gdmn-nxt/components/Contacts/contact-cards/contact-cards';
import EditContact from '@gdmn-nxt/components/Contacts/edit-contact/edit-contact';
import AddContact from '@gdmn-nxt/components/Contacts/add-contact/add-contact';
import { Box, IconButton, Stack, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/components/helpers/hooks/usePermissions';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';

export interface CustomerContactsProps {
  customerId: number;
}

export function CustomerContacts({
  customerId
}: CustomerContactsProps) {
  const theme = useTheme();
  const matchUpUW = useMediaQuery(theme.breakpoints.up('ultraWide'));

  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: matchUpUW ? 25 : 12,
  });

  const userPermissions = usePermissions();

  const [addPerson] = useAddContactPersonMutation();
  const [updatePerson] = useUpdateContactPersonMutation();
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

  const {
    data: persons,
    isFetching: personsIsFetching,
    isLoading,
    refetch: personsRefetch
  } = useGetContactPersonsQuery({
    pagination: paginationData,
    filter: { customerId }
  });

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
    <Stack className="container">
      <Stack direction="row" spacing={1}>
        {/* <div>select</div> */}
        <IconButton
          size="small"
          disabled={personsIsFetching}
          // onClick={() => setUpsertContact({ addContact: true })}
        >
          <Tooltip arrow title="Выбрать контакты">
            <ChecklistIcon color={personsIsFetching ? 'disabled' : 'primary'} />
          </Tooltip>
        </IconButton>
        <Box display="inline-flex" alignSelf="center">
          <PermissionsGate actionAllowed={userPermissions?.contacts?.POST}>
            <IconButton
              size="small"
              disabled={personsIsFetching}
              onClick={() => setUpsertContact({ addContact: true })}
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
        contacts={persons?.records}
        contactsCount={persons?.count ?? 0}
        onEditClick={handleContactEdit}
        paginationData={paginationData}
        paginationClick={(data) => setPaginationData(data)}
      />
      {memoAddContact}
      {memoEditContact}
    </Stack>
  );
}
