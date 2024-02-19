import { Box, Button, Stack, Theme } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid-pro';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetContractsListQuery } from '../../../features/contracts-list/contractsListApi';
import styles from './contracts-list.module.less';
import RefreshIcon from '@mui/icons-material/Refresh';
import { makeStyles } from '@mui/styles';
import { ColorMode } from '@gsbelarus/util-api-types';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';

const useStyles = makeStyles((theme: Theme) => ({
  dataGrid: {
    '& .isActive--false': {
      backgroundColor: theme.palette.mode === ColorMode.Dark ? theme.color.red[400] : theme.color.red[100]
    }
  },
}));

export interface ContractsListProps {
  companyId?: number;
}

export function ContractsList(props: ContractsListProps) {
  const { companyId } = props;
  const classes = useStyles();
  const { data: contracts, refetch, isFetching: contractsIsFetching } = useGetContractsListQuery(companyId);

  const columns: GridColDef[] = [
    { field: 'NUMBER', headerName: 'Номер', flex: 1, minWidth: 100 },
    { field: 'DOCUMENTDATE', headerName: 'Дата', width: 100, type: 'date',
      renderCell: ({ value }) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DATEBEGIN', headerName: 'Дата начала', width: 150, type: 'date',
      renderCell: ({ value }) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DATEEND', headerName: 'Дата окончания', width: 150, type: 'date',
      renderCell: ({ value }) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DEPT_NAME', headerName: 'Отдел', width: 100 },
    { field: 'JOB_NUMBER', headerName: 'Заказ', width: 100 },
    { field: 'SUMNCU', headerName: 'Сумма', width: 100, align: 'right',
      renderCell: ({ value }) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    { field: 'SUMCURNCU', headerName: 'Сумма вал.', width: 120, align: 'right',
      renderCell: ({ value }) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    { field: 'ISACTIVE', headerName: 'Действующий', type: 'boolean', width: 140 },
    { field: 'ISBUDGET', headerName: 'Бюджетный', type: 'boolean', width: 140 },
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
          disabled={contractsIsFetching}
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
          className={classes.dataGrid}
          getRowClassName={({ row }) => `isActive--${row.ISACTIVE}`}
          rows={contracts || []}
          columns={columns}
          loading={contractsIsFetching}
          loadingMode="circular"
          pagination
          pageSizeOptions={[20]}
          paginationModel={{ page: 0, pageSize: 20 }}
        />
      </CustomizedCard>
    </Stack>
  );
}

export default ContractsList;
