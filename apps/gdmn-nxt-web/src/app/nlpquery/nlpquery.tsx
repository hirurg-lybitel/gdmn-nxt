import { INLPToken, Language } from '@gsbelarus/util-api-types';
import Grid from '@mui/material/Grid/Grid';
import Stack from '@mui/material/Stack/Stack';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetErModelQuery } from '../features/er-model/erModelApi';
import { useParseTextQuery } from '../features/nlp/nlpApi';
import { NLPState, pushNLPDialogItem } from '../features/nlp/nlpSlice';
import { NLPSentenceTree } from '../nlpsentence-tree/nlpsentence-tree';
import { RootState } from '../store';
import styles from './nlpquery.module.less';

/* eslint-disable-next-line */
export interface NLPQueryProps {}

export function NLPQuery(props: NLPQueryProps) {
  const { nlpDialog } = useSelector<RootState, NLPState>(state => state.nlp);
  const dispatch = useDispatch();
  const [token, setToken] = useState<INLPToken | undefined>();

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

  const { data: erModel } = useGetErModelQuery();
  const { data, error, isFetching } = useParseTextQuery({
    version: '1.0',
    session: '123',
    fullDbName: erModel?.fullDbName ?? '',
    language,
    text
  }, { skip: !text || !!command || !erModel });

  useEffect(() => {
    if (isFetching) {
      if (token) {
        setToken(undefined);
      }
    } else if (!token && data?.sents[0]?.tokens[0]) {
      setToken(data?.sents[0]?.tokens[0]);
    }
  }, [data, isFetching]);

  useEffect(() => {
    const text = (error as any)?.error;
    if (typeof text === 'string') {
      dispatch(pushNLPDialogItem({ who: 'it', text }));
    }
  }, [error]);

  const getMorphRow = (token?: INLPToken) => {
    const c: ([string, string] | null)[] = token?.morph ? Object.entries(token.morph) : [];
    while (c.length < 8) {
      c.push(null);
    }
    return c.map((m, idx) => m ? <td key={m[0]}><span>{m[0]}{':'}</span>{m[1]}</td> : <td key={idx}>&nbsp;</td>);
  };
  const mode = useSelector((state: RootState) => state.settings.customization.mode);
  return (
    <Grid container height="100%" columnSpacing={0}>
      <Grid item xs={8}>
        <div className={styles.middle_container}>
          <div className={mode === 'dark' ? styles.tree_headDark : styles.tree_head}>
            <Stack width="100%" direction="row" flexWrap="wrap" gap={1} paddingTop={1}>
              {data?.sents?.flatMap (
                sent => sent.tokens.map(t =>
                  <span key={t.id} className={styles[t === token ? 'selected' : 'word']} onClick={() => setToken(t)}>
                    {t.token}
                  </span>
                )
              )}
            </Stack>

            <table className={styles.table}>
              <tbody>
                <tr>
                  <td>
                    <span>Id:</span>{token?.id}
                  </td>
                  <td>
                    <span>Start:</span>{token?.start}
                  </td>
                  <td>
                    <span>Token:</span>{token?.token}
                  </td>
                  <td>
                    <span>Lemma:</span>{token?.lemma}
                  </td>
                  <td>
                    <span>Tag:</span>{token?.tag}
                  </td>
                  <td>
                    <span>Shape:</span>{token?.shape}
                  </td>
                  <td />
                  <td />
                </tr>
                <tr>
                  <td>
                    <span>Dep:</span>{token?.dep}
                  </td>
                  <td>
                    <span>Ent:</span>{token?.ent_type}
                  </td>
                  <td>
                    <span>POS:</span>{token?.pos}
                  </td>
                  <td>
                    <span>Stop:</span>{token?.is_stop ? '☑' : '☐'}
                  </td>
                  <td>
                    <span>Alpha:</span>{token?.is_alpha ? '☑' : '☐'}
                  </td>
                  <td>
                    <span>Digit:</span>{token?.is_digit ? '☑' : '☐'}
                  </td>
                  <td>
                    <span>Currency:</span>{token?.is_currency ? '☑' : '☐'}
                  </td>
                  <td>
                    <span>Bracket:</span>{token?.is_bracket ? '☑' : '☐'}
                  </td>
                </tr>
                <tr>
                  {getMorphRow(token)}
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.tree_stack}>
            {
              data?.sents.map(
                sent =>
                  <NLPSentenceTree
                    key={sent.text}
                    nlpSentence={sent}
                    selectedToken={token}
                    onClick={id => setToken(sent.tokens.find(t => t.id.toString() === id))}
                  />
              )
            }
          </div>
        </div>
      </Grid>
      <Grid item xs={4}>
        <div className={styles.container}>
          <pre className={styles.pre}>
            {
              isFetching ?
                'Fetching...'
                :
                JSON.stringify(data ?? error, undefined, 2)
            }
          </pre>
        </div>
      </Grid>
    </Grid>
  );
};
