import { Box, Button, CardContent, CardHeader, Divider, List, ListItem, ListItemText, Skeleton, Stack, Theme, Typography } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import styles from './user-groups.module.less';
import SearchBar from '../../../components/search-bar/search-bar';
import { useGetUserGroupsQuery } from '../../../features/permissions';
import { IUserGroup } from '@gsbelarus/util-api-types';
import { Dispatch, SetStateAction, useState } from 'react';
import { Users } from './users';
import AddIcon from '@mui/icons-material/Add';
import { makeStyles } from '@mui/styles';
import { GroupList } from './groupList';


// export interface StyleProps {
//   isFocus: boolean;
// }

// const styles = makeStyles<Theme, >
// interface IGroupList {
//   groups: IUserGroup[];
//   setSelectedUserGroup?: Dispatch<SetStateAction<number>>;
//   selectedUserGroup: number;
// };

// const GroupList = (props: IGroupList) => {
//   const { groups, setSelectedUserGroup } = props;

//   const onClick = (id:number) => (e: any) => {
//     setSelectedUserGroup && setSelectedUserGroup(id);
//   };

//   return <List>
//     {groups.map(group =>
//       <ListItem
//         key={group.ID}
//         button
//         divider
//         sx={{
//           py: 2,
//           backgroundColor: 'red'
//         }}
//         onClick={onClick(group.ID)}
//       >
//         <ListItemText>
//           <Typography variant="body1">{group.NAME}</Typography>
//           <Typography variant="caption">{group.DESCRIPTION}</Typography>
//         </ListItemText>

//       </ListItem>)}
//   </List>;
// };

const ItemGroupSkeleton = () => {
  return (
    <Stack spacing={1} p={2}>
      <Skeleton variant="text" height={50} width="40%" />
      <Skeleton variant="text" height={10} width="100%" />
      <Skeleton variant="text" height={10} width="60%" />
    </Stack>
  );
};

/* eslint-disable-next-line */
export interface UserGroupsProps {}

export function UserGroups(props: UserGroupsProps) {
  const { data: userGroups, isLoading: userGroupsLoading, isFetching: userGroupFetching } = useGetUserGroupsQuery();

  const [searchName, setSearchName] = useState('');
  const [selectedUserGroup, setSelectedUserGroup] = useState(-1);

  const filterHandlers = {
    handleRequestSearch: async (value: string) => {
      setSearchName(value);
    },
    handleCancelSearch: async () => {
      setSearchName('');
    },
  };

  return (
    <CustomizedCard
      borders
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader title={<Typography variant="h3">Группы пользователей</Typography>} />
      <Divider />
      <CardContent
        style={{
          flex: 1,
          display: 'flex',
          padding: 0,
        }}
      >
        <Stack direction="row" flex={1}>
          <Stack flex={0.3} p={2} spacing={2}>
            <Stack direction="row">
              <Box flex={1} />
              <Button
                variant="contained"
                disabled={userGroupFetching}
                startIcon={<AddIcon fontSize="large" />}
                // </Stack>onClick={() => setOpenEditForm(true)}
              >
                Группа
              </Button>
            </Stack>
            <SearchBar
              disabled={userGroupFetching}
              onCancelSearch={filterHandlers.handleCancelSearch}
              // onRequestSearch={filterHandlers.handleRequestSearch}
              onChange={filterHandlers.handleRequestSearch}
              cancelOnEscape
              fullWidth
              placeholder="Поиск группы"
            />
            <PerfectScrollbar
              style={{
                maxHeight: 'calc(100vh - 355px)',
                marginRight: -15,
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
                  selectedUserGroup={selectedUserGroup}
                />}
            </PerfectScrollbar>
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack flex={1} p={2} spacing={2}>
            <Stack direction="row">
              <Box flex={1} />
              <Button
                variant="contained"
                disabled={userGroupFetching}
                startIcon={<AddIcon fontSize="large" />}
                // </Stack>onClick={() => setOpenEditForm(true)}
              >
                Добавить
              </Button>
            </Stack>
            <Users groupID={selectedUserGroup}/>
          </Stack>
        </Stack>
      </CardContent>
    </CustomizedCard>
  );
}

export default UserGroups;
