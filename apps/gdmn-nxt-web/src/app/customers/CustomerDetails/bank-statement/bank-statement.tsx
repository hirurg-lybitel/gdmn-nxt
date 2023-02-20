import { Box, Button, Stack } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DataGridPro, GridColDef, ruRU } from '@mui/x-data-grid-pro';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetBankStatementQuery } from '../../../features/bank-statement/bankStatementApi';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState } from 'react';
import CustomNoRowsOverlay from '../../../components/Styled/styled-grid/DataGridProOverlay/CustomNoRowsOverlay';

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

export interface BankStatementProps {
  companyId?: number;
};

export function BankStatement(props: BankStatementProps) {
  const { companyId } = props;
  const classes = useStyles();
  const { data: bankStatement, refetch, isFetching: bankStatementIsFetching } = useGetBankStatementQuery(companyId);

  const columns: GridColDef[] = [
    { field: 'NUMBER', headerName: 'Номер', width: 100 },
    { field: 'DOCUMENTDATE', headerName: 'Дата', width: 100, type: 'date',
      renderCell: ({ value }) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DEPT_NAME', headerName: 'Отдел', width: 70 },
    { field: 'JOB_NUMBER', headerName: 'Заказ', width: 70 },
    { field: 'CSUMNCU', headerName: 'Сумма', minWidth: 100, align: 'right',
      renderCell: ({ value }) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    { field: 'COMMENT', headerName: 'Комментарии', flex: 1, minWidth: 300,
      renderCell: ({ value }) => <Box style={{ width: '100%', whiteSpace: 'initial' }}>{value}</Box>
    }
  ];

  return (
    <Stack
      direction="column"
      flex="1"
      display="flex"
      spacing={1}
      p={3}
    >
      {/* <Box>
        <Button
          onClick={refetch}
          disabled={bankStatementIsFetching}
          startIcon={<RefreshIcon/>}
        >Обновить</Button>
      </Box> */}
      <CustomizedCard
        borders
        style={{
          flex: 1,
        }}
      >
        <DataGridPro
          className={classes.dataGrid}
          localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
          rows={bankStatement || []}
          getRowId={row => row.ID}
          columns={columns}
          loading={bankStatementIsFetching}
          pagination
          rowsPerPageOptions={[20]}
          pageSize={20}
          components={{
            NoRowsOverlay: CustomNoRowsOverlay
          }}
          rowHeight={100}
        />
      </CustomizedCard>
    </Stack>
  );
};

export default BankStatement;
