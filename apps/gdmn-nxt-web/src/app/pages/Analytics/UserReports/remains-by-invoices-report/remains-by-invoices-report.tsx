import { ColorMode } from '@gsbelarus/util-api-types';
import { Grid, Typography } from '@mui/material';
import { CircularIndeterminate } from '@gdmn-nxt/helpers/circular-indeterminate/circular-indeterminate';
import { RootState } from 'apps/gdmn-nxt-web/src/app/store';
import { useSelector } from 'react-redux';
import styles from './remains-by-invoices-report.module.less';
import { useGetRemainsInvoicesQuery } from 'apps/gdmn-nxt-web/src/app/features/reports/reportsApi';

export interface RemainsByInvoicesReportProps {
  onDate: Date;
}

export function RemainsByInvoicesReport(props: RemainsByInvoicesReportProps) {
  const { onDate } = props;
  const { data, isFetching } = useGetRemainsInvoicesQuery({ onDate });

  const colorMode = useSelector((state: RootState) => state.settings.customization.colorMode);

  const groupSumsMap = new Map<string, number>();
  for (const { CODE, SALDOCURR } of data || []) {
    groupSumsMap.set(CODE, (groupSumsMap.get(CODE) || 0) + SALDOCURR);
  };

  const groupSums = Object.fromEntries([...groupSumsMap]);

  return (
    <>
      {data
        ? <><Grid container className={styles['table']} >
          <Grid
            container
            item
            className={`${styles['header']} ${colorMode === ColorMode.Dark ? styles['headerDark'] : ''}`}
          >
            <Grid item xs={8}>
              <Typography className={`${styles['cell']} ${styles['noTopBorder']}`} fontWeight={600}>Расчётный счёт</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={`${styles['cell']} ${styles['noTopBorder']} ${styles['noRightBorder']}`} fontWeight={600}>Остаток</Typography>
            </Grid>
          </Grid>
          <>
            {data.map((el, idx, arr) =>
              <Grid
                key={idx}
                item
                container
                direction="row"
                justifyItems="center"
                justifyContent="center"
              >
                <Grid
                  item
                  className={styles['cell']}
                  xs={6}
                >{el.NAME}</Grid>
                <Grid
                  item
                  className={styles['cell']}
                  xs={2}
                  textAlign="center"
                >{el.CODE}</Grid>
                <Grid
                  item
                  className={`${styles['cell']} ${styles['noRightBorder']}`}
                  xs={4}
                  textAlign="right"
                  justifyItems="center"
                  justifyContent="center"
                >
                  <Typography justifyContent="center">{(Math.round(el.SALDOCURR * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>

                </Grid>
                {arr[idx + 1]?.CODE !== el.CODE
                  ? <>
                    <Grid
                      className={styles['cell']}
                      item
                      xs={8}
                      textAlign="right"
                    >
                      <Typography fontWeight={600}>{`Итого по ${el.CODE}:`}</Typography>
                    </Grid>
                    <Grid
                      className={`${styles['cell']} ${styles['noRightBorder']}`}
                      item
                      xs={4}
                      textAlign="right"
                    >
                      <Typography fontWeight={600}>{(Math.round(groupSums[el.CODE] * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>

                    </Grid>
                  </>
                  : <></>}
              </Grid>)
            }
          </>
        </Grid>
        </>
        : <CircularIndeterminate open={isFetching}/>}
    </>
  );
}

export default RemainsByInvoicesReport;
