import { useGetAllContactsQuery } from '../features/contact/contactApi';
import { DataGridPro, GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import './customers.module.less';

/*
const rows: GridRowsProp = [
  { id: 1, col1: 'Hello', col2: 'World' },
  { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
  { id: 3, col1: 'MUI', col2: 'is Amazing' },
];
*/

const columns: GridColDef[] = [
  { field: 'NAME', headerName: 'Name', width: 350 },
  { field: 'PHONE', headerName: 'Phone', width: 250 },
];

/* eslint-disable-next-line */
export interface CustomersProps {}

export function Customers(props: CustomersProps) {

  const { data, error, isLoading } = useGetAllContactsQuery();

  return (
    <div style={{ width: '100%', height: '800px' }}>
      <DataGridPro
        rows={data?.contacts ?? []}
        columns={columns}
        pagination
        loading={!data?.contacts}
        getRowId={row => row.ID}
      />
    </div>
  );
}

export default Customers;
