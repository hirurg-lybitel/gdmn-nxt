import { Box, Button, Stack } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid-pro';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetBankStatementQuery } from '../../../features/bank-statement/bankStatementApi';
import RefreshIcon from '@mui/icons-material/Refresh';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';

export interface BankStatementProps {
  companyId?: number;
};

export function BankStatement(props: BankStatementProps) {
  const { companyId } = props;
  const { data: bankStatement, refetch, isFetching: bankStatementIsFetching } = useGetBankStatementQuery(companyId);

  const columns: GridColDef[] = [
    { field: 'NUMBER', headerName: 'Номер', width: 100 },
    { field: 'DOCUMENTDATE', headerName: 'Дата', width: 100, type: 'date',
      renderCell: ({ value }) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DEPT_NAME', headerName: 'Отдел', width: 100 },
    { field: 'JOB_NUMBER', headerName: 'Заказ', width: 100 },
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
        <StyledGrid
          rows={bankStatement || []}
          columns={columns}
          loading={bankStatementIsFetching}
          loadingMode="circular"
          pagination
          pageSizeOptions={[20]}
          paginationModel={{ page: 0, pageSize: 20 }}
          rowHeight={100}
        />
      </CustomizedCard>
    </Stack>
  );
};

export default BankStatement;
