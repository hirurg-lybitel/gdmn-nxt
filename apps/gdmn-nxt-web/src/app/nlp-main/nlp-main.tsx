import { ChatView } from '@gsbelarus/ui-common-dialogs';
import { NLPDialog } from '@gsbelarus/util-api-types';
import Grid from '@mui/material/Grid/Grid';
import { useDispatch, useSelector } from 'react-redux';
import { setNLPDialog } from '../features/nlp/nlpSlice';
import { useViewForms } from '../features/view-forms-slice/viewFormsHook';
import { RootState } from '../store';
import styles from './nlp-main.module.less';

/* eslint-disable-next-line */
export interface NlpMainProps {}

export function NlpMain(props: NlpMainProps) {
  useViewForms('NlpMain');

  const nlpDialog = useSelector<RootState, NLPDialog>( state => state.nlp.nlpDialog );
  const dispatch = useDispatch();

  return (
    <Grid container height="100%" columnSpacing={2}>
      <Grid item xs={2}>
        <ChatView nlpDialog={nlpDialog} setNLPDialog={ nlpDialog => dispatch(setNLPDialog(nlpDialog)) } />
      </Grid>
    </Grid>
  );
}

export default NlpMain;
