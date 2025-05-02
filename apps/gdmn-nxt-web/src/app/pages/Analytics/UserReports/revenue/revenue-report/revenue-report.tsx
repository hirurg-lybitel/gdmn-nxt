import { CircularIndeterminate } from '@gdmn-nxt/helpers/circular-indeterminate/circular-indeterminate';
import styles from './revenue-report.module.less';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useCallback, useMemo } from 'react';
import { IRevenue } from '@gsbelarus/util-api-types';

export interface RevenueReportProps {
  data: IRevenue[] | undefined;
  isFetching: boolean
}

export function RevenueReport({ data, isFetching }: Readonly<RevenueReportProps>) {
  const total = useMemo(() => {
    if ((data?.length ?? 0) < 1) return;

    return data?.reduce((count, item) => {
      return {
        ...item,
        amount: count.amount + item.amount,
        amountCurrency: count.amountCurrency + item.amountCurrency
      };
    });
  }, [data]);

  const numberFormat = (number?: number) => {
    if (!number || number === 0) return '';
    return number.toLocaleString();
  };

  const procentCalc = useCallback((value: number) => {
    if (!total?.amount || total?.amount < 1) return '';
    if (value < 1) return '';
    const procent = ((value / total?.amount) * 100);
    if (procent < 1) {
      return '<1%';
    }
    return procent.toFixed() + '%';
  }, [total?.amount]);

  return (
    <div style={{ flex: 1 }}>
      <PerfectScrollbar
        options={{ suppressScrollY: true }}
        style={{
          display: 'flex',
          paddingBottom: '10px'
        }}
      >
        {data && !isFetching
          ? <div
            style={{
              borderRadius: 'var(--border-radius)',
              border: '1px solid gray',
              height: 'fit-content',
              width: 'fit-content',
              marginBottom: '10px',
              background: 'var(--color-paper-bg)',
              flex: 1
            }}
          >
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableRow} style={{ borderTop: 'none' }}>
                  <th className={styles.noTopBorder}>Клиент</th>
                  <th className={styles.noTopBorder}>Дата</th>
                  <th className={styles.noTopBorder}>Сумма</th>
                  <th className={styles.noTopBorder}>Сумма, USD</th>
                  <th className={styles.noTopBorder}>%</th>
                </tr>
              </thead>
              <tbody className={styles.lines}>
                {data.map((item, index) => (
                  <tr
                    className={styles.tableRow}
                    style={index % 2 === 0 ? { background: 'var(--color-card-bg)' } : {}}
                    key={index}
                  >
                    <th>{item.customer.NAME}</th>
                    <th>{item.date}</th>
                    <th className={styles.numberTh}>{numberFormat(item.amount)}</th>
                    <th className={styles.numberTh}>{numberFormat(item.amountCurrency)}</th>
                    <th className={styles.numberTh}>{procentCalc(item.amount)}</th>
                  </tr>
                ))}
                <tr className={styles.tableRow} style={data.length % 2 === 0 ? { background: 'var(--color-card-bg)' } : {}}>
                  <th className={styles.noBottomBorder}>Итого</th>
                  <th className={styles.noBottomBorder} />
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.amount)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.amountCurrency)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>100%</th>
                </tr>
              </tbody>
            </table>
          </div>
          : <CircularIndeterminate open={isFetching}/>}
      </PerfectScrollbar>
    </div>
  );
}

export default RevenueReport;
