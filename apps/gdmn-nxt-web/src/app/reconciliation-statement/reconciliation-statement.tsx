import { useMemo, Fragment } from 'react';
import styles from './reconciliation-statement.module.less';
import numberToWordsRu from 'number-to-words-ru';
import { useGetReconciliationStatementQuery } from '../features/reconciliation-statement/reconciliationStatementApi';
import { CircularIndeterminate } from '../components/circular-indeterminate/circular-indeterminate';
import { Box } from '@mui/material';

const shortenName = (s: string) => {
  const arr = s.split(' ')
    .map(l => l.trim())
    .filter(Boolean)
    .filter((_, idx) => idx < 3)
    .map((l, idx) => idx ? l.substring(0, 1).toUpperCase() : l);
  return arr.length === 2 ? `${arr[1]}. ${arr[0]}` : `${arr[1]}. ${arr[2]}. ${arr[0]}`;
};

const skipPatrName = (s: string) => s.split(' ')
  .map(l => l.trim())
  .filter(Boolean)
  .filter((_, idx) => idx < 2)
  .join(' ');

const formatValue = (rec: any, rs: string, fld: string, schema: any) => {
  const fldDef = schema?.[rs]?.[fld];

  if (fldDef) {
    if (typeof rec === 'object') {
      if (fldDef.type === 'date' && rec[fld] instanceof Date) {
        return rec[fld].toLocaleDateString('ru-BE');
      }

      if (fldDef.type === 'date' && typeof rec[fld] === 'number') {
        return new Date(rec[fld]).toLocaleDateString('ru-BE');
      }

      if (fldDef.type === 'curr' && typeof rec[fld] === 'number') {
        return new Intl.NumberFormat('ru-BE', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(rec[fld]);
      }
    } else {
      if (fldDef.type === 'date' && rec instanceof Date) {
        return rec.toLocaleDateString('ru-BE');
      }

      if (fldDef.type === 'date' && typeof rec === 'number') {
        return new Date(rec).toLocaleDateString('ru-BE');
      }

      if (fldDef.type === 'curr' && typeof rec === 'number') {
        return new Intl.NumberFormat('ru-BE', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(rec);
      }
    }
  } else {
    return rec[fld];
  }
};

/* eslint-disable-next-line */
export interface ReconciliationStatementProps {
  custId: number;
  dateBegin?: Date | null;
  dateEnd?: Date | null;
}

export function ReconciliationStatement({ custId, dateBegin, dateEnd }: ReconciliationStatementProps) {
  const { data, isFetching } = useGetReconciliationStatementQuery({
    custId,
    dateBegin: dateBegin ? dateBegin : new Date(2021, (new Date()).getMonth(), 1),
    dateEnd: dateEnd ? dateEnd : new Date(2021, (new Date()).getMonth() + 1, 1)
  });
  const params = data?._params?.[0];
  const schema = data?._schema;

  const { giveSum, giveSum2, saldo, saldoEnd, customerName, ourName, accountantName, written } = useMemo(() => {
    const giveSum = data?.queries.movement?.reduce((p: number, l: any) => p + (l.GIVESUM ?? 0), 0) ?? 0;
    const giveSum2 = data?.queries.movement?.reduce((p: number, l: any) => p + (l.GIVESUM2 ?? 0), 0);
    const saldo = data?.queries.saldo?.[0]?.SALDO ?? 0;
    const saldoEnd = saldo + giveSum2 - giveSum;
    return {
      giveSum,
      giveSum2,
      saldo,
      saldoEnd,
      customerName: data?.queries.customerAct?.[0]?.CUSTOMER,
      ourName: data?.queries.firm?.[0]?.NAME ?? '',
      accountantName: data?.queries.firm?.[0]?.ACCOUNT ?? '',
      written: numberToWordsRu.convert(Math.abs(saldoEnd), {
        currency: 'rub',
        declension: 'nominative',
        roundNumber: -1,
        convertMinusSignToWord: true,
        showNumberParts: {
          integer: true,
          fractional: true,
        },
        convertNumbertToWords: {
          integer: true,
          fractional: false,
        },
        showCurrency: {
          integer: true,
          fractional: true,
        },
      })
    };
  }, [data]);

  const fv = (rec: any, rs: string, fld: string) => formatValue(rec, rs, fld, schema);

  return (
    <Box>
      {
        data?.queries.customerDebt ?
          <div className={styles.container}>
            <div className={styles['rs-orders-area']}>
              <div className={styles['rs-orders-table']}>
                <table>
                  <thead>
                    <tr><th>Заказ</th><th>Предоплата</th><th>Долг</th></tr>
                  </thead>
                  <tbody>
                    {
                      data?.queries.customerDebt?.map((d: any, idx) =>
                        <tr key={idx}>
                          <td>{d.USR$NUMBER}</td>
                          <td>{d.SALDO <= 0 ? fv(-d.SALDO, 'customerDebt', 'SALDO') : undefined}</td>
                          <td>{d.SALDO > 0 ? fv(d, 'customerDebt', 'SALDO') : undefined}</td>
                        </tr>
                      )
                    }
                  </tbody>
                  <tfoot>
                    <tr><th>ИТОГО:</th><th /><th /></tr>
                    <tr><th colSpan={3}>Долг</th></tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className={styles['rs-header']}>
              <table>
                <colgroup>
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '55%' }} />
                </colgroup>
                <thead>
                  <tr>
                    {['Дата акта сверки', 'Сумма долга', 'Исполнитель', 'Описание'].map(s => <th key={s}>{s}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data?.queries.customerAct?.map(
                    (r: any, idx) =>
                      <tr key={idx}>
                        <td>{fv(r, 'customerAct', 'DOCUMENTDATE')}</td>
                        <td>{r.SUMACT}</td>
                        <td>{skipPatrName(r.EMPLNAME)}</td>
                        <td>{r.USR$DESCRIPTION}</td>
                      </tr>)
                  }
                </tbody>
              </table>
            </div>
            <div className={styles['rs-title']}>
              <div className={styles['rs-title-first']}>
                <div>Предприятие БелГИСС</div>
                <div>Заказ: Все</div>
              </div>
              <div className={styles['rs-title-second']}>
                <div>АКТ СВЕРКИ</div>
                <div>{`взаимных расчетов между ${ourName} и ${customerName}`}</div>
                <div>{`с ${fv(params, '_params', 'dateBegin')} по ${fv(params, '_params', 'dateEnd')}`}</div>
              </div>
            </div>
            <div className={styles['rs-main-table']}>
              <table>
                <thead>
                  <tr>
                    <th>Номер</th>
                    <th>Дата</th>
                    <th colSpan={2}>Документ</th>
                    <th>Акт</th>
                    <th>Оплаты</th>
                  </tr>
                  <tr>
                    <th colSpan={4} style={{ textAlign: 'left' }}>Сальдо на начало:</th>
                    <th>{saldo > 0 ? saldo : null}</th>
                    <th>{saldo < 0 ? saldo : null}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...new Set(data.queries.movement.map((m: any) => m.JOBNUMBER))].map((j: any, idx) => {
                    const filtered = data.queries.movement.filter((m: any) => m.JOBNUMBER === j);

                    return (
                      <Fragment key={idx}>
                        <tr>
                          <td colSpan={6}>{j}</td>
                        </tr>
                        {
                          filtered.map((l: any, i) =>
                            <tr key={i}>
                              <td>{l.NUMBER}</td>
                              <td>{l.DOCUMENTDATE}</td>
                              <td>{l.ALIAS}</td>
                              <td>{l.NAME} {l.DESCRIPTION ? `(${l.DESCRIPTION})` : null}</td>
                              <td>{l.GIVESUM2 || null}</td>
                              <td>{l.GIVESUM || null}</td>
                            </tr>
                          )
                        }
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'right' }}>{`Итого по ${j}:`}</td>
                          <td>{filtered.reduce((p: number, l: any) => p + (l.GIVESUM2 ?? 0), 0) || null}</td>
                          <td>{filtered.reduce((p: number, l: any) => p + (l.GIVESUM ?? 0), 0) || null}</td>
                        </tr>
                      </Fragment>
                    );
                  }
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4}>{'Оборот:'}</td>
                    <td>{giveSum2 || null}</td>
                    <td>{giveSum || null}</td>
                  </tr>
                  <tr>
                    <th colSpan={4} style={{ textAlign: 'left' }}>Сальдо на конец:</th>
                    <th>{saldoEnd > 0 ? saldoEnd : null}</th>
                    <th>{saldoEnd < 0 ? saldoEnd : null}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className={styles['rs-footer']}>
              {
                saldoEnd ?
                  <div className={styles['rs-footer-first']}>
                    Долг за {saldoEnd > 0 ? customerName : ourName} на ... составляет <span style={{ borderBottom: '1px solid black' }}>{Math.abs(saldoEnd)}</span>
                    <p/>
                    ({written})
                  </div>
                  :
                  null
              }
              <div className={styles['rs-footer-second']}>
                <table>
                  <thead>
                    <tr>
                      <th>{ourName}</th>
                      <th>{customerName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div>
                          <div>
                            <div>Главный бухгалтер</div>
                            <div>должность</div>
                          </div>
                          <div>
                            <div>&nbsp;</div>
                            <div>подпись</div>
                          </div>
                          <div>
                            <div>{shortenName(accountantName)}</div>
                            <div>расшифровка подписи</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div>
                            <div>Главный бухгалтер</div>
                            <div>должность</div>
                          </div>
                          <div>
                            <div>&nbsp;</div>
                            <div>подпись</div>
                          </div>
                          <div>
                            <div>&nbsp;</div>
                            <div>расшифровка подписи</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={styles['rs-footer-third']} />
            </div>
          </div>
          :
          <CircularIndeterminate open={isFetching}/>
      }
    </Box>
  );
}

export default ReconciliationStatement;
