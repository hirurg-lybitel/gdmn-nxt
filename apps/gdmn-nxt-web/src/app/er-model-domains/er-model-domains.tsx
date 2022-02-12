import Alert from '@mui/material/Alert/Alert';
import Button from '@mui/material/Button/Button';
import Snackbar from '@mui/material/Snackbar/Snackbar';
import Stack from '@mui/material/Stack/Stack';
import { DataGridPro, GridColDef, GridRowParams, GridToolbar, GridValueGetterParams } from '@mui/x-data-grid-pro';
import { useMemo } from 'react';
import { useGetErModelQuery } from '../features/er-model/erModelApi';
import RefreshIcon from '@mui/icons-material/Refresh';
import './er-model-domains.module.less';
import { Domain } from '@gsbelarus/util-api-types';

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

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Наименование', 
      width: 350 
    },
    { 
      field: 'type', 
      headerName: 'Тип', 
      width: 250,
      valueGetter: params => data?.domains[params.row.name].type
    }
  ];
  
  return (
    <Stack direction="column">
      <Stack direction="row">
        <Button onClick={ refetch } disabled={isFetching} startIcon={<RefreshIcon/>}>Обновить</Button>
      </Stack>
      <div style={{ width: '100%', height: '800px' }}>
        <DataGridPro
          rows={rows}
          columns={columns}
          pagination
          disableMultipleSelection
          loading={isFetching}
          getRowId={row => row.name}
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </div>
      {
        errorMessage &&
        <Snackbar open autoHideDuration={5000}>
          <Alert variant="filled" severity="error">{errorMessage}</Alert>
        </Snackbar>
      }
    </Stack>
  );
}

export default ErModelDomains;
