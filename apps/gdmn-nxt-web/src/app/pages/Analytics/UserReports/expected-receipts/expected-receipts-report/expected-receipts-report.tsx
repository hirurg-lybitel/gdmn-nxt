import { ColorMode } from '@gsbelarus/util-api-types';
import { Theme, Tooltip } from '@mui/material';
import { CircularIndeterminate } from '@gdmn-nxt/helpers/circular-indeterminate/circular-indeterminate';
import { useGetRemainsInvoicesQuery } from 'apps/gdmn-nxt-web/src/app/features/remains-by-invoices/remainsInvoicesApi';
import { RootState } from 'apps/gdmn-nxt-web/src/app/store';
import { useSelector } from 'react-redux';
import styles from './expected-receipts-report.module.less';
import { Grid3x3 } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useGetExpectedReceiptsQuery } from 'apps/gdmn-nxt-web/src/app/features/expected-receipts/expectedReceiptsApi';
import { DateRange } from '@mui/x-date-pickers-pro';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import PerfectScrollbar from 'react-perfect-scrollbar';

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
  onDate: DateRange<Date>;
}

export function ExpectedReceiptsReport(props: ExpectedReceiptsReportProps) {
  const { onDate } = props;
  const { data, isFetching } = useGetExpectedReceiptsQuery({ onDate });

  console.log(onDate);

  const total = data?.reduce((count, item) => {
    return {
      customer: '',
      respondent: '',
      count: count.count + item.count,
      perMouthPayment: {
        baseValues: (count.perMouthPayment.baseValues || 0) + (item.perMouthPayment.baseValues || 0),
        amount: count.perMouthPayment.amount + item.perMouthPayment.amount
      },
      workstationPayment: {
        count: count.workstationPayment.count + item.workstationPayment.count,
        baseValues: (count.workstationPayment.baseValues || 0) + (item.workstationPayment.baseValues || 0),
        amount: count.workstationPayment.amount + item.workstationPayment.amount
      },
      perTimePayment: {
        baseValues: (count.perTimePayment.baseValues || 0) + (item.perTimePayment.baseValues || 0),
        perHour: count.perTimePayment.perHour + item.perTimePayment.perHour,
        hoursAvarage: count.perTimePayment.hoursAvarage + item.perTimePayment.hoursAvarage,
        amount: count.perTimePayment.amount + item.perTimePayment.amount
      },
      amount: count.amount + item.amount,
      valAmount: count.valAmount + item.valAmount
    };
  });

  return (
    <div style={{ flex: 1 }}>
      <PerfectScrollbar
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
              background: 'var(--color-card-bg)'
            }}
          >
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableRow} style={{ borderTop: 'none' }}>
                  <th className={styles.noTopBorder} colSpan={3} />
                  <th className={styles.noTopBorder} colSpan={2} >Фиксированная ежемесячная оплата</th>
                  <th className={styles.noTopBorder} colSpan={3}>Оплата за рабочие места</th>
                  <th className={styles.noTopBorder} colSpan={4}>Повременная оплата</th>
                  <th className={styles.noTopBorder} colSpan={2}>Всего</th>
                </tr>
                <tr className={styles.tableRow}>
                  <th>Клиент</th>
                  <ThTooltip title={'Ответственный'}>Отв.</ThTooltip>
                  <ThTooltip title={'Количество'}>Кол-во</ThTooltip>
                  <ThTooltip title={'Базовые величины'}>Б/в</ThTooltip>
                  <th>Руб</th>
                  <ThTooltip title={'Количество рабочих мест'}>Кол-во р/м</ThTooltip>
                  <ThTooltip style={{ minWidth: '44px' }} title={'Базовая величина за одно рабочее место'}>Б/в за 1 р/м</ThTooltip>
                  <th>Руб</th>
                  <ThTooltip style={{ minWidth: '42px' }} title={'Базовая величина за час'}>За час б/в</ThTooltip>
                  <th>За час руб</th>
                  <th>Часов среднемесячно</th>
                  <th>Руб</th>
                  <th>Руб</th>
                  <th>USD</th>
                </tr>
              </thead>
              <tbody>
                {data.map((contact, index) => (
                  <tr className={styles.tableRow} key={index}>
                    <th>{contact.customer}</th>
                    <th>{contact.respondent}</th>
                    <th>{contact.count}</th>
                    <th>{contact.perMouthPayment.baseValues}</th>
                    <th>{contact.perMouthPayment.amount}</th>
                    <th>{contact.workstationPayment.count}</th>
                    <th>{contact.workstationPayment.baseValues}</th>
                    <th>{contact.workstationPayment.amount}</th>
                    <th>{contact.perTimePayment.baseValues}</th>
                    <th>{contact.perTimePayment.perHour}</th>
                    <th>{contact.perTimePayment.hoursAvarage}</th>
                    <th>{contact.perTimePayment.amount}</th>
                    <th>{contact.amount}</th>
                    <th>{contact.valAmount}</th>
                  </tr>
                ))}
                <tr className={styles.tableRow}>
                  <th className={styles.noBottomBorder}>Итого</th>
                  <th className={styles.noBottomBorder}>-</th>
                  <th className={styles.noBottomBorder}>{total?.count}</th>
                  <th className={styles.noBottomBorder}>{total?.perMouthPayment.baseValues}</th>
                  <th className={styles.noBottomBorder}>{total?.perMouthPayment.amount}</th>
                  <th className={styles.noBottomBorder}>{total?.workstationPayment.count}</th>
                  <th className={styles.noBottomBorder}>{total?.workstationPayment.baseValues}</th>
                  <th className={styles.noBottomBorder}>{total?.workstationPayment.amount}</th>
                  <th className={styles.noBottomBorder}>{total?.perTimePayment.baseValues}</th>
                  <th className={styles.noBottomBorder}>{total?.perTimePayment.perHour}</th>
                  <th className={styles.noBottomBorder}>{total?.perTimePayment.hoursAvarage}</th>
                  <th className={styles.noBottomBorder}>{total?.perTimePayment.amount}</th>
                  <th className={styles.noBottomBorder}>{total?.amount}</th>
                  <th className={styles.noBottomBorder}>{total?.valAmount}</th>
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
