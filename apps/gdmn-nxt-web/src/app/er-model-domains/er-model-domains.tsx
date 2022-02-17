import Alert from '@mui/material/Alert/Alert';
import Snackbar from '@mui/material/Snackbar/Snackbar';
import { GridColDef, GridRowId } from '@mui/x-data-grid-pro';
import { useMemo, useState } from 'react';
import { useGetErModelQuery } from '../features/er-model/erModelApi';
import './er-model-domains.module.less';
import Grid from '@mui/material/Grid/Grid';
import { CustomPagination, StyledDataGrid } from '../components/styled-data-grid/styled-data-grid';

/* eslint-disable-next-line */
export interface ErModelDomainsProps {}

export function ErModelDomains(props: ErModelDomainsProps) {

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
      width: 250
    },
    { 
      field: 'lName', 
      headerName: 'Лок. наименование', 
      width: 250
    },
    { 
      field: 'type', 
      headerName: 'Тип', 
      width: 100,
      valueGetter: params => data?.domains[params.row.name].type
    },
    { 
      field: 'entityName', 
      headerName: 'Сущность', 
      width: 200
    }
  ];
  
  return (
    <Grid container height="100%" columnSpacing={2}>
      <Grid item xs={9}>
        <StyledDataGrid
          rows={rows}
          columns={columns}
          pagination
          disableMultipleSelection
          loading={isFetching}
          getRowId={row => row.name}
          onSelectionModelChange={setSelectionModel}
          selectionModel={selectionModel} 
          rowHeight={24}         
          components={{
            Pagination: CustomPagination
          }}
        />
      </Grid>
      <Grid item xs={3}>
        {
          data && selectionModel.length ?
            <pre>
              {
                JSON.stringify(data.domains[selectionModel[0]], undefined, 2)
              }
            </pre>
          :
            undefined  
        }
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
  );
}

export default ErModelDomains;
