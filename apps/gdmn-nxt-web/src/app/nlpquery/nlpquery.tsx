import { Language } from '@gsbelarus/util-api-types';
import { useSelector } from 'react-redux';
import { useParseTextQuery } from '../features/nlp/nlpApi';
import { NLPState } from '../features/nlp/nlpSlice';
import { NLPSentenceTree } from '../nlpsentence-tree/nlpsentence-tree';
import { RootState } from '../store';
import styles from './nlpquery.module.less';

/* eslint-disable-next-line */
export interface NLPQueryProps {}

export function NLPQuery(props: NLPQueryProps) {
  const { currLang, nlpDialog } = useSelector<RootState, NLPState>( state => state.nlp );

  let text = '';
  let language: Language = 'en';
  let command;

  for (let i = nlpDialog.length - 1; !text && i >= 0; i--) {
    if (nlpDialog[i].who === 'me') {
      text = nlpDialog[i].text;
      language = nlpDialog[i].language;
      command = nlpDialog[i].command;
    }
  }

  const { data, error, isFetching } = useParseTextQuery({
    version: '1.0',
    session: '123',
    language,
    text
  }, { skip: !text || !!command })

  return (
    <div className={styles['container']}>
      {
        data?.sents[0] && <NLPSentenceTree nlpSentence={data?.sents[0]} />
      }
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
};
