import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineOppositeContent, TimelineSeparator } from '@mui/lab';
import { Box, Stack, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useGetHistoryQuery } from '../../../features/kanban/kanbanApi';
import CircularIndeterminate from '../../helpers/circular-indeterminate/circular-indeterminate';
import styles from './kanban-history.module.less';


export interface KanbanHistoryProps {
  cardId: number;
};

export function KanbanHistory(props: KanbanHistoryProps) {
  const { cardId } = props;

  const { data, isFetching, refetch } = useGetHistoryQuery(cardId);

  const historyDate = useRef<{ date: string, isChanged: boolean}>();

  useEffect(() => {
    refetch();
  }, []);

  const setHistoryDate = (newDate: string) => {
    historyDate.current = { date: newDate, isChanged: true };
  };

  if (isFetching) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
        }}
      >
        <CircularIndeterminate open={true} size={60} />
      </div>
    );
  }

  return (
    <Box>
      <Timeline
        sx={{
          px: 0,
          '& .MuiTimelineOppositeContent-root': {
            flex: 0,
          }
        }}
      >
        {data?.map((el, index) => {
          return (
            <div key={index}>
              {el.USR$DATE?.toDateString() === historyDate.current?.date
                ? <></>
                : <TimelineItem>
                  <TimelineOppositeContent visibility={'hidden'}>
                      00:00
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography textTransform="uppercase">
                      {el.USR$DATE?.toLocaleDateString('default', { dateStyle: 'medium' })}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              }
              <TimelineItem key={el.ID} className={styles['TimeLineItem']}>
                <>
                  {setHistoryDate(el.USR$DATE?.toDateString() || '')}
                  <TimelineOppositeContent key={el.ID}>
                    <div>{el.USR$DATE?.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}</div>
                  </TimelineOppositeContent>
                  <TimelineSeparator key={el.ID}>
                    <TimelineDot variant="outlined"/>
                    {index === ((data?.length || 0) - 1)
                      ? <></>
                      : <TimelineConnector />
                    }
                  </TimelineSeparator>
                  <TimelineContent key={el.ID}>
                    <Stack direction="row" spacing={0.7} alignItems={'end'}>
                      <Typography>{`${el.USR$DESCRIPTION}:`}</Typography>
                      <Typography>{`${el.USR$TYPE === '1' ? 'добавил' : el.USR$TYPE === '2' ? 'обновил' : 'удалил'}`}</Typography>
                      <Typography variant="h4">{el.USERNAME}</Typography>
                    </Stack>
                    <Stack direction={(el.USR$OLD_VALUE?.length + el.USR$NEW_VALUE?.length) > 25 ? 'column' : 'row'} spacing={0.7} width="100%">
                      {(el.USR$TYPE !== '1' && el.USR$TYPE !== '3')
                        ? <>
                          <Typography variant="body1" color="GrayText" noWrap>
                            {`с ${el.USR$OLD_VALUE ? `"${el.USR$OLD_VALUE}"` : 'пустое значение'}`}
                          </Typography>
                        </>
                        : <></>}
                      <Typography variant="body1" color="GrayText" noWrap>
                        {`${el.USR$TYPE === '1' || el.USR$TYPE === '3' ? '' : 'на '}`}
                        {el.USR$NEW_VALUE
                          ? (el.USR$TYPE === '1' || el.USR$TYPE === '3' ? el.USR$NEW_VALUE : `"${el.USR$NEW_VALUE}"`)
                          : 'пустое значение'}
                      </Typography>
                    </Stack>
                  </TimelineContent>
                </>
              </TimelineItem>
            </div>
          );
        })}
      </Timeline>
    </Box>
  );
}

export default KanbanHistory;
