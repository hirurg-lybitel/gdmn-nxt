import { Box, Stack } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useExecuteScriptMutation, useGetHistoryQuery } from '../../../features/sql-editor/sqlEditorApi';
import { GridColDef, GridRowId } from '@mui/x-data-grid-pro';
import { parseParams } from './sql-param-parser';
import { MainToolbar, TBButton } from '../../../main-toolbar/main-toolbar';
import { gridComponents, StyledDataGrid } from '../../Styled/styled-data-grid/styled-data-grid';
import { useViewForms } from '../../../features/view-forms-slice/viewFormsHook';
import styles from './sql-editor.module.less';
import command_run_large from './command-run-large.png';
import command_history_large from './command-history-large.png';
import command_undo_large from './command-undo-large.png';
import { StyledSplit, StyledSplitPane } from '../../Styled/styled-split/styled-split';
import { DGrid } from './dgrid';
import { RootState } from '../../../store';
import { useSelector } from 'react-redux';
import { ColorMode } from '@gsbelarus/util-api-types';

interface IHistoryProps {
  onSelectScript: (script: string) => void;
};

const historyColumns: GridColDef[] = [
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

const History = ({ onSelectScript }: IHistoryProps) => {
  const { data, isFetching } = useGetHistoryQuery();
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

  return (
    <StyledDataGrid
      rows={data ?? []}
      columns={historyColumns}
      rowHeight={24}
      columnHeaderHeight={24}
      getRowId={row => row.ID}
      onRowClick={params => onSelectScript(params.row.SQL_TEXT)}
      loading={isFetching}
      disableColumnResize
      disableColumnSelector
      disableMultipleRowSelection
      pagination
      onRowSelectionModelChange={setSelectionModel}
      rowSelectionModel={selectionModel}
      components={gridComponents}
    />
  );
};

/* eslint-disable-next-line */
export interface SqlEditorProps {}

export function SqlEditor(props: SqlEditorProps) {
  type Tab = 'DATA' | 'HISTORY';
  type Param = [string, string];

  useViewForms('SQL Editor');
  const [executeScript, { isLoading, data }] = useExecuteScriptMutation();
  const [currentTab, setCurrentTab] = useState<Tab>('DATA');
  const [script, setScript] = useState('SELECT FIRST 100 * FROM gd_contact WHERE id=:id');
  const [params, setParams] = useState<Param[] | undefined>();
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [prevScript, setPrevScript] = useState('');
  const mode = useSelector((state: RootState) => state.settings.customization.colorMode);

  const handleRunClick = useCallback(() => {
    if (!script) {
      return;
    };

    executeScript({
      script,
      params: params && Object.fromEntries(params)
    });

    if (currentTab !== 'DATA') {
      setCurrentTab('DATA');
    }
  }, [script, params, currentTab]);

  const handleHistoryClick = useCallback(() => {
    if (currentTab === 'DATA') {
      setPrevScript(script);
    }
    setCurrentTab(currentTab === 'HISTORY' ? 'DATA' : 'HISTORY');
  }, [script, currentTab]);

  const handleUndoClick = useCallback(() => {
    setScript(prevScript);
    setPrevScript('');
  }, [prevScript]);

  useEffect(() => {
    const { paramNames } = parseParams(script);

    if (!paramNames) {
      if (params) {
        setParams(undefined);
      }
      return;
    }

    const newParams: Param[] = [];

    for (const name of paramNames) {
      if (!newParams.find(([n]) => n === name)) {
        const p = params?.find(([n]) => n === name);
        if (!p) {
          newParams.push([name, '']);
        } else {
          newParams.push(p);
        }
      }
    }

    const sorted = newParams.sort((a, b) => a[0].localeCompare(b[0]));

    if (JSON.stringify(sorted) !== JSON.stringify(params)) {
      setParams(sorted);
    }
  }, [script, params]);

  return (
    <>
      <MainToolbar>
        <TBButton
          type="LARGE"
          imgSrc={command_run_large}
          caption="Выполнить"
          disabled={isLoading || !script}
          onClick={handleRunClick}
        />
        <TBButton
          type="LARGE"
          imgSrc={command_history_large}
          caption="История"
          disabled={isLoading}
          selected={currentTab === 'HISTORY'}
          onClick={handleHistoryClick}
        />
        <TBButton
          type="LARGE"
          imgSrc={command_undo_large}
          caption="Вернуть"
          disabled={isLoading || !prevScript}
          onClick={handleUndoClick}
        />
      </MainToolbar>
      <Box
        style={{
          height: 'calc(100% - 80px)'
        }}
      >
        <StyledSplit>
          <StyledSplitPane preferredSize="25%" minSize={400}>
            <Stack height="100%" sx={{ borderRight: '1px solid silver' }}>
              <textarea
                className={styles.input}
                spellCheck={false}
                value={script}
                onChange={e => setScript(e.target.value)}
              />
              {
                params
                &&
                <Box sx={{ color: mode === ColorMode.Dark ? 'white' : '', borderTop: '1px solid silver', padding: 1, overflowY: 'scroll' }}>
                  <table className={styles.params}>
                    <thead>
                      <tr><th>Параметр</th><th>Значение</th></tr>
                    </thead>
                    <tbody>
                      {params.map(
                        ([name, value], idx) =>
                          <tr key={name}>
                            <td>{name}</td>
                            <td>
                              <input
                                style={{
                                  background: mode === ColorMode.Dark ? '#616161' : '',
                                  color: mode === ColorMode.Dark ? 'white' : ''
                                }}
                                type="text"
                                value={value}
                                onChange={e => {
                                  const newParams = [...params];
                                  newParams[idx] = [name, e.target?.value ?? ''];
                                  setParams(newParams);
                                }}
                              />
                            </td>
                          </tr>
                      )}
                    </tbody>
                  </table>
                </Box>
              }
            </Stack>
          </StyledSplitPane>
          <StyledSplitPane >
            {
              currentTab === 'DATA'
                ? data &&
                  <DGrid
                    rows={data}
                    isLoading={isLoading}
                    setSelectionModel={setSelectionModel}
                    selectionModel={selectionModel}
                  />
                : <History onSelectScript={setScript} />
            }
          </StyledSplitPane>
        </StyledSplit>
      </Box>
    </>
  );
};

