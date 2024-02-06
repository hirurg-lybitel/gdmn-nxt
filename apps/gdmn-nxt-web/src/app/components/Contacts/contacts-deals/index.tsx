import WarningIcon from '@mui/icons-material/Warning';
import InProgressIcon from '@mui/icons-material/Autorenew';
import InfoIcon from '@mui/icons-material/Info';
import useUserData from '@gdmn-nxt/components/helpers/hooks/useUserData';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import { GridColumns } from '@mui/x-data-grid-pro';
import { IDeal } from '@gsbelarus/util-api-types';
import { Box, Chip } from '@mui/material';
import { useRef } from 'react';
import useDateComparator from '@gdmn-nxt/components/helpers/hooks/useDateComparator';
import KanbanList from '@gdmn-nxt/components/Kanban/kanban-list/kanban-list';

interface Props {
  contactId: number
}

export default function ContactsDeals({
  contactId
}: Props) {
  const { id: userId } = useUserData();

  const { getDayDiff } = useDateComparator();
  const currentDate = useRef(new Date());

  const {
    data: rows = [],
    isFetching: isFetchingDeals
  } = useGetKanbanDealsQuery({
    userId,
    filter: {
      performers: [{ ID: contactId }],
      creators: [{ ID: contactId }],
    }
  });

  const columns: GridColumns<IDeal> = [
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
    }
  ];

  return (
    <Box
      flex={1}
      display="flex"
    >
      <KanbanList
        columns={rows}
        loading={isFetchingDeals}
        gridColumns={columns}
        disableAddCard
      />
    </Box>
  );
}
