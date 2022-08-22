import { IPermissionsAction, IPermissionsView, IUserGroup } from '@gsbelarus/util-api-types';
import { Checkbox, Stack } from '@mui/material';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import CustomizedCard from '../../../components/customized-card/customized-card';
import { useGetActionsQuery, useGetMatrixQuery, useGetUserGroupsQuery } from '../../../features/permissions';
import styles from './permissions-list.module.less';

/* eslint-disable-next-line */
export interface PermissionsListProps {}

// const mActions: IPermissionsAction[] = [
//   {
//     ID: 1,
//     ISACTIVE: true,
//     NAME: 'Action 1'
//   },
//   {
//     ID: 2,
//     ISACTIVE: true,
//     NAME: 'Action 2'
//   },
//   {
//     ID: 3,
//     ISACTIVE: false,
//     NAME: 'Action 3'
//   }
// ];

// const mUserGroups: IUserGroup[] = [
//   {
//     ID: 1,
//     NAME: 'Group 1'
//   },
//   {
//     ID: 2,
//     NAME: 'Group 2'
//   },
//   {
//     ID: 3,
//     NAME: 'Group long name 3'
//   }
// ];

// const mCross: IPermissionsView[] = [
//   {
//     ID: 1,
//     ACTION: mActions[0],
//     USERGROUP: mUserGroups[1],
//     MODE: 1
//   },
//   {
//     ID: 2,
//     ACTION: mActions[2],
//     USERGROUP: mUserGroups[0],
//     MODE: 1
//   }
// ];

export function PermissionsList(props: PermissionsListProps) {
  const { data: actions, isFetching: actionsFetching } = useGetActionsQuery();
  const { data: userGroups, isFetching: userGroupsFetching } = useGetUserGroupsQuery();
  const { data: matrix, isFetching: matrixFetching } = useGetMatrixQuery();

  const columns: GridColDef[] = userGroups?.map(ug => ({
    field: 'USERGROUP_' + ug.ID,
    headerName: ug.NAME,
    renderCell: (params) => {
      return <Checkbox checked={matrix?.filter(c => c.ACTION.ID === params.id).find(f => f.USERGROUP.ID === ug.ID)?.MODE === 1 || false} />;
    },
    flex: 1,
    // align: 'center',

  })) || [];

  columns.unshift({
    field: 'NAME',
    headerName: 'Действие',
    minWidth: 200
  });

  return (
    <CustomizedCard
      borders
      style={{
        flex: 1,
      }}
    >
      <DataGridPro
        sx={{
          border: 'none',
          padding: 5,
        }}
        columns={columns}
        rows={actions || []}
        getRowId={row => row.ID}
        hideFooter
        disableColumnResize
        disableColumnReorder
        disableColumnMenu
      />
    </CustomizedCard>

  );
}

export default PermissionsList;
