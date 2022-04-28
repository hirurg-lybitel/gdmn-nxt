import { Box, Button, Divider, Stack, Tab, TextField, Tooltip, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CustomizedCard from '../../customized-card/customized-card';
import styles from './sql-editor.module.less';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useRef, useState } from 'react';
import { useExecuteScriptMutation, useGetHistoryQuery } from '../../../features/sql-editor/sqlEditorApi';
import { DataGridPro, GridColDef, ruRU } from '@mui/x-data-grid-pro';
import { makeStyles, withStyles } from '@mui/styles';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { parseParams } from './sql-param-parser';
import ReportParams from '../../../report-params/report-params';

const useStyles = makeStyles(() => ({
  dataGrid: {
    border: 'none',
    '& ::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
      backgroundColor: 'transparent',
      borderRadius: '6px'
    },
    '& ::-webkit-scrollbar:hover': {
      backgroundColor: '#f0f0f0',
    },
    '& ::-webkit-scrollbar-thumb': {
      position: 'absolute',
      right: 10,
      borderRadius: '6px',
      backgroundColor: 'rgba(170, 170, 170, 0.5)',
    },
    '& ::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#999',
    },
    '&.MuiDataGrid-root .MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus': {
      outline: 'none',
    },
    '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
      padding: '24px',
    },
    '& .MuiDataGrid-columnHeader': {
      fontSize: '1rem',
    },
    '& .MuiDataGrid-cell:hover': {
      cursor: 'pointer'
    }
  },
  tabList: {
    backgroundColor: '#eeeeee'
  },
  tabPanel: {
    flex: 1,
    padding: 0
  },
  dataGridCard: {
    flex: 1,
    display: 'flex',
    borderColor: '#bdbdbd'
  },
}));

/* eslint-disable-next-line */
export interface SqlEditorProps {}

export function SqlEditor(props: SqlEditorProps) {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = useState('1');

  const handleTabsChange = (e: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const [executeScript, { isLoading: resultLoading, data: result, isError: resultIsError }] = useExecuteScriptMutation();
  const { errorMessage } = useSelector((state: RootState) => state.error);

  const [script, setScript] = useState('');
  const [params, setParams] = useState<{[key: string]: any}>({});
  const [reportParamsOpen, setReportParamsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>();

  const handleRunClick = () => {
    const script = inputRef?.current?.value || '';
    setScript(script);

    if (!script) {
      return;
    };

    const p = parseParams(script);

    if (p.paramNames?.length) {
      const newParams: {[key: string]: any} = {};
      p.paramNames.forEach(param => newParams[param] = '');

      setParams(Object.keys(newParams).reduce((obj, key) => ({ ...obj, [key]: params[key] || newParams[key] }), {}));
      setReportParamsOpen(true);

      return;
    };

    executeScript({
      script,
      params
    });

    setTabIndex('1');
  };

  const reportParamsHandlers = {
    handleCancel: async () => setReportParamsOpen(false),
    handleSubmit: async(values: any) => {
      setParams(values);
      setReportParamsOpen(false);

      executeScript({
        script,
        params: values
      });

      setTabIndex('1');
    }
  };


  const Result = () => {
    if (resultIsError) return <Error message={errorMessage} />;

    if (!resultLoading) {
      if (!result) return <></>;
      if (!result.length) return <Error message={'Нет данных'} />;
    };

    let fields: any[] = [];
    if (result?.length) {
      fields = Object.keys(result[0]);
    };

    const columns: GridColDef[] = fields.map(f => ({
      field: f,
      headerName: f,
      minWidth: f.length * (f.length > 10 ? 15 : 35),
    }));

    const handleGetRowId = (row: any) => {
      if (row['ID']) {
        return row.ID;
      };
      for (const key in row) {
        if (row[key]) {
          return row[key];
        };
      };
    };

    return (
      <DataGridPro
        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
        className={classes.dataGrid}
        columns={columns}
        rows={result || []}
        getRowId={handleGetRowId}
        loading={resultLoading}
      />
    );
  };

  const History = () => {
    const { data, isFetching } = useGetHistoryQuery();

    const StyledToolTip = withStyles({
      tooltip: {
        maxWidth: '70%',
      }
    })(Tooltip);

    const columns: GridColDef[] = [
      { field: 'SQL_TEXT', headerName: 'Текст скрипта', flex: 1, sortable: false,
        renderCell: ({ value }) => (
          <StyledToolTip title={value}>
            <div>{value}</div>
          </StyledToolTip>
        )
      },
      { field: 'EDITIONDATE', headerName: 'Дата', width: 200,
        valueGetter: ({ value }) => value && (new Date(value).toLocaleDateString() + ' ' + new Date(value).toLocaleTimeString())
      },
    ];

    return (
      <DataGridPro
        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
        className={classes.dataGrid}
        columns={columns}
        rows={data || []}
        getRowId={row => row.ID}
        loading={isFetching}
        editMode="row"
        disableColumnResize
        onRowDoubleClick={(params) => {
          (document.getElementById('script') as HTMLInputElement).value = params.row['SQL_TEXT'];

          setScript(params.row['SQL_TEXT']);
          setTabIndex('1');
        }}
        disableColumnSelector
      />
    );
  };

  const Error = (props: any) => {
    const { message } = props;
    return (
      <Box p={3}>
        <Typography>{message}</Typography>
      </Box>
    );
  };

  return (
    <Stack
      p={1}
      spacing={3}
      height="100%"
      display="flex"
    >
      <TextField
        id="script"
        multiline
        rows={10}
        placeholder="Input sql code here"
        variant="outlined"
        inputRef={inputRef}
      />
      <Box>
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleRunClick}
        >
          Run
        </Button>
      </Box>
      <CustomizedCard
        borders
        className={classes.dataGridCard}
      >
        <Stack
          direction="column"
          flex={1}
          display="flex"
        >
          <TabContext value={tabIndex}>
            <TabList onChange={handleTabsChange} className={classes.tabList}>
              <Tab label="Результат" value="1" />
              <Tab label="История" value="2" />
            </TabList>
            <Divider />
            <TabPanel value="1" className={classes.tabPanel}>
              <ReportParams
                open={reportParamsOpen}
                params={params}
                onCancelClick={reportParamsHandlers.handleCancel}
                onSubmit={reportParamsHandlers.handleSubmit}
              />
              <Result />
            </TabPanel>
            <TabPanel value="2" className={classes.tabPanel}>
              <History />
            </TabPanel>
          </TabContext>
        </Stack>
      </CustomizedCard>

    </Stack>
  );
}

export default SqlEditor;
