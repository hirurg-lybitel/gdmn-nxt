import { useGetAllContactsQuery } from '../features/contact/contactApi';
import { DataGridPro, GridColDef, GridToolbar } from '@mui/x-data-grid-pro';
import './customers.module.less';
import Stack from '@mui/material/Stack/Stack';
import Button from '@mui/material/Button/Button';

const columns: GridColDef[] = [
  { field: 'NAME', headerName: 'Name', width: 350 },
  { field: 'PHONE', headerName: 'Phone', width: 250 },
  { field: 'FOLDERNAME', headerName: 'Folder', width: 250 },
];

/* eslint-disable-next-line */
export interface CustomersProps {}

export function Customers(props: CustomersProps) {

  const { data, error, isLoading, refetch } = useGetAllContactsQuery();

  return (
    <Stack direction="column">
      <Stack direction="row">
        <Button onClick={refetch} disabled={isLoading}>Refetch</Button>
        <Button onClick={ () => {} } disabled={isLoading}>Акт сверки</Button>
      </Stack>
      <div style={{ width: '100%', height: '800px' }}>
        <DataGridPro
          rows={data?.contacts ?? []}
          columns={columns}
          pagination
          loading={isLoading}
          getRowId={row => row.ID}
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </div>
    </Stack>
  );
}

export default Customers;
