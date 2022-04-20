import { ChatView } from '@gsbelarus/ui-common-dialogs';
import Grid from '@mui/material/Grid/Grid';
import { useViewForms } from '../features/view-forms-slice/viewFormsHook';
import styles from './nlp-main.module.less';

/* eslint-disable-next-line */
export interface NlpMainProps {}

export function NlpMain(props: NlpMainProps) {
  useViewForms('NlpMain');

  return (
    <Grid container height="100%" columnSpacing={2}>
      <Grid item xs={12}>
        <ChatView />
      </Grid>
    </Grid>
  );
}

export default NlpMain;
