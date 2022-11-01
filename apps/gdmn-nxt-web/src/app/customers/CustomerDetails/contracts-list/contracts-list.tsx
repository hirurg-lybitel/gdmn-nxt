import { Box, Button, Stack, Theme } from '@mui/material';
import { DataGridPro, GridColDef, ruRU } from '@mui/x-data-grid-pro';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetContractsListQuery } from '../../../features/contracts-list/contractsListApi';
import styles from './contracts-list.module.less';
import RefreshIcon from '@mui/icons-material/Refresh';
import CustomNoRowsOverlay from '../../../components/Styled/styled-grid/DataGridProOverlay/CustomNoRowsOverlay';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
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
    '& .isActive--false': {
      backgroundColor: theme.color.red[50]
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
    { field: 'DATEBEGIN', headerName: 'Дата начала', width: 130, type: 'date',
      renderCell: ({ value }) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DATEEND', headerName: 'Дата окончания', width: 130, type: 'date',
      renderCell: ({ value }) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DEPT_NAME', headerName: 'Отдел', width: 70 },
    { field: 'JOB_NUMBER', headerName: 'Заказ', width: 70 },
    { field: 'SUMNCU', headerName: 'Сумма', width: 70, align: 'right',
      renderCell: ({ value }) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    { field: 'SUMCURNCU', headerName: 'Сумма вал.', width: 100, align: 'right',
      renderCell: ({ value }) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    { field: 'ISACTIVE', headerName: 'Действующий', type: 'boolean', width: 120 },
    { field: 'ISBUDGET', headerName: 'Бюджетный', type: 'boolean', width: 100 },
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
        <DataGridPro
          className={classes.dataGrid}
          getRowClassName={({row}) => `isActive--${row.ISACTIVE}`}
          localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
          rows={contracts || []}
          getRowId={row => row.ID}
          columns={columns}
          loading={contractsIsFetching}
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

export default ContractsList;
