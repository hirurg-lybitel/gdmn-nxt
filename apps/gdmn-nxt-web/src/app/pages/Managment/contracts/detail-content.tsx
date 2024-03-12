import { IContract, IContractDetail } from '@gsbelarus/util-api-types';
import { useGetContractDetailsQuery } from '../../../features/contracts-list/contractsListApi';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { GridColumns } from '@mui/x-data-grid-pro';
import { useCallback } from 'react';

interface Prop {
  row: IContract
}

export default function DetailContent({
  row
}: Prop) {
  const { data = [], isLoading } = useGetContractDetailsQuery(row.ID);

  const columns: GridColumns<IContractDetail> = [
    { field: '', headerName: '', width: 50, resizable: false },
    { field: 'NAME', headerName: 'Услуга', sortable: false, resizable: false, disableColumnMenu: true, flex: 1 },
    { field: 'QUANTITY', headerName: 'Количество', sortable: false, resizable: false, disableColumnMenu: true, minWidth: 130 },
    {
      field: 'PRICE', headerName: 'Цена', sortable: false, resizable: false, disableColumnMenu: true,
      valueFormatter: ({ value }) => value?.toLocaleString()
    },
    {
      field: 'AMOUNT', headerName: 'Сумма', sortable: false, resizable: false, disableColumnMenu: true,
      valueFormatter: ({ value }) => value?.toLocaleString()
    }
  ];

  const getHeight = useCallback((recordsCount = 0) => recordsCount === 0 ? 200 : recordsCount * 40 + 40, []);

  return (
    <div
      style={{
        height: getHeight(data.length),
        backgroundColor: 'var(--color-main-bg)'
      }}
    >
      <StyledGrid
        sx={{
          '& .MuiDataGrid-columnHeader': {
            paddingLeft: '24px',
            paddingRight: '24px',
            backgroundColor: 'var(--color-paper-bg)'
          },
        }}
        headerHeight={40}
        hideHeaderSeparator
        columns={columns}
        rows={data}
        loading={isLoading}
        hideFooter
      />
    </div>
  );
}
