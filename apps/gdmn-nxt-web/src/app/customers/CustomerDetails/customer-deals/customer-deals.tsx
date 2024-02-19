import { Box, Chip } from '@mui/material';
import KanbanList from '../../../components/Kanban/kanban-list/kanban-list';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import styles from './customer-deals.module.less';
import { GridColDef } from '@mui/x-data-grid-pro';
import { renderCellExpand } from '../../../components/Styled/styled-grid/styled-grid';
import WarningIcon from '@mui/icons-material/Warning';
import CheckIcon from '@mui/icons-material/Check';
import InProgressIcon from '@mui/icons-material/Autorenew';
import InfoIcon from '@mui/icons-material/Info';
import useDateComparator from '../../../components/helpers/hooks/useDateComparator';
import { useRef, useState } from 'react';

export interface CustomerDealsProps {
  customerId: number
}

export function CustomerDeals(props: CustomerDealsProps) {
  const { customerId } = props;

  const { getDayDiff } = useDateComparator();
  const currentDate = useRef(new Date());

  const {
    data: nonCachedData,
    currentData: columns = nonCachedData || [],
  } = useGetKanbanDealsQuery({
    userId: -1,
    filter: {
      customers: [{ ID: customerId }]
    }
  });


  const newGridColumns: GridColDef[] = [
    {
      field: 'CREATIONDATE',
      headerName: 'Дата создания',
      type: 'date',
      headerAlign: 'center',
      align: 'center',
      width: 150,
      resizable: false,
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleDateString() || null : null,
    },
    {
      field: 'USR$DEADLINE',
      headerName: 'Статус',
      type: 'date',
      headerAlign: 'center',
      align: 'center',
      width: 200,
      resizable: false,
      renderCell: ({ value, row }) => {
        if (Object.keys(row).length === 0) return <></>;
        if (row.USR$DONE) return <></>;
        if (row.DENIED) return <></>;

        if (!value) {
          return <Chip
            variant="outlined"
            color="warning"
            size="small"
            icon={<WarningIcon/>}
            label="Без срока"
          />;
        }

        const { days: dayDiff } = getDayDiff(new Date(value), new Date(currentDate.current));

        switch (true) {
          case dayDiff > 0:
            return <Chip
              variant="outlined"
              color="success"
              size="small"
              icon={<InProgressIcon />}
              label="В работе"
            />;
          case dayDiff < 0:
            return <Chip
              variant="outlined"
              color="error"
              size="small"
              icon={<InfoIcon />}
              label="Просрочена"
            />;
          case dayDiff === 0:
            return <Chip
              variant="outlined"
              color="info"
              size="small"
              icon={<InfoIcon />}
              label="Заканчивается"
            />;
          default:
            return <></>;
        }
      }
    },
    {
      field: 'REQUESTNUMBER',
      headerName: '№ заявки',
      type: 'string',
      headerAlign: 'center',
      align: 'center',
      width: 150,
      resizable: false,
    },
    {
      field: 'PRODUCTNAME',
      headerName: 'Наименование',
      type: 'string',
      flex: 1,
      resizable: false,
    },
  ];
  return (
    <Box
      flex={1}
      display="flex"
    >
      <KanbanList
        columns={columns}
        gridColumns={newGridColumns}
        disableAddCard
      />
    </Box>
  );
}

export default CustomerDeals;
