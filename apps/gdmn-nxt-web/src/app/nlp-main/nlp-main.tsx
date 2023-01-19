import { ChatView } from '@gsbelarus/ui-common-dialogs';
import Grid from '@mui/material/Grid/Grid';
import { useDispatch, useSelector } from 'react-redux';
import { setNLPDialog, pushNLPDialogItem } from '../features/nlp/nlpSlice';
import { useViewForms } from '../features/view-forms-slice/viewFormsHook';
import { MainToolbar, TBButton } from '../main-toolbar/main-toolbar';
import { NLPQuery } from '../nlpquery/nlpquery';
import { RootState } from '../store';
import dialog from './dialog.png';
import db_data from './db-data.png';
import { useState } from 'react';
import { useExecuteScriptMutation } from '../features/sql-editor/sqlEditorApi';

/* eslint-disable-next-line */
export interface NlpMainProps {}

export function NlpMain(props: NlpMainProps) {
  type Tab = 'DIALOG' | 'DATA';

  const [executeScript, { isLoading, data }] = useExecuteScriptMutation();
  const [currentTab, setCurrentTab] = useState<Tab>('DIALOG');

  useViewForms('NlpMain');

  const nlpDialog = useSelector((state: RootState) => state.nlp.nlpDialog);
  const dispatch = useDispatch();

  return (
    <>
      <MainToolbar>
        <TBButton
          type="LARGE"
          imgSrc={dialog}
          caption="Текст"
          selected={currentTab === 'DIALOG'}
          onClick={() => setCurrentTab('DIALOG')}
        />
        <TBButton
          type="LARGE"
          imgSrc={db_data}
          caption="SQL запрос"
          selected={currentTab === 'DATA'}
          onClick={() => setCurrentTab('DATA')}
        />
      </MainToolbar>
      <Grid container columnSpacing={2} wrap="nowrap" style={{ height: 'calc(100% - 80px)' }}>
        <Grid item xs={2} sx={{ borderRight: '1px solid silver', minWidth: 200 }}>
          <ChatView
            nlpDialog={nlpDialog}
            setNLPDialog={nlpDialog => dispatch(setNLPDialog(nlpDialog))}
            push={(who: string, text: string) => dispatch(pushNLPDialogItem({ who, text }))}
          />
        </Grid>
        <Grid item xs={10}>
          {
            currentTab === 'DIALOG'
              ? <NLPQuery />
              : null
          }
        </Grid>
      </Grid>
    </>
  );
};

