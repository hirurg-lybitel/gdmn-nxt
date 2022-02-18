import Alert from '@mui/material/Alert/Alert';
import Snackbar from '@mui/material/Snackbar/Snackbar';
import { GridColDef, GridRowId, GridSeparatorIcon } from '@mui/x-data-grid-pro';
import { createElement, useMemo, useState } from 'react';
import { useGetErModelQuery } from '../features/er-model/erModelApi';
import './er-model-domains.module.less';
import Grid from '@mui/material/Grid/Grid';
import { CustomPagination, StyledDataGrid } from '../components/styled-data-grid/styled-data-grid';
import createSvgIcon from '@mui/material/utils/createSvgIcon';

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
      width: 100,
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
          headerHeight={24}       
          components={{
            Pagination: CustomPagination,      
            ColumnResizeIcon: createSvgIcon(createElement("path",{d:"M11 24V0h2v24z"}),"Separator2")
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
