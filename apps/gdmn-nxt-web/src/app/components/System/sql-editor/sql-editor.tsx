import { Alert, createSvgIcon, Grid, Snackbar } from '@mui/material';
import { createElement, useRef, useState } from 'react';
import { useExecuteScriptMutation, useGetHistoryQuery } from '../../../features/sql-editor/sqlEditorApi';
import { GridColDef, GridRowId } from '@mui/x-data-grid-pro';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { parseParams } from './sql-param-parser';
import ReportParams from '../../../report-params/report-params';
import { MainToolbar, TBButton } from '../../../main-toolbar/main-toolbar';
import { CustomPagination, StyledDataGrid } from '../../styled-data-grid/styled-data-grid';
import { useViewForms } from '../../../features/view-forms-slice/viewFormsHook';
import styles from './sql-editor.module.less';
import { clearError } from '../../../features/error-slice/error-slice';
import command_run_large from './command-run-large.png';
import command_history_large from './command-history-large.png';
import command_undo_large from './command-undo-large.png';
import { gdmnTheme } from '../../../theme/gdmn-theme';

interface IHistoryProps {
  onSelectScript: (script: string) => void;
};

const History = ({ onSelectScript }: IHistoryProps) => {
  const { data, isFetching } = useGetHistoryQuery();
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

  const columns: GridColDef[] = [
    {
      field: 'SQL_TEXT',
      headerName: 'Текст скрипта',
      flex: 1,
      sortable: false,
    },
    {
      field: 'EDITIONDATE',
      headerName: 'Дата',
      width: 200,
      valueGetter: ({ value }) => value && (new Date(value).toLocaleDateString() + ' ' + new Date(value).toLocaleTimeString())
    },
  ];

  return (
    <StyledDataGrid
      getRowId={row => row.ID}
      disableColumnResize
      onRowClick={ (params) => onSelectScript(params.row['SQL_TEXT']) }
      disableColumnSelector
      rows={data ?? []}
      columns={columns}
      pagination
      loading={isFetching}
      onSelectionModelChange={setSelectionModel}
      selectionModel={selectionModel}
      rowHeight={24}
      headerHeight={24}
      editMode='row'
      disableMultipleSelection
      components={{
        Pagination: CustomPagination,
        ColumnResizeIcon: createSvgIcon(createElement("path",{d:"M11 24V0h2v24z"}),"Separator2")
      }}
    />
  );
};

type Tab = 'DATA' | 'HISTORY';

/* eslint-disable-next-line */
export interface SqlEditorProps {}

export function SqlEditor(props: SqlEditorProps) {
  useViewForms('SQL Editor');
  const [tabIndex, setTabIndex] = useState<Tab>('DATA');
  const [executeScript, { isLoading, data }] = useExecuteScriptMutation();
  const errorMessage = useSelector<RootState, string>( state => state.error.errorMessage );
  const dispatch = useDispatch();
  const [script, setScript] = useState('');
  const [params, setParams] = useState<{[key: string]: any}>({});
  const [reportParamsOpen, setReportParamsOpen] = useState(false);
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [prevScript, setPrevScript] = useState('');

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleRunClick = () => {
    const script = inputRef.current?.value ?? '';
    setScript(script);

    if (!script) {
      return;
    };

    const p = parseParams(script);

    if (p.paramNames?.length) {
      setParams({ ...Object.fromEntries( p.paramNames.map( param => ([param, '']) ) ), ...params });
      setReportParamsOpen(true);
      return;
    };

    executeScript({
      script,
      params
    });

    if (tabIndex !== 'DATA') {
      setTabIndex('DATA');
    }
  };

  const reportParamsHandlers = {
    handleCancel: () => setReportParamsOpen(false),
    handleSubmit: (values: any) => {
      setParams(values);
      setReportParamsOpen(false);

      executeScript({
        script,
        params: values
      });

      if (tabIndex !== 'DATA') {
        setTabIndex('DATA');
      }
    }
  };

  const fields = data?.length ? Object.keys(data[0]) : [];
  const columns: GridColDef[] = fields.map(f => ({
    field: f,
    headerName: f,
    minWidth: f.length * (f.length > 10 ? 15 : 35),
  }));

  return (
    <>
      <ReportParams
        open={reportParamsOpen}
        params={params}
        onCancelClick={reportParamsHandlers.handleCancel}
        onSubmit={reportParamsHandlers.handleSubmit}
      />
      <MainToolbar>
        <TBButton
          type="LARGE"
          imgSrc={command_run_large}
          caption="Execute"
          disabled={isLoading}
          onClick={handleRunClick}
        />
        <TBButton
          type="LARGE"
          imgSrc={command_history_large}
          caption="History"
          disabled={isLoading}
          selected={tabIndex === 'HISTORY'}
          onClick={ () => setTabIndex(tabIndex === 'HISTORY' ? 'DATA' : 'HISTORY') }
        />
        <TBButton
          type="LARGE"
          imgSrc={command_undo_large}
          caption="Prev"
          disabled={isLoading || !prevScript}
          onClick={ () => { setScript(prevScript); setPrevScript(''); } }
        />
      </MainToolbar>
      <Grid container height="calc(100% - 80px)" columnSpacing={2}>
        <Grid item xs={3}>
          <textarea
            className={styles['input']}
            spellCheck={false}
            rows={10}
            placeholder="SELECT FIRST 100 * FROM gd_contact WHERE 1=1"
            ref={inputRef}
          />
        </Grid>
        <Grid item xs={9}>
          {
            tabIndex === 'DATA'
              ? data &&
                <StyledDataGrid
                  rows={data}
                  columns={columns}
                  pagination
                  loading={isLoading}
                  onSelectionModelChange={setSelectionModel}
                  selectionModel={selectionModel}
                  rowHeight={24}
                  headerHeight={24}
                  editMode='row'
                  components={{
                    Pagination: CustomPagination,
                    ColumnResizeIcon: createSvgIcon(createElement("path",{d:"M11 24V0h2v24z"}),"Separator2")
                  }}
                />
              : <History
                  onSelectScript={ s => {
                    if (inputRef.current) {
                      inputRef.current.value = s;
                    }
                    setScript(s);
                  }}
                />
          }
        </Grid>
        {
          errorMessage &&
          <Grid item xs={12}>
            <Snackbar open autoHideDuration={5000} onClose={() => dispatch(clearError())}>
              <Alert variant="filled" severity="error">{errorMessage}</Alert>
            </Snackbar>
          </Grid>
        }
      </Grid>
    </>
  );
};

