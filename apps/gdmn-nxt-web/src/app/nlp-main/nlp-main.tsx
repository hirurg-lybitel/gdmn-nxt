import { ChatView } from '@gsbelarus/ui-common-dialogs';
import { NLPDialog } from '@gsbelarus/util-api-types';
import Grid from '@mui/material/Grid/Grid';
import { useState } from 'react';
import { useViewForms } from '../features/view-forms-slice/viewFormsHook';
import styles from './nlp-main.module.less';

/* eslint-disable-next-line */
export interface NlpMainProps {}

export function NlpMain(props: NlpMainProps) {
  useViewForms('NlpMain');
  const [nlpDialog, setNLPDialog] = useState<NLPDialog>([]);

  return (
    <Grid container height="100%" columnSpacing={2}>
      <Grid item xs={2}>
        <ChatView nlpDialog={nlpDialog} setNLPDialog={setNLPDialog} />
      </Grid>
    </Grid>
  );
}

export default NlpMain;
