import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import { Avatar, Box, Stack, Switch, Tooltip, Typography, Theme } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid-pro';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';
import { useDeleteUserGroupLineMutation, useGetUserGroupLineQuery, useUpdateUserGroupLineMutation, useCloseSessionByIdMutation } from '../../../features/permissions';
import { ChangeEvent, useMemo } from 'react';
import { IUserGroup, IUserGroupLine } from '@gsbelarus/util-api-types';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import Confirmation from '@gdmn-nxt/helpers/confirmation';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import { useResetProfileSettingsMutation } from '../../../features/profileSettings';
import useUserData from '@gdmn-nxt/helpers/hooks/useUserData';
import { makeStyles } from '@mui/styles';
import { Height } from '@mui/icons-material';

const useStyles = makeStyles((theme: Theme) => ({
  statusIcon: {
    borderRadius: '100%',
    height: '10px',
    width: '10px'
  }
}));

interface IUsersProps{
  group?: IUserGroup;
};

export function Users(props: IUsersProps) {
  const { group } = props;

  const classes = useStyles();

  const { data: users = [], isFetching: usersFetching, isLoading: usersLoading } = useGetUserGroupLineQuery(group?.ID ?? -1, { skip: !group?.ID, pollingInterval: 1000 * 10 });
  const [updateUser] = useUpdateUserGroupLineMutation();
  const [deleteUserGroupLine] = useDeleteUserGroupLineMutation();
  const [closeSession] = useCloseSessionByIdMutation();

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

  const onReset = (id: number) => {
    resetUser(id);
  };

  const onSessionClose = (id?: number) => {
    if (!id) return;
    closeSession(id);
  };

  const { id: userId } = useUserData();

  const columns: GridColDef<IUserGroupLine>[] = [
    {
      field: 'CONTACT',
      headerName: 'Сотрудник',
      flex: 1,
      sortComparator: (a, b) => ('' + a.NAME).localeCompare(b.NAME),
      renderCell({ row }) {
        const value = row.USER?.CONTACT;
        return (
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <div>
              <Avatar sx={{ width: 30, height: 30 }} src={row.USER?.AVATAR} />
            </div>
            <Box>
              <Typography variant="body2">{value?.NAME}</Typography>
              <Typography variant="caption">{value?.PHONE && `Тел. ${value?.PHONE}`}</Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      field: 'NAME', headerName: 'Логин', minWidth: 140,
      valueGetter: ({ row }) => row.USER?.NAME,
    },
    { field: 'isActivated', headerName: 'Активирован', resizable: false, type: 'boolean', width: 150,
      valueGetter: (params) => params.row.USER?.isActivated ?? false
    },
    { field: 'status', headerName: '', width: 60, resizable: false, disableColumnMenu: true, sortable: false,
      renderCell: ({ value = false, row }) =>
        <Tooltip
          arrow
          title={row.STATUS ? 'В сети' : 'Не в сети'}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <div style={{ background: row.STATUS ? 'rgb(32, 147, 81)' : 'rgb(242, 63, 67)' }} className={classes.statusIcon} />
          </div>
        </Tooltip>
    },
    { field: 'REQUIRED_2FA', headerName: '2FA', width: 70, resizable: false,
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
      width: 50,
      align: 'center',
      renderCell: ({ row: { ID, USER, USERGROUP } }) =>
        <MenuBurger
          items={({ closeMenu }) => [
            userId === USER?.ID
              ? <></>
              : <Confirmation
                key="delete"
                title="Закрытие сессии"
                text={`Вы действительно хотите закрыть сессию пользователя ${USER?.NAME}?`}
                dangerous
                onConfirm={() => {
                  onSessionClose(USER?.ID);
                  closeMenu();
                }}
                onClose={closeMenu}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <PowerOffIcon />
                  <span>Закрыть сессию</span>
                </Stack>
              </Confirmation>,
            <Confirmation
              key="delete"
              title="Сброс настроек"
              text={`Вы действительно хотите сбросить настройки пользователя ${USER?.NAME}?`}
              dangerous
              onConfirm={() => {
                onReset(Number(USER?.ID));
                closeMenu();
              }}
              onClose={closeMenu}
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
              title="Удалить пользователя"
              text={`Вы действительно хотите удалить пользователя ${USER?.CONTACT?.NAME} из группы ${USERGROUP?.NAME}?`}
              dangerous
              onConfirm={onDelete(ID)}
              onClose={closeMenu}
            >
              <ItemButtonDelete
                label="Удалить"
                confirmation={false}
              />
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
