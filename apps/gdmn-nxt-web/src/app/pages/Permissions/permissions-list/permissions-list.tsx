import { IPermissionsAction, IUserGroup } from '@gsbelarus/util-api-types';
import { Box, CardContent, CardHeader, Checkbox, Stack, Typography } from '@mui/material';
import { DataGridProProps, GRID_TREE_DATA_GROUPING_FIELD, GridColDef, GridRenderCellParams, GridSortModel, GridTreeNodeWithRender } from '@mui/x-data-grid-pro';
import { GridInitialStatePro } from '@mui/x-data-grid-pro/models/gridStatePro';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';
import { useGetActionsQuery, useGetMatrixQuery, useGetUserGroupsQuery, useUpdateMatrixMutation } from '../../../features/permissions';
import styles from './permissions-list.module.less';
import { useMemo, useState } from 'react';
import { CustomGridTreeDataGroupingCell } from './custom-grid-tree-data-grouping-cell';

/* eslint-disable-next-line */
export interface PermissionsListProps {}

const initialStateDataGrid: GridInitialStatePro = {
  pinnedColumns: { left: [GRID_TREE_DATA_GROUPING_FIELD] }
};

export function PermissionsList(props: PermissionsListProps) {
  const { data: actions, isFetching: actionsFetching, isLoading: actionsLoading } = useGetActionsQuery();
  const { data: userGroups, isFetching: userGroupsFetching, isLoading: userGroupsLoading } = useGetUserGroupsQuery();
  const { data: matrix, isFetching: matrixFetching, isLoading: matrixLoading } = useGetMatrixQuery();
  const [updateMatrix] = useUpdateMatrixMutation();

  const CheckBoxOnChange = (matrixID: number | undefined, action: IPermissionsAction, userGroup: IUserGroup) => (e: any, checked: boolean) => {
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
    renderCell: ({ row, id }: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
      if (Object.keys(row).length === 0) return <></>;
      const actionID = id;
      const matrixNode = matrix?.filter(c => c.ACTION.ID === actionID).find(f => f.USERGROUP.ID === ug.ID);
      const checked = matrixNode?.MODE === 1 || false;

      return <Checkbox
        disabled={matrixFetching}
        checked={checked}
        onChange={CheckBoxOnChange(matrixNode?.ID, row, ug)}
      />;
    },
  })) || [];

  // columns.unshift({
  //   field: 'NAME',
  //   headerName: 'Действие',
  //   minWidth: 300,
  //   headerAlign: 'center'
  // });

  const rows = useMemo(() => actions?.map(action => {
    const hierarchy = (() => {
      const names = action.NAME.split('/');
      if (names.length === 1) {
        return names;
      };
      return [names[0].trim(), action.NAME];
    })();
    return { ...action, hierarchy };
  }), [actions]);

  const getTreeDataPath: DataGridProProps['getTreeDataPath'] = (row) => {
    return row?.hierarchy || [];
  };

  const groupingColDef: DataGridProProps['groupingColDef'] = {
    headerName: 'Действие',
    width: 300,
    minWidth: 250,
    flex: 1,
    renderCell: (params) => <CustomGridTreeDataGroupingCell {...params} />,
  };

  return (
    <CustomizedCard
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader title={<Typography variant="pageHeader">Права групп пользователей</Typography>} />
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
            treeData
            getTreeDataPath={getTreeDataPath}
            groupingColDef={groupingColDef}
            columns={columns}
            rows={rows || []}
            loading={actionsLoading || userGroupsLoading || matrixLoading}
            getRowId={row => row.ID}
            hideFooter
            disableColumnReorder
            disableColumnMenu
            initialState={initialStateDataGrid}
            sortModel={[
              { field: GRID_TREE_DATA_GROUPING_FIELD, sort: 'asc' }
            ]}
            disableChildrenSorting
          />
        </Stack>
      </CardContent>
    </CustomizedCard>
  );
}

export default PermissionsList;
