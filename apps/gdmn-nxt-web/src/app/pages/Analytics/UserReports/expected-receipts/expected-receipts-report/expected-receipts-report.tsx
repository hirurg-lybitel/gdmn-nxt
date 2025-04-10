import { Tooltip } from '@mui/material';
import { CircularIndeterminate } from '@gdmn-nxt/helpers/circular-indeterminate/circular-indeterminate';
import styles from './expected-receipts-report.module.less';
import { useGetExpectedReceiptsQuery } from 'apps/gdmn-nxt-web/src/app/features/reports/reportsApi';
import { DateRange } from '@mui/x-date-pickers-pro';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useCallback, useMemo } from 'react';
import { IExpectedReceipt, IFilteringData } from '@gsbelarus/util-api-types';

interface ThTooltipProps extends React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement> {
  title: string
}

const ThTooltip = ({ title, children, ...rest }: ThTooltipProps) => {
  return (
    <Tooltip
      placement="top"
      arrow
      title={title}
    >
      <th {...rest}>{children}</th>
    </Tooltip>
  );
};

export interface ExpectedReceiptsReportProps {
  data: IExpectedReceipt[] | undefined;
  isFetching: boolean
}

export function ExpectedReceiptsReport({ data, isFetching }: Readonly<ExpectedReceiptsReportProps>) {
  const total = useMemo(() => {
    if ((data?.length ?? 0) < 1) return;

    return data?.reduce((count, item) => {
      return {
        count: (count.count ?? 0) + (item.count ?? 0),
        fixedPayment: {
          baseValues: (count.fixedPayment?.baseValues ?? 0) + (item.fixedPayment?.baseValues ?? 0),
          amount: (count.fixedPayment?.amount ?? 0) + (item.fixedPayment?.amount ?? 0)
        },
        workstationPayment: {
          count: (count.workstationPayment?.count ?? 0) + (item.workstationPayment?.count ?? 0),
          baseValues: (count.workstationPayment?.baseValues ?? 0) + (item.workstationPayment?.baseValues ?? 0),
          amount: (count.workstationPayment?.amount ?? 0) + (item.workstationPayment?.amount ?? 0)
        },
        perTimePayment: {
          baseValues: (count.perTimePayment?.baseValues ?? 0) + (item.perTimePayment?.baseValues ?? 0),
          perHour: (count.perTimePayment?.perHour ?? 0) + (item.perTimePayment?.perHour ?? 0),
          hoursAvarage: (count.perTimePayment?.hoursAvarage ?? 0) + (item.perTimePayment?.hoursAvarage ?? 0),
          amount: (count.perTimePayment?.amount ?? 0) + (item.perTimePayment?.amount ?? 0)
        },
        amount: count.amount + item.amount,
        valAmount: count.valAmount + item.valAmount
      };
    });
  }, [data]);

  const procentCalc = useCallback((value: number) => {
    const procent = ((value / (total?.amount ?? 1)) * 100);
    if (procent < 0.1) {
      return '<0.1%';
    }
    return procent.toFixed(1) + '%';
  }, [total?.amount]);

  const numberFormat = useCallback((number?: number) => {
    if (!number || number === 0) return '';
    return number.toLocaleString();
  }, []);

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
                  <th className={styles.noTopBorder} rowSpan={2}>№</th>
                  <th className={styles.noTopBorder} rowSpan={2}>Клиент</th>
                  <ThTooltip
                    className={styles.noTopBorder}
                    rowSpan={2}
                    title={'Ответственные лица'}
                  >
                    Отв.
                  </ThTooltip>
                  <ThTooltip
                    className={styles.noTopBorder}
                    rowSpan={2}
                    title={'Количество договоров попавших в выбранный период'}
                  >
                    Кол-во
                  </ThTooltip>
                  <th className={styles.noTopBorder} colSpan={2} >Фиксированная ежемесячная оплата</th>
                  <th className={styles.noTopBorder} colSpan={3}>Оплата за рабочие места</th>
                  <th className={styles.noTopBorder} colSpan={3}>Повременная оплата</th>
                  <th className={styles.noTopBorder} colSpan={3}>Всего</th>
                </tr>
                <tr className={styles.tableRow}>
                  <ThTooltip title={'Базовые величины'}>Б/в</ThTooltip>
                  <th>Руб</th>
                  <ThTooltip title={'Количество рабочих мест'}>Кол-во р/м</ThTooltip>
                  <ThTooltip style={{ minWidth: '44px' }} title={'Базовых величин за одно рабочее место'}>Б/в за 1 р/м</ThTooltip>
                  <th>Руб</th>
                  <th>За час руб</th>
                  <ThTooltip title={'Часов среднемесячно'}>часов см</ThTooltip>
                  <th>Руб</th>
                  <th>Руб</th>
                  <th>USD</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody className={styles.lines}>
                {data.map((contact, index) => (
                  <tr
                    className={styles.tableRow}
                    style={index % 2 === 0 ? { background: 'var(--color-card-bg)' } : {}}
                    key={index}
                  >
                    <th style={{ textAlign: 'center' }}>{index + 1}</th>
                    <th>{contact?.customer?.NAME}</th>
                    <th>{contact.respondents?.map((r, i) => i === 0 ? r : `, ${r}`)}</th>
                    <th className={styles.numberTh}>{numberFormat(contact.count)}</th>
                    <th className={styles.numberTh}>{numberFormat(contact.fixedPayment?.baseValues)}</th>
                    <th className={styles.numberTh}>{numberFormat(contact.fixedPayment?.amount)}</th>
                    <th className={styles.numberTh}>{numberFormat(contact.workstationPayment?.count)}</th>
                    <th className={styles.numberTh}>{numberFormat(contact.workstationPayment?.baseValues)}</th>
                    <th className={styles.numberTh}>{numberFormat(contact.workstationPayment?.amount)}</th>
                    <th className={styles.numberTh}>{numberFormat(contact.perTimePayment?.perHour)}</th>
                    <th className={styles.numberTh}>{numberFormat(contact.perTimePayment?.hoursAvarage)}</th>
                    <th className={styles.numberTh}>{numberFormat(contact.perTimePayment?.amount)}</th>
                    <th className={styles.numberTh}>{numberFormat(contact.amount)}</th>
                    <th className={styles.numberTh}>{numberFormat(contact.valAmount)}</th>
                    <th className={styles.numberTh}>{procentCalc(contact.amount)}</th>
                  </tr>
                ))}
                <tr className={styles.tableRow} style={data.length % 2 === 0 ? { background: 'var(--color-card-bg)' } : {}}>
                  <th className={styles.noBottomBorder}>Итого</th>
                  <th className={styles.noBottomBorder}/>
                  <th className={styles.noBottomBorder} />
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.count)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.fixedPayment?.baseValues)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.fixedPayment?.amount)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.workstationPayment?.count)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.workstationPayment?.baseValues)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.workstationPayment?.amount)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.perTimePayment?.perHour)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.perTimePayment?.hoursAvarage)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.perTimePayment?.amount)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.amount)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.valAmount)}</th>
                  <th className={styles.noBottomBorder} />
                </tr>
              </tbody>
            </table>
          </div>
          : <CircularIndeterminate open={isFetching}/>}
      </PerfectScrollbar>
    </div>
  );
}

export default ExpectedReceiptsReport;
