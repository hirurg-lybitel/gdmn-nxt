import Button from '@mui/material/Button/Button';
import Stack from '@mui/material/Stack/Stack';
import { useGetAllAccountsQuery, useUpdateAccountMutation } from '../features/account/accountApi';
import './accounts-to-approve.module.less';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGridPro, GridColDef, GridRowId, GridToolbar } from '@mui/x-data-grid-pro';
import Switch from '@mui/material/Switch/Switch';
import Snackbar from '@mui/material/Snackbar/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert/Alert';
import { useEffect, useState } from 'react';
import { QueryStatus } from '@reduxjs/toolkit/dist/query';

/* eslint-disable-next-line */
export interface AccountsToApproveProps {}

export function AccountsToApprove(props: AccountsToApproveProps) {
  const [alert, setAlert] = useState<{ message: string, severity: AlertColor } | null>(null);
  const { data, refetch, isFetching } = useGetAllAccountsQuery();
  const [updateAccount, { error, isSuccess, isError, isLoading, status }] = useUpdateAccountMutation();
  const accounts = data?.queries.accounts;

  useEffect( () => {
    if (!isLoading && status !== QueryStatus.uninitialized) {
      if (isError) {
        setAlert({ message: (error as any).message ?? (error as any).error ?? (error as any).status ?? 'Unknown error', severity: 'error' });
      } else {
        setAlert({ message: 'Запись успешно обновлена', severity: 'success' });
      }
    }
  }, [error, isSuccess, isError, isLoading, status]);

  const handleAlertClose = () => setAlert(null);

  const gridRowId2Id = (id: GridRowId) => typeof id === 'number' ? id : parseInt(id);

  const columns: GridColDef[] = [
    { field: 'COMPANYNAME', headerName: 'Организация', width: 350 },
    { field: 'USR$FIRSTNAME', headerName: 'Имя', width: 250 },
    { field: 'USR$LASTNAME', headerName: 'Фамилия', width: 250 },
    { field: 'USR$POSITION', headerName: 'Должность', width: 250 },
    { field: 'USR$APPROVED', headerName: 'Подтверждение', width: 250,
      renderCell: ({ value, id }) => <Switch checked={!!value} onChange={ () => updateAccount({ ID: gridRowId2Id(id), USR$APPROVED: !value }) }/>
    }
  ];

  return (
    <Stack direction="column">
      <Stack direction="row">
        <Button onClick={ refetch } disabled={isFetching} startIcon={<RefreshIcon/>}>Обновить</Button>
      </Stack>
      <div style={{ width: '100%', height: '800px' }}>
        <DataGridPro
          rows={accounts ?? []}
          columns={columns}
          pagination
          disableMultipleSelection
          loading={isFetching || isLoading}
          getRowId={row => row.ID}
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </div>
      {
        alert &&
        <Snackbar open autoHideDuration={alert.severity === 'error' ? undefined : 5000} onClose={handleAlertClose}>
          <Alert onClose={handleAlertClose} variant="filled" severity={alert.severity}>{alert.message}</Alert>
        </Snackbar>
      }
    </Stack>
  );
}

export default AccountsToApprove;
