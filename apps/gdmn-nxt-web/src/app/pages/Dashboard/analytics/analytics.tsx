import { Box, Stack, Typography } from '@mui/material';
import BusinessDirectionCompare from '../../../components/Charts/business-direction-compare/business-direction-compare';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import styles from './analytics.module.less';

/* eslint-disable-next-line */
export interface AnalyticsProps {}

export function Analytics(props: AnalyticsProps) {
  return <BusinessDirectionCompare />;

  // return (
  //   <Stack flex={1} style={{ display: 'flex' }} spacing={3} >

  //     <CustomizedCard borders style={{ padding: '18px' }}>
  //       <Typography variant="h1">Продажи за период</Typography>

  //     </CustomizedCard>

  //     <Box flex={1} display={'flex'}>
  //       <BusinessDirectionCompare />
  //     </Box>
  //   </Stack>
  // );
}

export default Analytics;
