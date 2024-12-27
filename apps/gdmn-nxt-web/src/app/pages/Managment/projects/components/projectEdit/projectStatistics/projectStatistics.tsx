import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { useGetStatisticsQuery } from 'apps/gdmn-nxt-web/src/app/features/time-tracking';
import styles from './projectStatistics.module.less';
import { Box, Divider, Stack, Tooltip } from '@mui/material';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { GridColDef } from '@mui/x-data-grid-pro';
import { IProjectStatistics, ITimeTrack } from '@gsbelarus/util-api-types';
import dayjs from 'dayjs';
import { durationFormat } from '@gdmn-nxt/dayjs';
import { useMemo } from 'react';

interface IProjectStatisticsProps {
  projectId?: number
}

export default function ProjectStatistics({ projectId }: IProjectStatisticsProps) {
  const { data: statistics = [], isLoading, refetch } = useGetStatisticsQuery(projectId || -1, { skip: !projectId });

  const getProjectDuration = (count: 'all' | 'billable' | 'nonbillable') => {
    return durationFormat(statistics.map(({ timeTrack }) => getTaskDuration(timeTrack, count)).reduce((total: string, value: string) => {
      const time = dayjs
        .duration(total.length === 0 ? Object.assign({}) : total)
        .add(
          dayjs
            .duration(value || 'PT0M')
        )
        .toISOString();
      return time;
    }, ''));
  };

  const getTaskDuration = (value: ITimeTrack[], count: 'all' | 'billable' | 'nonbillable') => {
    return value.reduce((total: string, { duration, billable }: ITimeTrack) => {
      if (count === 'billable' && !billable) return 'PT0M';
      if (count === 'nonbillable' && billable) return 'PT0M';
      const time = dayjs
        .duration(total.length === 0 ? Object.assign({}) : total)
        .add(
          dayjs
            .duration(duration || 'PT0M')
        )
        .toISOString();
      return time;
    }, '');
  };

  const gridStatistics = useMemo(() => {
    return statistics.map(statistic => ({
      ...statistic,
      nonbilleble: durationFormat(getTaskDuration(statistic.timeTrack, 'nonbillable')),
      billable: durationFormat(getTaskDuration(statistic.timeTrack, 'billable')),
      all: durationFormat(getTaskDuration(statistic.timeTrack, 'all'))
    }));
  }, [statistics]);

  interface GridIProjectStatistics extends IProjectStatistics {
    nonbilleble: string
  }

  const columns: GridColDef<GridIProjectStatistics>[] = [
    {
      field: 'name',
      headerName: 'Задача',
      resizable: false,
      flex: 1,
      renderCell: ({ value, row }) => {
        return (
          <div>{value}</div>
        );
      },
      align: 'left',
    },
    {
      field: 'nonbilleble',
      headerName: 'Не оплачиваемые',
      resizable: false,
      flex: 1,
    },
    {
      field: 'billable',
      headerName: 'Оплачеваемые',
      resizable: false,
      flex: 1,
    },
    {
      field: 'all',
      resizable: false,
      headerName: 'Итого',
      width: 120,
    },
  ];

  return (
    <Stack
      direction="column"
      flex="1"
      display="flex"
      spacing={1}
      height={'100%'}
    >
      <CustomizedCard
        borders
        style={{
          flex: 1,
        }}
      >
        <StyledGrid
          rows={gridStatistics}
          columns={columns}
          loading={isLoading}
          hideFooter
        />
        <Divider />
        <div style={{ display: 'flex' }}>
          <Box flex={1} className={styles.footerItem}>Итого:</Box>
          <Box flex={1} className={styles.footerItem}>
            <Tooltip
              title={'Итого не оплачиваемых'}
              placement="top"
              arrow
            >
              <div style={{ width: 'min-content' }}>
                {getProjectDuration('nonbillable')}
              </div>
            </Tooltip>
          </Box>
          <Box flex={1} className={styles.footerItem}>
            <Tooltip
              title={'Итого оплачиваемых'}
              placement="top"
              arrow
            >
              <div style={{ width: 'min-content' }}>
                {getProjectDuration('billable')}
              </div>
            </Tooltip>
          </Box>
          <Box
            width={120}
            className={styles.footerItem}
            style={{ display: 'flex', justifyContent: 'flex-start' }}
          >
            <Tooltip
              title={'Итого по проекту'}
              placement="top"
              arrow
            >
              <div>
                {getProjectDuration('all')}
              </div>
            </Tooltip>
          </Box>
        </div>
      </CustomizedCard>
    </Stack>
  );
}
