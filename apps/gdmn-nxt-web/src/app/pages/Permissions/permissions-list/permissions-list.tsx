import { IPermissionsAction, IUserGroup } from '@gsbelarus/util-api-types';
import { Box, Button, CardContent, CardHeader, Checkbox, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DataGridProProps, GRID_TREE_DATA_GROUPING_FIELD, GridColDef, GridGroupNode, GridRenderCellParams, GridRowId } from '@mui/x-data-grid-pro';
import { GridInitialStatePro } from '@mui/x-data-grid-pro/models/gridStatePro';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';
import { useGetActionsQuery, useGetMatrixQuery, useGetUserGroupsQuery, useUpdateMatrixMutation } from '../../../features/permissions';
import styles from './permissions-list.module.less';
import { useCallback, useMemo, useState } from 'react';
import { CustomGridTreeDataGroupingCell } from './custom-grid-tree-data-grouping-cell';
import LogoutIcon from '@mui/icons-material/Logout';
import { logoutUser } from '../../../features/user/userSlice';
import { AppDispatch } from '@gdmn-nxt/store';
import { useDispatch } from 'react-redux';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';

/* eslint-disable-next-line */
export interface PermissionsListProps {}

const initialStateDataGrid: GridInitialStatePro = {
  pinnedColumns: { left: [GRID_TREE_DATA_GROUPING_FIELD] }
};

const GridItem = ({ id, row, ug, callback }: { id: GridRowId, row: IPermissionsAction, ug: IUserGroup, callback: () => void }) => {
  const { data: matrix, isFetching: matrixFetching, isLoading: matrixLoading } = useGetMatrixQuery();
  const [updateMatrix] = useUpdateMatrixMutation();

  const CheckBoxOnChange = (matrixID: number | undefined, action: IPermissionsAction, userGroup: IUserGroup) => (e: any, checked: boolean) => {
    callback();
    updateMatrix({
      ID: matrixID,
      ACTION: action,
      USERGROUP: userGroup,
      MODE: +checked
    });
  };
  if (Object.keys(row).length === 0) return <></>;
  const actionID = id;
  const matrixNode = matrix?.filter(c => c.ACTION.ID === actionID).find(f => f.USERGROUP.ID === ug.ID);
  const checked = matrixNode?.MODE === 1 || false;

  return <Checkbox
    disabled={matrixFetching || matrixLoading}
    checked={checked}
    onChange={CheckBoxOnChange(matrixNode?.ID, row, ug)}
  />;
};

export function PermissionsList(props: PermissionsListProps) {
  const { data: actions, isFetching: actionsFetching, isLoading: actionsLoading } = useGetActionsQuery();
  const { data: userGroups, isFetching: userGroupsFetching, isLoading: userGroupsLoading } = useGetUserGroupsQuery();

  const columns: GridColDef<IPermissionsAction>[] = userGroups?.map(ug => ({
    field: 'USERGROUP_' + ug.ID,
    headerName: ug.NAME,
    flex: 1,
    sortable: false,
    editable: false,
    type: 'boolean',
    minWidth: 150,
    renderCell: ({ row, id }) => {
      return (
        <GridItem
          id={id}
          row={row}
          ug={ug}
          callback={() => {
            setChanged(true);
          }}
        />
      );
    },
  })) || [];

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

  const groupingColDef: DataGridProProps<IPermissionsAction>['groupingColDef'] = {
    headerName: 'Действие',
    width: 300,
    minWidth: 300,
    flex: 1,
    renderCell: (params) => <CustomGridTreeDataGroupingCell {...params as GridRenderCellParams<IPermissionsAction, any, any, GridGroupNode>} />,
  };

  const [changed, setChanged] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const logout = () => {
    dispatch(logoutUser());
  };
  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const memoGridCallback = useCallback((mobile: boolean) => (
    <StyledGrid
      treeData
      getTreeDataPath={getTreeDataPath}
      groupingColDef={groupingColDef}
      columns={columns}
      rows={rows || []}
      loading={actionsLoading || userGroupsLoading}
      getRowId={row => row.ID}
      hideFooter
      disableColumnReorder
      disableColumnMenu
      initialState={mobile ? undefined : initialStateDataGrid}
      sortModel={[
        { field: GRID_TREE_DATA_GROUPING_FIELD, sort: 'asc' }
      ]}
      disableChildrenSorting
    />
  ), [rows]);

  return (
    <CustomizedCard
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
      className={styles.permissionsList}
    >
      <CustomCardHeader title={'Права групп пользователей'} />
      <CardContent
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0
        }}
      >
        <Stack flex={1}>
          <Box style={{ minHeight: '40px', display: 'flex', justifyContent: 'flex-end', padding: '0px 24px', alignItems: 'center', gap: '15px' }}>
            {changed && (
              <>
                <Typography>
                Изменения вступят в силу после переавторизации
                </Typography>
                <div >
                  <Button
                    style={{ gap: '10px' }}
                    color="primary"
                    variant="contained"
                    onClick={logout}
                  ><span>Выйти</span><LogoutIcon/></Button>
                </div>
              </>
            )}
          </Box>
          {memoGridCallback(matchDownSm)}
        </Stack>
      </CardContent>
    </CustomizedCard>
  );
}

export default PermissionsList;
