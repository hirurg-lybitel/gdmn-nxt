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
      field: 'readonly', 
      headerName: 'R/o', 
      width: 50,
      valueGetter: ({ row }) => row.readonly ? '☑' : ''      
    },
    { 
      field: '', 
      headerName: 'Параметры', 
      flex: 1,
      valueGetter: ({ row }) => {
        let s: string = '';

        switch (row.type) {
          case 'ENTITY':
          case 'ENTITY[]':
            s = `${row.entityName}`;
            break;

          case 'STRING':
            s = `len: ${row.maxLen}${typeof row.default === 'string' ? ', default: "' + row.default + '"' : ''}`;
            break;

          case 'INTEGER':
            case 'DOUBLE':    
            s = `min: ${row.min}, max: ${row.max}`;
            break;
            
          case 'NUMERIC':
            s = `scale: ${row.scale}, precision: ${row.precision}, min: ${row.min}, max: ${row.max}`;
            break;
        }

        return s + (row.validationSource ? ', validation: ' + row.validationSource : '');
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
            //ColumnResizeIcon: () => <span>&nbsp;</span>
            // ColumnResizeIcon: () => 
            //   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 3">
            //     <path d="M11 19V5h2v14z"></path>
            //   </svg>
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
