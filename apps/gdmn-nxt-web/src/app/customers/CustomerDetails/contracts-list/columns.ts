import { ContractType, IContract } from '@gsbelarus/util-api-types';
import { GridColDef, GridValidRowModel } from '@mui/x-data-grid-pro';

interface Columns<T extends GridValidRowModel> {
  [key: number]: GridColDef<T>[]
}

export const columns: Columns<IContract> = {
  [ContractType.GS]: [
    { field: 'NUMBER', headerName: 'Номер', minWidth: 185, flex: 1 },
    { field: 'DOCUMENTDATE', headerName: 'Дата', width: 100, type: 'date',
      valueFormatter: (params: any) => new Date(params?.value).toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DATEBEGIN', headerName: 'Дата начала', width: 150, type: 'date',
      valueFormatter: (params: any) => new Date(params?.value).toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DATEEND', headerName: 'Дата окончания', width: 150, type: 'date',
      valueFormatter: (params: any) => new Date(params?.value).toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'SUMNCU', headerName: 'Сумма', width: 100, align: 'right',
      renderCell: ({ value }: any) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    { field: 'SUMCURNCU', headerName: 'Сумма вал.', width: 120, align: 'right',
      renderCell: ({ value }: any) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    { field: 'ISACTIVE', headerName: 'Действующий', type: 'boolean', width: 140 },

  ],
  [ContractType.BG]: [
    { field: 'NUMBER', headerName: 'Номер', flex: 1, minWidth: 100 },
    { field: 'DOCUMENTDATE', headerName: 'Дата', width: 100, type: 'date',
      renderCell: ({ value }: any) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DATEBEGIN', headerName: 'Дата начала', width: 150, type: 'date',
      renderCell: ({ value }: any) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DATEEND', headerName: 'Дата окончания', width: 150, type: 'date',
      renderCell: ({ value }: any) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    },
    { field: 'DEPT_NAME', headerName: 'Отдел', width: 100 },
    { field: 'JOB_NUMBER', headerName: 'Заказ', width: 100 },
    { field: 'SUMNCU', headerName: 'Сумма', width: 100, align: 'right',
      renderCell: ({ value }: any) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    { field: 'SUMCURNCU', headerName: 'Сумма вал.', width: 120, align: 'right',
      renderCell: ({ value }: any) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    { field: 'ISACTIVE', headerName: 'Действующий', type: 'boolean', width: 140 },
    { field: 'ISBUDGET', headerName: 'Бюджетный', type: 'boolean', width: 140 },
  ]
};
