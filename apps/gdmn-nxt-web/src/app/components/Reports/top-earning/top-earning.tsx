import { ColorMode } from '@gsbelarus/util-api-types';
import { Box, Grid, Typography } from '@mui/material';
import { DateRange } from '@mui/x-date-pickers-pro/DateRangePicker';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetTopEarningQuery } from '../../../features/topEarning';
import { RootState } from '../../../store';
import { CircularIndeterminate } from '../../helpers/circular-indeterminate/circular-indeterminate';
import CustomNoData from '../../Styled/Icons/CustomNoData';
import styles from './top-earning.module.less';

/* eslint-disable-next-line */
export interface ITopEarningParams {
  dates: DateRange<Date>;
  depId?: number;
  jobId?: number;
  jobWorkId?: number;
  customerCount: number;
};

export interface TopEarningProps {
  params?: ITopEarningParams
};

export function TopEarning({params}: TopEarningProps) {
  const [getTopEarning, {data, isLoading, isSuccess}] = useGetTopEarningQuery();

  const colorMode = useSelector((state: RootState) => state.settings.customization.mode);

  useEffect(() => {
    params && getTopEarning(params);
  }, [params]);

  if (!data) return <CircularIndeterminate open={isLoading}/>;
  if (data.length === 0) return <CustomNoData />;


  return (
    <>
      {data
        ? <><Grid container className={styles['table']} >
          <Grid container item className={`${styles['header']} ${colorMode === ColorMode.Dark ? styles['headerDark'] : ''}`}>
            <Grid item xs={9}>
              <Typography className={`${styles['cell']} ${styles['noTopBorder']}`} variant="h4">Наименование</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography className={`${styles['cell']} ${styles['noTopBorder']} ${styles['noRightBorder']}`} variant="h4">Сумма</Typography>
            </Grid>
          </Grid>
          <>
            {data.map((el, idx) =>
              <Grid key={idx} item container direction="row" justifyItems="center" justifyContent="center">
                <Grid item className={styles['cell']} xs={9}>{el.NAME}</Grid>
                <Grid item className={`${styles['cell']} ${styles['noRightBorder']}`} xs={3} textAlign="right" justifyItems="center" justifyContent="center" >
                  <Typography justifyContent="center">{(Math.round(el.AMOUNT * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                </Grid>
              </Grid>)
            }
          </>
        </Grid>
        </>
        : <CircularIndeterminate open={isLoading}/>}
    </>
  );
}

export default TopEarning;
