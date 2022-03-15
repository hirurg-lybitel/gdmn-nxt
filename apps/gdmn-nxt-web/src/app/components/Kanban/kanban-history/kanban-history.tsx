import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineOppositeContent, TimelineSeparator } from '@mui/lab';
import { Box, Stack, Typography } from '@mui/material';
import { useRef } from 'react';
import { useGetHistoryQuery } from '../../../features/kanban/kanbanApi';


export interface KanbanHistoryProps {
  cardId: number;
};

export function KanbanHistory(props: KanbanHistoryProps) {
  const { cardId } = props;

  const { data, isFetching } = useGetHistoryQuery(cardId);

  const historyDate = useRef<string>('');

  const setHistoryDate = (newDate: string) => {
    historyDate.current = newDate;
  };

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
          // console.log('date', el.USR$DATE.toDateString());
          return (
            <>
              {el.USR$DATE.toDateString() === historyDate.current
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
                      {el.USR$DATE.toLocaleDateString('default', { dateStyle: 'medium' })}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              }
              <TimelineItem key={el.ID}>
                {/* {el.USR$DATE.toDateString() === historyDate.current
                  ? <div>1</div>
                  : <div>2</div>
                } */}
                {setHistoryDate(el.USR$DATE.toDateString())}
                <TimelineOppositeContent key={el.ID}>
                  <div>{el.USR$DATE.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}</div>
                </TimelineOppositeContent>
                <TimelineSeparator key={el.ID}>
                  <TimelineDot variant="outlined"/>
                  {index === data.length - 1
                    ? <></>
                    : <TimelineConnector />
                  }
                </TimelineSeparator>
                <TimelineContent key={el.ID}>
                  <Stack direction="row" spacing={0.7}>
                    <Typography>{`${el.USR$DESCRIPTION}:`}</Typography>
                    <Typography noWrap>{`${el.USR$TYPE === '1' ? 'добавил' : 'обновил'}`}</Typography>
                    <Typography variant="h4">{el.USERNAME}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.7}>
                    {el.USR$TYPE !== '1'
                      ? <>
                        <Typography variant="body1" color="GrayText">
                          {`с ${el.USR$OLD_VALUE ? `"${el.USR$OLD_VALUE}"` : 'пустое значение'}`}
                        </Typography>
                        <Typography variant="body1" color="GrayText">{'на'}</Typography>
                      </>
                      : <></>}

                    <Typography variant="body1" color="GrayText">
                      {el.USR$NEW_VALUE
                        ? (el.USR$TYPE === '1' ? el.USR$NEW_VALUE : `"${el.USR$NEW_VALUE}"`)
                        : 'пустое значение'}
                    </Typography>
                  </Stack>

                </TimelineContent>
              </TimelineItem>
            </>
          );
        })}
      </Timeline>
    </Box>
    // {data?.map(el => <div key={el.ID}>{el.USR$DESCRIPTION}</div>)}
  );
}

export default KanbanHistory;
