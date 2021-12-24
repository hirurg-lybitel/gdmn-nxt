import Button from '@mui/material/Button/Button';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { baseURL } from '../const';
import './reconciliation-statement.module.less';

/* eslint-disable-next-line */
export interface ReconciliationStatementProps {}

export function ReconciliationStatement(props: ReconciliationStatementProps) {

  const [data, setData] = useState({});
  const [refresh, setRefresh] = useState(0);

  useEffect( () => {
    axios({ method: 'get', url: '/reconciliation-statement', baseURL, withCredentials: true })
      .then( res => setData(res.data) );
  }, [refresh]);

  return (
    <div>
      <pre>
        {JSON.stringify(data, undefined, 2)}
      </pre>
      <Button onClick={ () => setRefresh(refresh + 1) }>Refresh</Button>
    </div>
  );
}

export default ReconciliationStatement;
