import Alert from '@mui/material/Alert/Alert';
import Button from '@mui/material/Button/Button';
import Snackbar from '@mui/material/Snackbar/Snackbar';
import { DataGridPro, GridColDef, GridRowId, GridToolbar } from '@mui/x-data-grid-pro';
import { useMemo, useState } from 'react';
import { useGetErModelQuery } from '../features/er-model/erModelApi';
import RefreshIcon from '@mui/icons-material/Refresh';
import './er-model-domains.module.less';
import Grid from '@mui/material/Grid/Grid';

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
      width: 300 
    },
    { 
      field: 'type', 
      headerName: 'Тип', 
      width: 150,
      valueGetter: params => data?.domains[params.row.name].type
    }
  ];
  
  return (
    <div style={{ minHeight: 800, width: '100%' }}>
      <Grid container columnSpacing={2}>
        <Grid item xs={12}>
          <Button onClick={ refetch } disabled={isFetching} startIcon={<RefreshIcon/>}>Обновить</Button>
        </Grid>
        <Grid item xs={9}>
          <DataGridPro
            autoHeight
            rows={rows}
            columns={columns}
            pagination
            disableMultipleSelection
            loading={isFetching}
            getRowId={row => row.name}
            onSelectionModelChange={setSelectionModel}
            selectionModel={selectionModel}          
            components={{
              Toolbar: GridToolbar,
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
    </div>
  );
}

export default ErModelDomains;
