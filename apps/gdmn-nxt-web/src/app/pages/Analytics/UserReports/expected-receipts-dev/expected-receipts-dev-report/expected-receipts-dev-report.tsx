import { Tooltip } from '@mui/material';
import { CircularIndeterminate } from '@gdmn-nxt/helpers/circular-indeterminate/circular-indeterminate';
import styles from './expected-receipts-dev-report.module.less';
import { useGetExpectedReceiptsDevQuery } from 'apps/gdmn-nxt-web/src/app/features/reports/reportsApi';
import { DateRange } from '@mui/x-date-pickers-pro';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useCallback, useMemo, useState } from 'react';
import { IExpectedReceiptDev, IFilteringData } from '@gsbelarus/util-api-types';
import CheckIcon from '@mui/icons-material/Check';

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

export interface ExpectedReceiptsDevReportProps {
  data: IExpectedReceiptDev[] | undefined;
  isFetching: boolean
}

export function ExpectedReceiptsDevReport({ data, isFetching }: Readonly<ExpectedReceiptsDevReportProps>) {
  const total = useMemo(() => {
    if ((data?.length ?? 0) < 1) return;

    const total = {
      length: 0,
      expired: 0,
      amount: {
        value: 0,
        currency: 0
      },
      done: {
        value: 0,
        currency: 0
      },
      paid: {
        value: 0,
        currency: 0
      },
      rest: {
        value: 0,
        currency: 0
      }
    };

    data?.forEach((client) => client.contracts.forEach(contract => {
      total.length += 1;
      total.expired += contract.expired ?? 0;
      total.amount.value += contract.amount.value ?? 0;
      total.amount.currency += contract.amount.currency ?? 0;
      total.done.value += contract.done?.value ?? 0;
      total.done.currency += contract.done?.currency ?? 0;
      total.paid.value += contract.paid?.value ?? 0;
      total.paid.currency += contract.paid?.currency ?? 0;
      total.rest.value += contract.rest.value ?? 0;
      total.rest.currency += contract.rest.currency ?? 0;
    }));

    return total;
  }, [data]);

  const procentCalc = useCallback((value: number) => {
    if (!total?.rest.value || total?.rest.value < 1) return '';
    if (value < 1) return '';
    const procent = ((value / total?.rest.value) * 100);
    if (procent < 1) {
      return '<1%';
    }
    return procent.toFixed() + '%';
  }, [total?.rest.value]);

  const numberFormat = useCallback((number?: number) => {
    if (!number || number <= 0) return '';
    return number.toLocaleString();
  }, []);

  let rowCount = 0;

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
                  <th className={styles.noTopBorder} rowSpan={2}>Организация</th>
                  <th className={styles.noTopBorder} colSpan={4}>Договор</th>
                  <ThTooltip
                    className={styles.noTopBorder}
                    rowSpan={2}
                    title={'Планируемый'}
                  >
                    План
                  </ThTooltip>
                  <th className={styles.noTopBorder} rowSpan={2}>Тема</th>
                  <th className={styles.noTopBorder} colSpan={2} >Cумма</th>
                  <th className={styles.noTopBorder} colSpan={2}>Выполнено</th>
                  <th className={styles.noTopBorder} colSpan={2}>Оплачено</th>
                  <th className={styles.noTopBorder} colSpan={3}>Остаток</th>
                </tr>
                <tr className={styles.tableRow}>
                  <th>№</th>
                  <th>Начало</th>
                  <th>Окончание</th>
                  <th>Просрочен, дн</th>
                  <th>Руб</th>
                  <th>USD</th>
                  <th>Руб</th>
                  <th>USD</th>
                  <th>Руб</th>
                  <th>USD</th>
                  <th>Руб</th>
                  <th>USD</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody className={styles.lines}>
                {data.map((client, index) => client.contracts.map((contract, iindex) => {
                  rowCount ++;
                  return (
                    <tr
                      className={styles.tableRow}
                      style={(rowCount - 1) % 2 === 0 ? { background: 'var(--color-card-bg)' } : {}}
                      key={`${index}${iindex}`}
                    >
                      <th>{iindex === 0 && client?.customer?.NAME}</th>
                      <th>{contract.number}</th>
                      <th>{contract.dateBegin}</th>
                      <th>{contract.dateEnd}</th>
                      <th className={styles.numberTh}>{numberFormat(contract.expired)}</th>
                      <th>{contract.planned &&
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{<CheckIcon/>}</div>
                      }</th>
                      <th>{contract.subject}</th>
                      <th className={styles.numberTh}>{numberFormat(contract.amount.value)}</th>
                      <th className={styles.numberTh}>{numberFormat(contract.amount.currency)}</th>
                      <th className={styles.numberTh}>{numberFormat(contract.done?.value)}</th>
                      <th className={styles.numberTh}>{numberFormat(contract.done?.currency)}</th>
                      <th className={styles.numberTh}>{numberFormat(contract.paid?.value)}</th>
                      <th className={styles.numberTh}>{numberFormat(contract.paid?.currency)}</th>
                      <th className={styles.numberTh}>{numberFormat(contract.rest.value)}</th>
                      <th className={styles.numberTh}>{numberFormat(contract.rest.currency)}</th>
                      <th className={styles.numberTh}>{procentCalc(contract.rest.value)}</th>
                    </tr>
                  );
                })
                )}
                <tr className={styles.tableRow} style={(total?.length ?? 0) % 2 === 0 ? { background: 'var(--color-card-bg)' } : {}}>
                  <th className={styles.noBottomBorder}>Итого</th>
                  <th className={styles.noBottomBorder}/>
                  <th className={styles.noBottomBorder}/>
                  <th className={styles.noBottomBorder}/>
                  <th className={styles.noBottomBorder}/>
                  <th className={styles.noBottomBorder}/>
                  <th className={styles.noBottomBorder}/>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.amount.value)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.amount.currency)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.done.value)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.done.currency)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.paid.value)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.paid.currency)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.rest.value)}</th>
                  <th className={`${styles.noBottomBorder} ${styles.numberTh}`}>{numberFormat(total?.rest.currency)}</th>
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

export default ExpectedReceiptsDevReport;
