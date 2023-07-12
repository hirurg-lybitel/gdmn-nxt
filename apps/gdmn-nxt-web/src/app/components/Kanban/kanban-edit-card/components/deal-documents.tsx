import { GridColumns } from '@mui/x-data-grid-pro';
import StyledGrid from '../../../Styled/styled-grid/styled-grid';
import { useGetDocumentsQuery } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanCatalogsApi';
import { Box } from '@mui/material';

export interface DealDocumentsProps {
  dealId: number;
}

export function DealDocuments ({ dealId }: DealDocumentsProps) {
  const { data = [], isFetching } = useGetDocumentsQuery(dealId);

  const columns: GridColumns = [
    {
      field: 'DESCRIPTION',
      headerName: 'Наименование',
      editable: true,
      flex: 0.5,
    }
  ];

  return (
    <Box flex={1} height={'100%'}>
      <StyledGrid
        rows={data}
        columns={columns}
        loading={isFetching}
        rowHeight={80}
        loadingMode="circular"
        hideColumnHeaders
        hideHeaderSeparator
        hideFooter
      />
    </Box>
  );
}
