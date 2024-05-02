import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { Avatar, Box, IconButton, Stack, Switch, Tooltip, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid-pro';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';
import { useDeleteUserGroupLineMutation, useGetUserGroupLineQuery, useUpdateUserGroupLineMutation } from '../../../features/permissions';
import { ChangeEvent, useMemo } from 'react';
import { IUserGroup, IUserGroupLine } from '@gsbelarus/util-api-types';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import Confirmation from '@gdmn-nxt/components/helpers/confirmation';
import MenuBurger from '@gdmn-nxt/components/helpers/menu-burger';
import { useResetProfileSettingsMutation } from '../../../features/profileSettings';

interface IUsersProps{
  group?: IUserGroup;
};

export function Users(props: IUsersProps) {
  const { group } = props;

  const { data: users = [], isFetching: usersFetching, isLoading: usersLoading } = useGetUserGroupLineQuery(group?.ID ?? -1, { skip: !group?.ID });
  const [updateUser] = useUpdateUserGroupLineMutation();
  const [deleteUserGroupLine] = useDeleteUserGroupLineMutation();

  const [resetUser] = useResetProfileSettingsMutation();

  const onDelete = (id: number) => () => {
    deleteUserGroupLine(id);
  };

  const onUserChange = (user: IUserGroupLine) => (e: ChangeEvent<HTMLInputElement>) => {
    updateUser({
      ...user,
      REQUIRED_2FA: e.target.checked
    });
  };

  const onReset = (id: number) => () => {
    resetUser(id);
  };

  const columns: GridColDef<IUserGroupLine>[] = [
    {
      field: 'Avatar',
      type: 'actions',
      width: 35,
      renderCell({ row }) {
        return (
          <Avatar sx={{ width: 35, height: 35 }} src={row.USER?.Avatar} />
        );
      },
    },
    { field: 'NAME', headerName: 'Логин', minWidth: 150,
      valueGetter: ({ row }) => row.USER?.NAME
    },
    {
      field: 'CONTACT',
      headerName: 'Сотрудник',
      flex: 1,
      sortComparator: (a, b) => ('' + a.NAME).localeCompare(b.NAME),
      renderCell({ row }) {
        const value = row.USER?.CONTACT;
        return (
          <Box>
            <Typography variant="body2">{value?.NAME}</Typography>
            <Typography variant="caption">{value?.PHONE && `Тел. ${value?.PHONE}`}</Typography>
          </Box>
        );
      },
    },
    { field: 'isActivated', headerName: 'Активирован', resizable: false, type: 'boolean', width: 150,
      valueGetter: (params) => params.row.USER?.isActivated ?? false
    },
    { field: 'REQUIRED_2FA', headerName: '2FA', width: 100, resizable: false,
      renderCell: ({ value = false, row }) =>
        <Tooltip
          arrow
          title={value ? 'Двухфакторная аутентификация подключена' : 'Двухфакторная аутентификация не требуется'}
        >
          <Switch
            checked={value}
            size="small"
            onChange={onUserChange(row)}
            disabled={group?.REQUIRED_2FA ?? false}
          />
        </Tooltip>
    },
    {
      field: 'ACTIONS',
      headerName: '',
      resizable: false,
      width: 100,
      align: 'center',
      renderCell: ({ id, row: { USER, USERGROUP } }) =>
        <MenuBurger
          items={[
            <Confirmation
              key="delete"
              title="Сброс настроек"
              text={`Вы действительно хотите сбросить настройки пользователя ${USER?.NAME}?`}
              dangerous
              onConfirm={onReset(Number(USER?.ID))}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <RotateLeftIcon />
                <span>Сбросить</span>
              </Stack>
            </Confirmation>,
            <Confirmation
              key="delete"
              title="Удаление пользователя"
              text={`Вы действительно хотите удалить пользователя ${USER?.NAME} из группы ${USERGROUP?.NAME}?`}
              dangerous
              onConfirm={onDelete(Number(id))}
            >
              <ItemButtonDelete label="Удалить" />
            </Confirmation>
          ]}
        />
    }
  ];

  const UsersView = useMemo(() =>
    <Box flex={1}>
      <StyledGrid
        columns={columns}
        rows={users}
        loading={usersLoading}
        sx={{
          '& .row-theme-disabled--1': {
            textDecoration: 'line-through',
            backgroundColor: 'rgb(250, 230, 230)'
          }
        }}
        getRowClassName={({ row }) => `row-theme-disabled--${row.DISABLED}`}
        disableRowSelectionOnClick
      />
    </Box>,
  [users, usersLoading, group]);

  return <>
    {UsersView}
  </>;
};
