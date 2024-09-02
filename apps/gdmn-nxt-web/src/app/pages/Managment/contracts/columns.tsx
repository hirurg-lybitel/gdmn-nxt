import { ContractType, IContract } from '@gsbelarus/util-api-types';
import { Box, IconButton, Typography } from '@mui/material';
import { GridColDef, GridValidRowModel, GRID_DETAIL_PANEL_TOGGLE_COL_DEF } from '@mui/x-data-grid-pro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Columns<T extends GridValidRowModel> {
  [key: number]: GridColDef<T>[]
}

export const columns: Columns<IContract> = {
  [ContractType.GS]: [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      renderCell: ({ formattedValue, row }) => {
        return (
          <IconButton size="small" disabled={!row.withDetails}>
            <ExpandMoreIcon style={{ transition: '0.1s', transform: formattedValue ? 'rotate(-90deg)' : 'none' }}/>
          </IconButton>
        );
      },
      align: 'center',
    },
    { field: 'NUMBER', headerName: 'Клиент', minWidth: 250, flex: 1,
      renderCell({ value, row: { customer: { NAME } } }) {
        return (
          <Box>
            <Typography variant="body2">{NAME}</Typography>
            <Typography variant="caption">{value}</Typography>
          </Box>
        );
      },
    },
    { field: 'DOCUMENTDATE', headerName: 'Дата', width: 100, type: 'date',
      valueFormatter: (params) => new Date(params?.value).toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DATEBEGIN', headerName: 'Дата начала', width: 150, type: 'date',
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' }) : null
    },
    { field: 'DATEEND', headerName: 'Дата окончания', width: 150, type: 'date',
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' }) : null
    },
    { field: 'SUMNCU', headerName: 'Сумма', width: 120, align: 'right',
      valueFormatter: ({ value }) => value > 0 ? (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '' },
    { field: 'SUMCURNCU', headerName: 'Сумма вал.', width: 120, align: 'right',
      valueFormatter: ({ value }) => value > 0 ? (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '' },
    { field: 'ISACTIVE', headerName: 'Действующий', type: 'boolean', width: 140, resizable: false, sortable: false },
  ],
  [ContractType.BG]: [
    { field: 'NUMBER', headerName: 'Клиент', minWidth: 250, flex: 1,
      renderCell({ value, row: { customer: { NAME } } }) {
        return (
          <Box>
            <Typography variant="body2">{NAME}</Typography>
            <Typography variant="caption">{value}</Typography>
          </Box>
        );
      },
    },
    { field: 'DOCUMENTDATE', headerName: 'Дата', width: 100, type: 'date',
      valueFormatter: (params) => new Date(params?.value).toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DATEBEGIN', headerName: 'Дата начала', width: 150, type: 'date',
      valueFormatter: (params) => new Date(params?.value).toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DATEEND', headerName: 'Дата окончания', width: 150, type: 'date',
      valueFormatter: (params) => new Date(params?.value).toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DEPT_NAME', headerName: 'Отдел', width: 100 },
    { field: 'JOB_NUMBER', headerName: 'Заказ', width: 100 },
    { field: 'SUMNCU', headerName: 'Сумма', width: 100, align: 'right',
      renderCell: ({ value }) => (Math.round(Number(value) * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    { field: 'SUMCURNCU', headerName: 'Сумма вал.', width: 120, align: 'right',
      renderCell: ({ value }) => (Math.round((Number(value) * 100)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    { field: 'ISACTIVE', headerName: 'Действующий', type: 'boolean', width: 140, resizable: false },
    { field: 'ISBUDGET', headerName: 'Бюджетный', type: 'boolean', width: 140 },
  ]
};
