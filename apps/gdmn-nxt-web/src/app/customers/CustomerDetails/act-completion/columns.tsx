import { ContractType, IActCompletion } from '@gsbelarus/util-api-types';
import { Box } from '@mui/material';
import { GridColDef, GridValidRowModel } from '@mui/x-data-grid-pro';

interface Columns<T extends GridValidRowModel> {
  [key: number]: GridColDef<T>[]
}

export const columns: Columns<IActCompletion> = {
  [ContractType.GS]: [
    { field: 'NUMBER', headerName: 'Номер', minWidth: 150 },
    { field: 'DOCUMENTDATE', headerName: 'Дата', width: 100,
      type: 'date',
      renderCell: ({ value }: any) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    },
    { field: 'USR$SUMNCU', headerName: 'Сумма', width: 100, align: 'right',
      renderCell: ({ value }: any) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })
    },
    {
      field: 'JOBWORKNAME', headerName: 'Вид работ', flex: 1, minWidth: 200,
      renderCell: ({ value }: any) => <Box style={{ width: '100%', whiteSpace: 'initial' }}>{value}</Box>
    }
  ],
  [ContractType.BG]: [
    { field: 'NUMBER', headerName: 'Номер', minWidth: 150 },
    { field: 'DOCUMENTDATE', headerName: 'Дата', width: 100,
      type: 'date',
      renderCell: ({ value }: any) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    },
    { field: 'DEPT_NAME', headerName: 'Отдел', width: 100 },
    { field: 'JOB_NUMBER', headerName: 'Заказ', width: 100 },
    { field: 'USR$SUMNCU', headerName: 'Сумма', width: 100, align: 'right',
      renderCell: ({ value }: any) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })
    },
    {
      field: 'JOBWORKNAME', headerName: 'Вид работ', flex: 1, minWidth: 200,
      renderCell: ({ value }: any) => <Box style={{ width: '100%', whiteSpace: 'initial' }}>{value}</Box>
    }
  ]
};
