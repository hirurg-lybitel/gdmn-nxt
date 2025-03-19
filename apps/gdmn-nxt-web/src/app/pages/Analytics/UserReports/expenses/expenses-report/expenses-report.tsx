import { CircularIndeterminate } from '@gdmn-nxt/helpers/circular-indeterminate/circular-indeterminate';
import styles from './expenses-report.module.less';
import { useGetExpensesQuery } from 'apps/gdmn-nxt-web/src/app/features/reports/reportsApi';
import { DateRange } from '@mui/x-date-pickers-pro';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useMemo } from 'react';
import { IFilteringData } from '@gsbelarus/util-api-types';

export interface ExpensesReportProps {
  onDate: DateRange<Date>;
  filterData: IFilteringData
}

export function ExpensesReport({ onDate, filterData }: Readonly<ExpensesReportProps>) {
  const options = useMemo(() => {
    const filter = { ...filterData };
    const sort = { field: filter.sortField, sort: filter.sort };
    delete filter['sortField'];
    delete filter['sort'];
    return {
      ...(filter && filter),
      ...(sort && sort)
    };
  }, [filterData]);

  const { data, isFetching } = useGetExpensesQuery({ onDate, options });

  const total = useMemo(() => {
    if ((data?.length ?? 0) < 1) return;

    return data?.reduce((count, item) => {
      return {
        ...item,
        amount: count.amount + item.amount,
        valAmount: count.valAmount + item.valAmount
      };
    });
  }, [data]);

  const procents = useMemo(() => data?.map((item => {
    const procent = ((item.amount / (total?.amount ?? 1)) * 100);
    if (procent < 0.1) {
      return '<0.1%';
    }
    return procent.toFixed(1) + '%';
  })), [data, total]);

  const numberFormat = (number?: number) => {
    if (!number || number <= 0) return '';
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
        {data
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
                  <th>Статья</th>
                  <th>Сумма, руб</th>
                  <th>Сумма, USD</th>
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
                    <th>{item.expenseName}</th>
                    <th className={styles.numberTh}>{numberFormat(item.amount)}</th>
                    <th className={styles.numberTh}>{numberFormat(item.valAmount)}</th>
                    <th className={styles.numberTh}>{procents?.[index]}</th>
                  </tr>
                ))}
                <tr className={styles.tableRow} style={data.length % 2 === 0 ? { background: 'var(--color-card-bg)' } : {}}>
                  <th className={styles.noBottomBorder}>Итого</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.amount)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.valAmount)}</th>
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

export default ExpensesReport;
