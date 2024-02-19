import { Box, Button, Stack } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid-pro';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetActCompletionQuery } from '../../../features/act-completion/actCompletionApi';
import RefreshIcon from '@mui/icons-material/Refresh';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';

export interface ActCompletionProps {
  customerId?: number;
};

export function ActCompletion(props: ActCompletionProps) {
  const { customerId } = props;

  const { data: actCompletion, refetch, isFetching: actCompletionIsFetching } = useGetActCompletionQuery(customerId);

  const columns: GridColDef[] = [
    { field: 'NUMBER', headerName: 'Номер', minWidth: 150 },
    { field: 'DOCUMENTDATE', headerName: 'Дата', width: 100,
      type: 'date',
      renderCell: ({ value }) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    },
    { field: 'DEPT_NAME', headerName: 'Отдел', width: 100 },
    { field: 'JOB_NUMBER', headerName: 'Заказ', width: 100 },
    { field: 'USR$SUMNCU', headerName: 'Сумма', width: 100, align: 'right',
      renderCell: ({ value }) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })
    },
    {
      field: 'JOBWORKNAME', headerName: 'Вид работ', flex: 1, minWidth: 200,
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
          disabled={actCompletionIsFetching}
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
          rows={actCompletion || []}
          columns={columns}
          loading={actCompletionIsFetching}
          loadingMode="circular"
          pagination
          pageSizeOptions={[20]}
          paginationModel={{ page: 0, pageSize: 20 }}
          rowHeight={100}
        />
      </CustomizedCard>
    </Stack>
  );
}

export default ActCompletion;
