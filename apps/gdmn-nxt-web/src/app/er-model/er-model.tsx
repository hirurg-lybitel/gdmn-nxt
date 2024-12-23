import { CircularIndeterminate } from '@gdmn-nxt/helpers/circular-indeterminate/circular-indeterminate';
import { useGetErModelQuery } from '../features/er-model/erModelApi';
import './er-model.module.less';
import { createElement, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid/Grid';
import { GridColDef, GridRowId } from '@mui/x-data-grid-pro';
import { gridComponents, StyledDataGrid } from '../components/Styled/styled-data-grid/styled-data-grid';
import createSvgIcon from '@mui/material/utils/createSvgIcon';
import { StyledTreeItem, StyledTreeView } from '../components/Styled/styled-tree-view/styled-tree-view';
import { useViewForms } from '../features/view-forms-slice/viewFormsHook';
import { MainToolbar } from '../main-toolbar/main-toolbar';

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

  useEffect(() => {
    if (selectionModel.length) {
      setSelectionModel([]);
    }
  }, [selectedEntity]);

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
    {
      field: 'required',
      headerName: 'Req',
      width: 50,
      valueGetter: ({ row }) => typeof row.required === 'boolean'
        ? (row.required ? '☑' : '')
        : (data?.domains[row.domain]?.required ? '☑' : '')
    },
  ];

  const recurse = (parent?: string) => data && Object.values(data.entities)
    .filter(e => e.parent === parent)
    .map(
      e =>
        <StyledTreeItem
          key={e.name}
          nodeId={e.name}
          label={`${e.name}${e.lName ? ' - ' + e.lName : ''}`}
        >
          {recurse(e.name)}
        </StyledTreeItem>
    );

  const treeItems = useMemo(recurse, [data]);

  return (
    isFetching ?
      <CircularIndeterminate open={true} />
      :
      <>
        <MainToolbar />
        <Grid
          container
          height="calc(100% - 80px)"
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
              onNodeSelect={(_evt: any, ids: any) => {
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
              onRowSelectionModelChange={setSelectionModel}
              rowSelectionModel={selectionModel}
              rowHeight={24}
              columnHeaderHeight={24}
              editMode="row"
              components={gridComponents}
            />
          </Grid>
        </Grid>
      </>
  );
};
