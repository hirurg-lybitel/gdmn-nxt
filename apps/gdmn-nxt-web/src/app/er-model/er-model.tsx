import { CircularIndeterminate } from '../components/circular-indeterminate/circular-indeterminate';
import { useGetErModelQuery } from '../features/er-model/erModelApi';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import './er-model.module.less';
import { createElement, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid/Grid';
import { GridColDef, GridRowId } from '@mui/x-data-grid-pro';
import { StyledDataGrid } from '../components/styled-data-grid/styled-data-grid';
import createSvgIcon from '@mui/material/utils/createSvgIcon';
import { StyledTreeItem, StyledTreeView } from '../components/styled-tree-view/styled-tree-view';
import { useViewForms } from '../features/view-forms-slice/viewFormsHook';

/* eslint-disable-next-line */
export interface ErModelProps {};

export function ErModel(props: ErModelProps) {
  useViewForms('Entities');
  const { data, isFetching } = useGetErModelQuery();
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const rows = useMemo(
    () => data?.entities[selectedEntity]?.attributes ?? [],
  [data, selectedEntity]);

  useEffect( () => {
    if (selectionModel.length) {
      setSelectionModel([]);
    }
  }, [selectedEntity])

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Наименование',
      width: 200
    },
    {
      field: 'lName',
      headerName: 'Лок. наименование',
      width: 250
    },
    {
      field: 'domain',
      headerName: 'Домен',
      width: 250
    },
  ];

  const recurse = (parent?: string) => data && Object.values(data.entities)
    .filter( e => e.parent === parent )
    .map(
      e =>
        <StyledTreeItem key={e.name} nodeId={e.name} label={e.name}>
          {recurse(e.name)}
        </StyledTreeItem>
    );

  const treeItems = useMemo(recurse, [data]);

  return (
    isFetching ?
      <CircularIndeterminate open={true} />
    :
      <Grid
        container
        height="100%"
        direction="row"
        alignItems="stretch"
        columnSpacing={0}
      >
        <Grid
          item
          xs={3}
          sx={{
            overflowY: 'auto',
            maxHeight: '100%',
          }}
      >
          <StyledTreeView
            aria-label="er-model"
            defaultExpanded={['TgdcBase']}
            defaultCollapseIcon={'🞃'}
            defaultExpandIcon={'🞂'}
            defaultEndIcon={<div style={{ width: 14 }} />}
            onNodeSelect={ (_evt: any, ids: any) => {
              if (ids) {
                setSelectedEntity(ids);
              }
            }}
          >
            {treeItems}
          </StyledTreeView>
        </Grid>
        <Grid item xs={9}>
          <StyledDataGrid
            rows={rows}
            columns={columns}
            loading={isFetching}
            getRowId={row => row.name}
            onSelectionModelChange={setSelectionModel}
            selectionModel={selectionModel}
            rowHeight={24}
            headerHeight={24}
            editMode='row'
            components={{
              ColumnResizeIcon: createSvgIcon(createElement("path",{d:"M11 24V0h2v24z"}),"Separator2")
            }}
          />
        </Grid>
      </Grid>
  );
};

export default ErModel;
