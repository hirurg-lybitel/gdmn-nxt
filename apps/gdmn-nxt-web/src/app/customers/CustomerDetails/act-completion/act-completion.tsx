import { Button, Stack } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import { DataGridPro, GridColDef, ruRU } from '@mui/x-data-grid-pro';
import CustomizedCard from '../../../components/customized-card/customized-card';
import { useGetActCompletionQuery } from '../../../features/act-completion/actCompletionApi';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState } from 'react';
import CustomNoRowsOverlay from '../../DataGridProOverlay/CustomNoRowsOverlay';

const useStyles = makeStyles(() => ({
  dataGrid: {
    border: 'none',
    '& ::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
      backgroundColor: 'transparent',
      borderRadius: '6px'
    },
    '& ::-webkit-scrollbar:hover': {
      backgroundColor: '#f0f0f0',
    },
    '& ::-webkit-scrollbar-thumb': {
      position: 'absolute',
      right: 10,
      borderRadius: '6px',
      backgroundColor: 'rgba(170, 170, 170, 0.5)',
    },
    '& ::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#999',
    },
  },
}));

export interface ActCompletionProps {
  customerId?: number;
};

export function ActCompletion(props: ActCompletionProps) {
  const { customerId } = props;

  const classes = useStyles();
  const { data: actCompletion, refetch, isFetching: actCompletionIsFetching } = useGetActCompletionQuery(customerId);

  const columns: GridColDef[] = [
    { field: 'NUMBER', headerName: 'Номер', flex: 1, minWidth: 100 },
    { field: 'DOCUMENTDATE', headerName: 'Дата', flex: 1, minWidth: 100,
      renderCell: ({ value }) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DEPT_NAME', headerName: 'Отдел', flex: 1, minWidth: 100 },
    { field: 'JOB_NUMBER', headerName: 'Заказ', flex: 1, minWidth: 100 },
    { field: 'USR$SUMNCU', headerName: 'Сумма', flex: 1, minWidth: 100,
      renderCell: ({ value }) => (Math.round(value * 100) / 100).toFixed(2) },
  ];

  return (
    <Stack
      direction="column"
      flex="1"
      display="flex"
      spacing={1}
    >
      <Box>
        <Button
          onClick={refetch}
          disabled={actCompletionIsFetching}
          startIcon={<RefreshIcon/>}
        >Обновить</Button>
      </Box>
      <CustomizedCard
        borders
        style={{
          flex: 1,
        }}
      >
        <DataGridPro
          className={classes.dataGrid}
          localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
          rows={actCompletion || []}
          getRowId={row => row.ID}
          columns={columns}
          loading={actCompletionIsFetching}
          pagination
          rowsPerPageOptions={[20]}
          pageSize={20}
          components={{
            NoRowsOverlay: CustomNoRowsOverlay
          }}
        />
      </CustomizedCard>
    </Stack>
  );
}

export default ActCompletion;
