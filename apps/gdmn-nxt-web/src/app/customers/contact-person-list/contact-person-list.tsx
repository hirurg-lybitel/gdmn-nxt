import { Box, IconButton, List, ListItem, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid-pro';
import { useAddContactPersonMutation, useDeleteContactPersonMutation, useGetContactPersonsQuery, useUpdateContactPersonMutation } from '../../features/contact/contactApi';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { IContactPerson, IPhone } from '@gsbelarus/util-api-types';
import PersonEdit from '../person-edit/person-edit';
import { useMemo, useState } from 'react';
import StyledGrid from '../../components/Styled/styled-grid/styled-grid';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';

export interface ContactPersonListProps {
  customerId: number;
}

export function ContactPersonList(props: ContactPersonListProps) {
  const { customerId } = props;

  const { data: persons, isFetching: personsIsFetching, isLoading, refetch } = useGetContactPersonsQuery({ customerId });

  const [deletePerson] = useDeleteContactPersonMutation();
  const [addPerson] = useAddContactPersonMutation();
  const [updatePerson] = useUpdateContactPersonMutation();

  const [personEdit, setPersonEdit] = useState(false);
  const [currentPerson, setCurrentPerson] = useState<IContactPerson>();

  const handlePersonEditSubmit = async (values: IContactPerson, deleting: boolean) => {
    setPersonEdit(false);

    if (deleting) {
      deletePerson(values.ID);
      return;
    };

    if (values.ID <= 0) {
      addPerson(values);
      return;
    };

    updatePerson(values);
  };

  const handlePersonEditCancelClick = async () => {
    setPersonEdit(false);
  };

  const handleAddPerson = () => {
    setCurrentPerson({ ID: -1, NAME: '', WCOMPANYKEY: customerId });
    setPersonEdit(true);
  };

  const columns: GridColDef[] = [
    { field: 'NAME', headerName: 'Имя', flex: 1,
      renderCell: (params) => {
        return (
          <Stack>
            <Typography>{params.row.NAME}</Typography>
            <Typography variant="caption">{params.row.RANK}</Typography>
            <Typography variant="caption">{params.row.EMAIL}</Typography>
          </Stack>
        );
      }
    },
    { field: 'PHONES', headerName: 'Телефоны', width: 150, resizable: false,
      renderCell: (params) => {
        return (
          <List>
            {params.row.PHONES?.map((phone: IPhone) =>
              <ListItem
                key={phone.ID}
                style={{
                  padding: '3px 0'
                }}
              >
                {phone.USR$PHONENUMBER}
              </ListItem>
            )}
          </List>
        );
      }
    },
    { field: 'USR$BG_OTDEL', headerName: 'Отдел', width: 100,
      valueGetter: ({ value }) => value?.NAME
    },
    {
      field: 'ACTIONS',
      headerName: '',
      resizable: false,
      width: 50,
      align: 'center',
      renderCell: (params) => {
        const personId = Number(params.id);

        const handlePersonEdit = () => {
          setCurrentPerson(params.row);
          setPersonEdit(true);
        };

        return (
          <Box>
            <IconButton onClick={handlePersonEdit} disabled={personsIsFetching} >
              <EditOutlinedIcon fontSize="small" color="primary" />
            </IconButton>
          </Box>
        );
      }
    }
  ];

  const memUpsertPerson = useMemo(() =>
    <PersonEdit
      open={personEdit}
      person={currentPerson}
      onSubmit={handlePersonEditSubmit}
      onCancelClick={handlePersonEditCancelClick}
    />,
  [personEdit]);

  return (
    <Stack direction="column" flex={1}>
      <Stack direction="row">
        <Box flex={1} />
        <CustomLoadingButton
          hint="Обновить данные"
          loading={personsIsFetching}
          onClick={refetch}
        />
        <IconButton
          color="primary"
          onClick={handleAddPerson}
          disabled={(customerId <= 0) || personsIsFetching}
        >
          <AddCircleRoundedIcon />
        </IconButton>
      </Stack>
      <StyledGrid
        rows={persons || []}
        columns={columns}
        loading={personsIsFetching}
        getRowHeight={(params) => {
          const person: IContactPerson = params.model as IContactPerson;
          const phones = person.PHONES;

          const rowHeight = 70;
          if (phones?.length) {
            const newRowHeight = 30 * phones?.length;
            return newRowHeight > rowHeight ? newRowHeight : rowHeight;
          };

          return rowHeight;
        }}
        hideFooter
        disableColumnResize
      />
      {/* <DataGridPro
        className={classes.DataGrid}
        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
        rows={persons || []}
        columns={columns}
        getRowId={row => row.ID}
        loading={personsIsFetching}
        hideFooter
        disableColumnResize
        getRowHeight={(params) => {
          const person: IContactPerson = params.model as IContactPerson;
          const phones = person.PHONES;

          const rowHeight = 70;
          if (phones?.length) {
            const newRowHeight = 30 * phones?.length;
            return newRowHeight > rowHeight ? newRowHeight : rowHeight;
          };

          return rowHeight;
        }}
      /> */}
      {memUpsertPerson}
    </Stack>
  );
}

export default ContactPersonList;
