import { NLPDialog } from '@gsbelarus/util-api-types';
import { useSelector } from 'react-redux';
import { useParseTextQuery } from '../features/nlp/nlpApi';
import { RootState } from '../store';
import styles from './nlpquery.module.less';

/* eslint-disable-next-line */
export interface NLPQueryProps {}

export function NLPQuery(props: NLPQueryProps) {
  const nlpDialog = useSelector<RootState, NLPDialog>( state => state.nlp.nlpDialog );

  let text = '';

  for (let i = nlpDialog.length - 1; !text && i >= 0; i--) {
    if (nlpDialog[i].who === 'me') {
      text = nlpDialog[i].text;
    }
  }

  const { data, error, isFetching } = useParseTextQuery({
    version: '1.0',
    session: '123',
    text
  }, { skip: !text })

  return (
    <div className={styles['container']}>
      <pre className={styles['pre']}>
        {
          isFetching ?
            'Fetching...'
          :
          JSON.stringify(data ?? error, undefined, 2)
        }
      </pre>
    </div>
  );
}

export default NLPQuery;
