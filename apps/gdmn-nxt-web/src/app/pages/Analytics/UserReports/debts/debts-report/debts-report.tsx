import { CircularIndeterminate } from '@gdmn-nxt/helpers/circular-indeterminate/circular-indeterminate';
import styles from './debts-report.module.less';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useMemo } from 'react';
import { IDebt, IExpense } from '@gsbelarus/util-api-types';

export interface DebtsReportProps {
  data: IDebt[] | undefined;
  isFetching: boolean
}

export function DebtsReport({ data, isFetching }: Readonly<DebtsReportProps>) {
  const total = useMemo(() => {
    if ((data?.length ?? 0) < 1) return;

    return data?.reduce((count, item) => {
      return {
        ...item,
        saldoBegin: {
          value: count.saldoBegin.value + item.saldoBegin.value,
          currency: count.saldoBegin.currency + item.saldoBegin.currency,
        },
        saldoEnd: {
          value: count.saldoEnd.value + item.saldoEnd.value,
          currency: count.saldoEnd.currency + item.saldoEnd.currency,
        },
        done: count.done + item.done,
        paid: count.paid + item.paid,
        change: count.change + item.change
      };
    });
  }, [data]);

  const numberFormat = (number?: number) => {
    if (!number || number === 0) return '';
    return number.toLocaleString();
  };

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
                  <th className={styles.noTopBorder}> </th>
                  <th className={styles.noTopBorder} colSpan={2}>Сальдо на начало</th>
                  <th className={styles.noTopBorder}>Выполнено</th>
                  <th className={styles.noTopBorder}>Оплачено</th>
                  <th className={styles.noTopBorder} colSpan={2}>Сальдо на конец</th>
                  <th className={styles.noTopBorder}>Изменение</th>
                </tr>
                <tr className={styles.tableRow}>
                  <th>Клиент</th>
                  <th>Руб</th>
                  <th>USD</th>
                  <th>Руб</th>
                  <th>Руб</th>
                  <th>Руб</th>
                  <th>USD</th>
                  <th>%</th>
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
                    <th className={styles.numberTh}>{numberFormat(item.saldoBegin.value)}</th>
                    <th className={styles.numberTh}>{numberFormat(item.saldoBegin.currency)}</th>
                    <th className={styles.numberTh}>{numberFormat(item.done)}</th>
                    <th className={styles.numberTh}>{numberFormat(item.paid)}</th>
                    <th className={styles.numberTh}>{numberFormat(item.saldoEnd.value)}</th>
                    <th className={styles.numberTh}>{numberFormat(item.saldoEnd.currency)}</th>
                    <th className={styles.numberTh}>{!item.change && item.change + '%'}</th>
                  </tr>
                ))}
                <tr className={styles.tableRow} style={data.length % 2 === 0 ? { background: 'var(--color-card-bg)' } : {}}>
                  <th className={styles.noBottomBorder}>Итого</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.saldoBegin.value)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.saldoBegin.currency)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.done)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.paid)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.saldoEnd.value)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.saldoEnd.currency)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{!total?.change && total?.change + '%'}</th>
                </tr>
              </tbody>
            </table>
          </div>
          : <CircularIndeterminate open={isFetching}/>}
      </PerfectScrollbar>
    </div>
  );
}

export default DebtsReport;
