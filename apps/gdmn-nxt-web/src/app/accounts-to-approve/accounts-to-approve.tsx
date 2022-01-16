import Button from '@mui/material/Button/Button';
import Stack from '@mui/material/Stack/Stack';
import { useGetAllAccountsQuery } from '../features/account/accountApi';
import './accounts-to-approve.module.less';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGridPro, GridColDef, GridToolbar } from '@mui/x-data-grid-pro';
import Switch from '@mui/material/Switch/Switch';

const columns: GridColDef[] = [
  { field: 'COMPANYNAME', headerName: 'Организация', width: 350 },
  { field: 'USR$FIRSTNAME', headerName: 'Имя', width: 250 },
  { field: 'USR$LASTNAME', headerName: 'Фамилия', width: 250 },
  { field: 'USR$POSITION', headerName: 'Должность', width: 250 },
  { field: 'USR$APPROVED', headerName: 'Подтверждение', width: 250,
    renderCell: ({ value }) => <div><Switch checked={value}/></div>
  }
];

/* eslint-disable-next-line */
export interface AccountsToApproveProps {}

export function AccountsToApprove(props: AccountsToApproveProps) {

  const { data, refetch, isFetching } = useGetAllAccountsQuery();
  const accounts = data?.queries.accounts;

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
          loading={isFetching}
          getRowId={row => row.ID}
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </div>
    </Stack>
  );
}

export default AccountsToApprove;
