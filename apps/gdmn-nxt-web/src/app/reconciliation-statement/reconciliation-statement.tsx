import Button from '@mui/material/Button/Button';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { baseURL } from '../const';
import styles from './reconciliation-statement.module.css';

/* eslint-disable-next-line */
export interface ReconciliationStatementProps {}

export function ReconciliationStatement(props: ReconciliationStatementProps) {

  const [data, setData] = useState<any>({});
  const [refresh, setRefresh] = useState(0);

  useEffect( () => {
    axios({ method: 'get', url: '/reconciliation-statement', baseURL, withCredentials: true })
      .then( res => setData(res.data) );
  }, [refresh]);

  return (
    <div>
      {
        data && data.customerDebt ?
          <div className={styles.container}>
            <div className="rs-orders-area">
              <div className="rs-orders-table">
                <table>
                  <thead>
                    <tr><th>Заказ</th><th>Предоплата</th><th>Долг</th></tr>
                  </thead>
                  <tbody>
                    {
                      data?.customerDebt?.map( (d: any) =>
                        <tr key={d['USR$NUMBER']}>
                          <td>{d['USR$NUMBER']}</td>
                          <td>{d['SALDO'] <= 0 ? -d['SALDO'] : undefined}</td>
                          <td>{d['SALDO'] > 0 ? d['SALDO'] : undefined}</td>
                        </tr>
                      )
                    }
                  </tbody>
                    <tr><th>ИТОГО:</th><th></th><th></th></tr>
                    <tr><th colSpan={3}>Долг</th></tr>
                  <tfoot>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="rs-header"></div>
            <div className="rs-title">
              <div className="rs-title-first"></div>
              <div className="rs-title-second"></div>
            </div>
            <div className="rs-main-table"></div>
            <div className="rs-footer">
              <div className="rs-footer-first"></div>
              <div className="rs-footer-second"></div>
              <div className="rs-footer-third"></div>
            </div>
          </div>
        :
          <div>no data</div>
      }

      <pre>
        {JSON.stringify(data, undefined, 2)}
      </pre>
      <Button onClick={ () => setRefresh(refresh + 1) }>Refresh</Button>
    </div>
  );
}

export default ReconciliationStatement;
