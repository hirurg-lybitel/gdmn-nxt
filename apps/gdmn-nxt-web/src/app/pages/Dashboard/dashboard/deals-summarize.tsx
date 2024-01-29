import { useSelector } from 'react-redux';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import { RootState } from '../../../store';
import CircularIndeterminate from '../../../components/helpers/circular-indeterminate/circular-indeterminate';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import CustomizedScrollBox from '../../../components/Styled/customized-scroll-box/customized-scroll-box';
import { ColorMode } from '@gsbelarus/util-api-types';
import { DateRange } from '@mui/x-date-pickers-pro';
import dayjs, { Dayjs } from 'dayjs';

interface DealsSummarizeProps {
  period: DateRange<Dayjs>
}
export const DealsSummarize = ({ period }: DealsSummarizeProps) => {
  const theme = useTheme();
  const userId = useSelector<RootState, number>(state => state.user.userProfile?.id ?? -1);

  const { data: deals, isFetching } = useGetKanbanDealsQuery({
    userId,
    filter: {
      period: [
        dayjs(period[0])
          .toDate()
          .getTime(),
        dayjs(period[1])
          .toDate()
          .getTime()
      ]
    }
  });
  return (
    <CustomizedCard style={{ flex: 1, height: '10em', padding: '16px 16px 0 16px' }} boxShadows={theme.palette.mode === ColorMode.Light}>
      {isFetching
        ? <Box display="flex" height="100%">
          <CircularIndeterminate open={true} size={80} />
        </Box>
        : <CustomizedScrollBox>
          <Stack
            direction="row"
            spacing={2}
            display="inline-flex"
            height="100%"
            pb={2}
            justifyContent="center"
          >
            {deals?.map(deal =>
              <Stack
                key={deal.ID}
                alignItems="center"
              >
                <Typography variant="subtitle1">{deal.USR$NAME}</Typography>
                <CustomizedCard
                  borders={theme.palette.mode === ColorMode.Light}
                  style={{
                    backgroundColor: 'var(--color-card-bg)',
                    width: '180px',
                    flex: 1
                  }}
                >
                  <Stack
                    height="100%"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Typography fontSize="2.75rem">
                      {deal.CARDS.length}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {deal.CARDS.reduce((acc, { DEAL }) => Math.round((acc + (DEAL?.USR$AMOUNT ?? 0)) * 100) / 100, 0).toLocaleString()} Br
                    </Typography>
                  </Stack>

                </CustomizedCard>
              </Stack>
            )}
          </Stack>
        </CustomizedScrollBox>
      }

    </CustomizedCard>
  );
};
