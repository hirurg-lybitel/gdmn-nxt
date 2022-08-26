import { Box, IconButton, Typography } from '@mui/material';
import { GridColDef, ruRU } from '@mui/x-data-grid-pro';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';
import { useGetUsersByGroupQuery } from '../../../features/permissions';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UserEdit from '../../../components/Permissions/user-edit/user-edit';
import { useState } from 'react';

interface IUsersProps{
  groupID: number;
};

export function Users(props: IUsersProps) {
  const { groupID } = props;

  const { data: users, isFetching: usersFetching } = useGetUsersByGroupQuery(groupID);

  const [openEditForm, setOpenEditForm] = useState(false);

  const userUsersHandlers = {
    handleOnSubmit: async () => {
      setOpenEditForm(true);
    },
    handleCancel: async () => {
      setOpenEditForm(false);
    },
    handleClose: async (e: any, reason: string) => {
      if (reason === 'backdropClick') setOpenEditForm(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'NAME', headerName: 'Логин', minWidth: 150 },
    { field: 'FULLNAME', headerName: 'Полное имя', minWidth: 150 },
    {
      field: 'CONTACT',
      headerName: 'Сотрудник',
      flex: 1,
      sortComparator: (a, b) => ('' + a.NAME).localeCompare(b.NAME),
      renderCell({ value }) {
        return (
          <Box>
            <Typography>{value.NAME}</Typography>
            <Typography variant="caption">{value.PHONE && `Тел. ${value.PHONE}`}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'ACTIONS',
      headerName: '',
      resizable: false,
      width: 100,
      align: 'center',
      renderCell: (params) => {
        // const personId = Number(params.id);

        // const handlePersonEdit = () => {
        //   setCurrentPerson(params.row);
        //   // console.log('handlePersonEdit', params);
        //   setPersonEdit(true);
        // };

        return (
          <Box>
            {/* <IconButton>
              <EditOutlinedIcon fontSize="small" color="primary" />
            </IconButton> */}
            <IconButton>
              <DeleteForeverIcon fontSize="small" color="primary" />
            </IconButton>
          </Box>
        );
      }
    }
  ];

  const UsersView = () =>
    <Box flex={1}>
      <StyledGrid
        columns={columns}
        rows={users || []}
        loading={usersFetching}
        getRowHeight={() => 70}
        sx={{
          '& .row-theme-disabled--1': {
            backgroundColor: 'rgb(250, 230, 230)'
          }
        }}
        getRowClassName={({ row }) => `row-theme-disabled--${row.DISABLED}`}
        disableSelectionOnClick
      />
    </Box>;

  return <>
    <UsersView />
    <UserEdit
      open={openEditForm}
      onSubmit={userUsersHandlers.handleOnSubmit}
      onCancel={userUsersHandlers.handleCancel}
      onClose={userUsersHandlers.handleClose}
    />
  </>;
};
