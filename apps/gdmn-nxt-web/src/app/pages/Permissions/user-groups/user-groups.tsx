import { Box, Button, CardContent, CardHeader, ClickAwayListener, Divider, IconButton, List, ListItem, ListItemText, Skeleton, Stack, Theme, Typography, useMediaQuery, useTheme } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import styles from './user-groups.module.less';
import SearchBar from '../../../components/search-bar/search-bar';
import { useAddUserGroupLineMutation, useAddUserGroupMutation, useAddUsersGroupLineMutation, useDeleteUseGroupMutation, useGetUserGroupsQuery, useUpdateUserGroupMutation } from '../../../features/permissions';
import { IUserGroup, IUserGroupLine } from '@gsbelarus/util-api-types';
import { useEffect, useMemo, useState } from 'react';
import { Users } from './user-groups-line';
import AddIcon from '@mui/icons-material/Add';
import { GroupList } from './groupList';
import UserGroupEdit from '../../../components/Permissions/user-group-edit/user-group-edit';
import UserGroupLineEdit from '../../../components/Permissions/user-group-line-edit/user-group-line-edit';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';

const ItemGroupSkeleton = () => {
  return (
    <Stack spacing={1} p={2}>
      <Skeleton
        variant="text"
        height={50}
        width="40%"
      />
      <Skeleton
        variant="text"
        height={10}
        width="100%"
      />
      <Skeleton
        variant="text"
        height={10}
        width="60%"
      />
    </Stack>
  );
};

/* eslint-disable-next-line */
export interface UserGroupsProps {}

