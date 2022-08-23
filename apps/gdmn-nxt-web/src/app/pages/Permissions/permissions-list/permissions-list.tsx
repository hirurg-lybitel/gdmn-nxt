import { IPermissionsAction, IPermissionsView, IUserGroup } from '@gsbelarus/util-api-types';
import { Button, CardContent, CardHeader, Checkbox, Divider, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import { GridInitialStatePro } from '@mui/x-data-grid-pro/models/gridStatePro';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';
import { useGetActionsQuery, useGetMatrixQuery, useGetUserGroupsQuery, useUpdateMatrixMutation } from '../../../features/permissions';
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

const initialStateDataGrid: GridInitialStatePro = {
  pinnedColumns: { left: ['NAME'] }
};

export function PermissionsList(props: PermissionsListProps) {
  const { data: actions, isFetching: actionsFetching } = useGetActionsQuery();
  const { data: userGroups, isFetching: userGroupsFetching } = useGetUserGroupsQuery();
  const { data: matrix, isFetching: matrixFetching } = useGetMatrixQuery();
  const [updateMatrix] = useUpdateMatrixMutation();

  const CheckBoxOnChange = (matrixID: number | undefined, action: IPermissionsAction, userGroup: IUserGroup) => (e: any, checked: boolean) => {
    // console.log('onChange', e, checked, action, userGroup);
    updateMatrix({
      ID: matrixID,
      ACTION: action,
      USERGROUP: userGroup,
      MODE: +checked
    });
  };

  const columns: GridColDef[] = userGroups?.map(ug => ({
    field: 'USERGROUP_' + ug.ID,
    headerName: ug.NAME,
    flex: 1,
    sortable: false,
    editable: false,
    type: 'boolean',
    minWidth: 150,
    renderCell: (params: any) => {
      const actionID = params.id;
      const matrixNode = matrix?.filter(c => c.ACTION.ID === actionID).find(f => f.USERGROUP.ID === ug.ID);
      const checked = matrixNode?.MODE === 1 || false;

      return <Checkbox
        checked={checked}
        onChange={CheckBoxOnChange(matrixNode?.ID, params.row, ug)}
      />;
    },
    renderHeader: (params) => {
      return (
        <div
          className={`MuiDataGrid-columnHeaderTitle css-1jbbcbn-MuiDataGrid-columnHeaderTitle ${styles['columnHeader']}`}
          onClick={() => console.log('onClick')}
        >
          {params.colDef.headerName}
        </div>
      );
    },
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
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader title={<Typography variant="h3">Права групп пользователей</Typography>} />
      {/* <Divider /> */}
      <CardContent
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0
        }}
      >
        <Stack flex={1}>
          <Box style={{ height: '40px' }} />
          <StyledGrid
            columns={columns}
            rows={actions || []}
            loading={actionsFetching || userGroupsFetching || matrixFetching}
            getRowId={row => row.ID}
            hideFooter
            // disableColumnResize
            disableColumnReorder
            disableColumnMenu
            initialState={initialStateDataGrid}
          />
        </Stack>
      </CardContent>

    </CustomizedCard>

  );
}

export default PermissionsList;
