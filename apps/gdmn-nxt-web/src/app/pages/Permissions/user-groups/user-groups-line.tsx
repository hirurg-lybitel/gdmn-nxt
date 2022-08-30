import { Box, IconButton, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid-pro';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';
import { useDeleteUserGroupLineMutation, useGetUserGroupLineQuery } from '../../../features/permissions';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useMemo } from 'react';

interface IUsersProps{
  groupID: number;
};

export function Users(props: IUsersProps) {
  const { groupID } = props;

  const { data: users, isFetching: usersFetching, isLoading: usersLoading } = useGetUserGroupLineQuery(groupID);
  const [deleteUserGroupLine] = useDeleteUserGroupLineMutation();

  const onDelete = (id: number) => (e: any) => {
    deleteUserGroupLine(id);
  };

  const columns: GridColDef[] = [
    { field: 'NAME', headerName: 'Логин', minWidth: 150,
      valueGetter: ({ row }) => row.USER.NAME
    },
    { field: 'FULLNAME', headerName: 'Полное имя', minWidth: 150,
      valueGetter: ({ row }) => row.USER.FULLNAME
    },
    {
      field: 'CONTACT',
      headerName: 'Сотрудник',
      flex: 1,
      sortComparator: (a, b) => ('' + a.NAME).localeCompare(b.NAME),
      renderCell({ row }) {
        const value = row.USER.CONTACT;
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
      renderCell: ({ id }) => {
        return (
          <Box>
            <IconButton onClick={onDelete(Number(id))}>
              <DeleteForeverIcon fontSize="small" color="primary" />
            </IconButton>
          </Box>
        );
      }
    }
  ];

  const UsersView = useMemo(() =>
    <Box flex={1}>
      <StyledGrid
        columns={columns}
        rows={users || []}
        loading={usersLoading}
        getRowHeight={() => 70}
        sx={{
          '& .row-theme-disabled--1': {
            textDecoration: 'line-through',
            backgroundColor: 'rgb(250, 230, 230)'
          }
        }}
        getRowClassName={({ row }) => `row-theme-disabled--${row.DISABLED}`}
        disableSelectionOnClick
      />
    </Box>,
  [users, usersLoading]);

  return <>
    {UsersView}
  </>;
};
