import Alert from '@mui/material/Alert/Alert';
import Snackbar from '@mui/material/Snackbar/Snackbar';
import { GridColDef, GridRowId } from '@mui/x-data-grid-pro';
import { useMemo, useState } from 'react';
import { useGetErModelQuery } from '../features/er-model/erModelApi';
import './er-model-domains.module.less';
import Grid from '@mui/material/Grid/Grid';
import { gridComponents, StyledDataGrid } from '../components/styled-data-grid/styled-data-grid';
import { useViewForms } from '../features/view-forms-slice/viewFormsHook';
import { MainToolbar } from '../main-toolbar/main-toolbar';

/* eslint-disable-next-line */
export interface ErModelDomainsProps {}

export function ErModelDomains(props: ErModelDomainsProps) {
  useViewForms('Domains');
  const { data, isFetching, refetch, error } = useGetErModelQuery();
  const errorMessage = !error ?
    undefined
    : 'message' in error ? error.message
    : 'error' in error ? error.error
    : 'unknown error';
  const rows = useMemo( () => data ? Object.values(data.domains) : [], [data]);
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

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
      field: 'type',
      headerName: 'Тип',
      width: 80,
    },
    {
      field: 'required',
      headerName: 'Req',
      width: 50,
      valueGetter: ({ row }) => row.required ? '☑' : ''
    },
    {
      field: '',
      headerName: 'Параметры',
      flex: 1,
      valueGetter: ({ row }) => {
        const s: string[] = [];

        switch (row.type) {
          case 'ENTITY':
          case 'ENTITY[]':
            s.push(`Entity: ${row.entityName}`);
            break;

          case 'STRING':
            s.push(`len: ${row.maxLen}${typeof row.default === 'string' ? ', default: "' + row.default + '"' : ''}`);
            break;

          case 'INTEGER':
          case 'DOUBLE':
            s.push(`min: ${row.min}, max: ${row.max}`);
            break;

          case 'NUMERIC':
            s.push(`precision: ${row.precision}, scale: ${-row.scale}, min: ${row.min}, max: ${row.max}`);
            break;

          case 'ENUM':
            s.push(`${row.numeration}`);
            break;
        }

        row.validationSource && s.push('validation: ' + row.validationSource);

        if (row.default !== undefined) {
          if (typeof row.default === 'string') {
            s.push(`default: "${row.default}"`);
          } else {
            s.push('default: ' + row.default);
          }
        }
        return s.join(', ');
      }
    }
  ];

  return (
    <>
      <MainToolbar />
      <Grid container height="calc(100% - 80px)" columnSpacing={2}>
        <Grid item xs={12}>
          <StyledDataGrid
            rows={rows}
            columns={columns}
            pagination
            loading={isFetching}
            getRowId={row => row.name}
            onSelectionModelChange={setSelectionModel}
            selectionModel={selectionModel}
            rowHeight={24}
            headerHeight={24}
            editMode='row'
            components={gridComponents}
          />
        </Grid>
        {
          errorMessage &&
          <Grid item xs={12}>
            <Snackbar open autoHideDuration={5000}>
              <Alert variant="filled" severity="error">{errorMessage}</Alert>
            </Snackbar>
          </Grid>
        }
      </Grid>
    </>
  );
};