export function UserGroups(props: UserGroupsProps) {
  const { data: userGroups, isLoading: userGroupsLoading, isFetching: userGroupFetching } = useGetUserGroupsQuery();
  const [addUserGroup, { data: addingResult, isSuccess: addingIsSuccess }] = useAddUserGroupMutation();
  const [updateUserGroup] = useUpdateUserGroupMutation();
  const [deleteUserGroup] = useDeleteUseGroupMutation();
  const [addUserGroupLine] = useAddUserGroupLineMutation();
  const [addUsersGroupLine] = useAddUsersGroupLineMutation();

  const [searchName, setSearchName] = useState('');
  const [selectedUserGroup, setSelectedUserGroup] = useState<IUserGroup>();
  const [openEditUserGroupForm, setOpenEditUserGroupForm] = useState(false);
  const [openAddUserGroupForm, setOpenAddUserGroupForm] = useState(false);
  const [openEditUserForm, setOpenEditUserForm] = useState(false);

  const filterHandlers = {
    handleRequestSearch: async (value: string) => {
      setSearchName(value);
    },
    handleCancelSearch: async () => {
      setSearchName('');
    },
  };

  useEffect(() => {
    addingIsSuccess && setSelectedUserGroup(addingResult);
  }, [addingIsSuccess]);

  const userGroupHandlers = {
    handleOnSubmit: async (userGroup: IUserGroup, deleting: boolean) => {
      openEditUserGroupForm && setOpenEditUserGroupForm(false);
      openAddUserGroupForm && setOpenAddUserGroupForm(false);

      if (deleting) {
        deleteUserGroup(userGroup.ID);
        return;
      };

      if (userGroup.ID > 0) {
        updateUserGroup(userGroup);
      } else {
        addUserGroup(userGroup);
      };
    },
    handleCancel: async () => {
      openEditUserGroupForm && setOpenEditUserGroupForm(false);
      openAddUserGroupForm && setOpenAddUserGroupForm(false);
    },
    handleClose: async () => {
      openEditUserGroupForm && setOpenEditUserGroupForm(false);
      openAddUserGroupForm && setOpenAddUserGroupForm(false);
    },
    handleOnEdit: (group: IUserGroup) => (e: any) => {
      setSelectedUserGroup(group);
      setOpenEditUserGroupForm(true);
    },
    handleAdd: () => {
      // setSelectedUserGroup(-1);
      setOpenAddUserGroupForm(true);
    }
  };

  const userUsersHandlers = {
    handleOnSubmit: async (usersGroupLine: IUserGroupLine[]) => {
      setOpenEditUserForm(false);
      addUsersGroupLine(usersGroupLine);
    },
    handleCancel: async () => {
      setOpenEditUserForm(false);
    },
  };

  const UsersList = useMemo(() =>
    <Users group={userGroups?.find(ug => ug.ID === selectedUserGroup?.ID)}/>,
  [selectedUserGroup, userGroups]);

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(true);

  const groupList = useMemo(() => {
    return (
      <Stack
        sx={matchDownSm ? {
          position: 'absolute',
          background: 'var(--color-paper-bg)',
          zIndex: 1300,
          bottom: 0,
          top: 0,
          left: open ? 0 : '-272px',
          transition: '0.3s'
        } : undefined}
        borderRight={'1px solid var(--color-grid-borders)'}
        flex={0.3}
        minWidth={250}
        p={2}
        paddingRight={0}
        spacing={2}
      >
        <Stack direction="row" marginRight={'16px !important'}>
          {!matchDownSm && <Box flex={1} />}
          <Button
            variant="contained"
            disabled={userGroupsLoading}
            startIcon={<AddIcon fontSize="large" />}
            onClick={userGroupHandlers.handleAdd}
          >
            Группа
          </Button>
          {matchDownSm && <>
            <Box flex={1} />
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton >
          </>}
        </Stack>
        <div style={{ marginRight: '16px' }}>
          <SearchBar
            disabled={userGroupsLoading}
            onCancelSearch={filterHandlers.handleCancelSearch}
            onChange={filterHandlers.handleRequestSearch}
            cancelOnEscape
            fullWidth
            placeholder="Поиск группы"
          />
        </div>
        <CustomizedScrollBox
          style={{
            paddingRight: 15
          }}
        >
          {userGroupsLoading
            ? [...Array(4)].map((el, idx) =>
              <div key={idx}>
                {idx !== 0 ? <Divider /> : <></>}
                <ItemGroupSkeleton />
              </div>)
            : <GroupList
              groups={
                userGroups?.filter(group => group.NAME.toUpperCase().includes(searchName.toUpperCase()))
                    || []
              }
              setSelectedUserGroup={setSelectedUserGroup}
              selectedUserGroup={selectedUserGroup!}
              onEdit={userGroupHandlers.handleOnEdit}
              />}
        </CustomizedScrollBox>
        <UserGroupEdit
          open={openEditUserGroupForm}
          userGroup={userGroups?.find(ug => ug.ID === selectedUserGroup?.ID)}
          onSubmit={userGroupHandlers.handleOnSubmit}
          onCancel={userGroupHandlers.handleCancel}
          onClose={userGroupHandlers.handleClose}
        />
        <UserGroupEdit
          open={openAddUserGroupForm}
          onSubmit={userGroupHandlers.handleOnSubmit}
          onCancel={userGroupHandlers.handleCancel}
          onClose={userGroupHandlers.handleClose}
        />
      </Stack>
    );
  }, [filterHandlers.handleCancelSearch, filterHandlers.handleRequestSearch, matchDownSm, open, openAddUserGroupForm, openEditUserGroupForm, searchName, selectedUserGroup, userGroupHandlers.handleAdd, userGroupHandlers.handleCancel, userGroupHandlers.handleClose, userGroupHandlers.handleOnEdit, userGroupHandlers.handleOnSubmit, userGroups, userGroupsLoading]);

  return (
    <CustomizedCard
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CustomCardHeader title={'Группы пользователей'} />
      <Divider />
      <CardContent
        style={{
          flex: 1,
          display: 'flex',
          padding: 0
        }}
      >
        <Stack
          direction="row"
          flex={1}
          position={'relative'}
        >
          {!matchDownSm && groupList}
          <Stack
            flex={1}
            p={2}
            spacing={2}
          >

            <Stack direction="row">
              {matchDownSm && <ClickAwayListener onClickAway={() => matchDownSm && setOpen(false)}>
                <div>
                  {groupList}
                  <IconButton onClick={() => setOpen(true)}>
                    <MenuIcon />
                  </IconButton>
                </div>
              </ClickAwayListener>}
              <Box flex={1} />
              <Button
                variant="contained"
                disabled={userGroupFetching || !selectedUserGroup}
                startIcon={<AddIcon fontSize="large" />}
                onClick={() => setOpenEditUserForm(true)}
              >
                Пользователь
              </Button>
            </Stack>
            {UsersList}
            <UserGroupLineEdit
              open={openEditUserForm}
              userGroupLine={{
                ID: -1,
                USERGROUP: {
                  ID: selectedUserGroup?.ID ?? -1,
                  NAME: ''
                }
              }}
              onSubmit={userUsersHandlers.handleOnSubmit}
              onCancel={userUsersHandlers.handleCancel}
            />
          </Stack>
        </Stack>
      </CardContent>
    </CustomizedCard>
  );
}

export default UserGroups;
