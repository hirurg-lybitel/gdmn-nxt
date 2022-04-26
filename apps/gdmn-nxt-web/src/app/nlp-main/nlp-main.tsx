import { ChatView } from '@gsbelarus/ui-common-dialogs';
import Grid from '@mui/material/Grid/Grid';
import { useDispatch, useSelector } from 'react-redux';
import { NLPState, setNLPDialog, push } from '../features/nlp/nlpSlice';
import { useViewForms } from '../features/view-forms-slice/viewFormsHook';
import { MainToolbar } from '../main-toolbar/main-toolbar';
import { NLPQuery } from '../nlpquery/nlpquery';
import { RootState } from '../store';

/* eslint-disable-next-line */
export interface NlpMainProps {}

export function NlpMain(props: NlpMainProps) {
  useViewForms('NlpMain');

  const { currLang, nlpDialog } = useSelector<RootState, NLPState>( state => state.nlp );
  const dispatch = useDispatch();

  return (
    <>
      <MainToolbar />
      <Grid container columnSpacing={2} wrap="nowrap" style={{ height: 'calc(100% - 80px)' }}>
        <Grid item xs={2} sx={{ borderRight: '1px solid silver', minWidth: 200 }}>
          <ChatView
            currLang={currLang}
            nlpDialog={nlpDialog}
            setNLPDialog={ nlpDialog => dispatch(setNLPDialog(nlpDialog)) }
            push={ (who: string, text: string) => dispatch(push({ who, text })) }
          />
        </Grid>
        <Grid item xs={10}>
          <NLPQuery />
        </Grid>
      </Grid>
    </>
  );
};

