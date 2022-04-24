import { ChatView } from '@gsbelarus/ui-common-dialogs';
import Grid from '@mui/material/Grid/Grid';
import { useDispatch, useSelector } from 'react-redux';
import { NLPState, setNLPDialog, push } from '../features/nlp/nlpSlice';
import { useViewForms } from '../features/view-forms-slice/viewFormsHook';
import NLPQuery from '../nlpquery/nlpquery';
import { RootState } from '../store';

/* eslint-disable-next-line */
export interface NlpMainProps {}

export function NlpMain(props: NlpMainProps) {
  useViewForms('NlpMain');

  const { currLang, nlpDialog } = useSelector<RootState, NLPState>( state => state.nlp );
  const dispatch = useDispatch();

  return (
    <Grid container height="100%" columnSpacing={2}>
      <Grid item xs={2}>
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
  );
}

export default NlpMain;
