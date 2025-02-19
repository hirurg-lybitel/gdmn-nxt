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
    <>
      {data
        ? <div style={{ borderRadius: 'var(--border-radius)', overflow: 'hidden', border: '1px solid gray' }}>
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
                <ThTooltip title={'Базовая величина за одно рабочее место'}>Б/в за 1 р/м</ThTooltip>
                <th>Руб</th>
                <ThTooltip title={'Базовая величина за час'}>За час б/в</ThTooltip>
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
    </>
  );
}

export default ExpectedReceiptsReport;

const data = [
  {
    'ALIAS': '52.1',
    'ID': 355201,
    'NAME': 'Валютный счет, дол. США',
    'CODE': 'USD',
    'SALDOCURR': 635.0319
  },
  {
    'ALIAS': '52.1-3',
    'ID': 353938400,
    'NAME': 'Валютный счет, дол. США Беларусбанк',
    'CODE': 'USD',
    'SALDOCURR': 30000
  },
  {
    'ALIAS': '52.1-2',
    'ID': 353235817,
    'NAME': 'Валютный счет, дол. США Приорбанк',
    'CODE': 'USD',
    'SALDOCURR': 4535.67
  },
  {
    'ALIAS': '52.3',
    'ID': 148348896,
    'NAME': 'Валютный счет, ЕВРО',
    'CODE': 'EUR',
    'SALDOCURR': 12620.3894
  },
  {
    'ALIAS': '52.3-3',
    'ID': 353938402,
    'NAME': 'Валютный счет, ЕВРО Беларусбанк',
    'CODE': 'EUR',
    'SALDOCURR': 137035.12
  },
  {
    'ALIAS': '52.3-2',
    'ID': 353235819,
    'NAME': 'Валютный счет, ЕВРО Приорбанк',
    'CODE': 'EUR',
    'SALDOCURR': 4981.75
  },
  {
    'ALIAS': '52.2',
    'ID': 355202,
    'NAME': 'Валютный счет, рос.руб.',
    'CODE': 'RUB',
    'SALDOCURR': 8276444.9902
  },
  {
    'ALIAS': '52.2-3',
    'ID': 353938401,
    'NAME': 'Валютный счет, рос.руб.Беларусбанк',
    'CODE': 'RUB',
    'SALDOCURR': 36498763.72
  },
  {
    'ALIAS': '52.2-1',
    'ID': 338061063,
    'NAME': 'Валютный счет, рос.руб.Белинвестбанк',
    'CODE': 'RUB',
    'SALDOCURR': 3327266.8818
  },
  {
    'ALIAS': '52.2-2',
    'ID': 353235818,
    'NAME': 'Валютный счет, рос.руб.Приорбанк',
    'CODE': 'RUB',
    'SALDOCURR': 1845543.61
  },
  {
    'ALIAS': '51',
    'ID': 355100,
    'NAME': 'Расчетный счет',
    'CODE': 'BYN',
    'SALDOCURR': 469365.5028
  },
  {
    'ALIAS': '51-3',
    'ID': 353235866,
    'NAME': 'Расчетный счет Приорбанк',
    'CODE': 'BYN',
    'SALDOCURR': 4591.68
  },
  {
    'ALIAS': '51-1',
    'ID': 338278175,
    'NAME': 'Расчетный счет(Белинвестбанк)',
    'CODE': 'BYN',
    'SALDOCURR': 302531.95
  },
  {
    'ALIAS': '51-4',
    'ID': 353938398,
    'NAME': 'Расчетный счет, Беларусбанк ',
    'CODE': 'BYN',
    'SALDOCURR': 282706.07
  }
];
