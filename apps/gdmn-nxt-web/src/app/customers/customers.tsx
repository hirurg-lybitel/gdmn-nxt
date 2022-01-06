import { useGetAllContactsQuery } from '../features/contact/contactApi';
import { DataGridPro, GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import './customers.module.less';

const rows: GridRowsProp = [
  { id: 1, col1: 'Hello', col2: 'World' },
  { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
  { id: 3, col1: 'MUI', col2: 'is Amazing' },
];

const columns: GridColDef[] = [
  { field: 'col1', headerName: 'Column 1', width: 150 },
  { field: 'col2', headerName: 'Column 2', width: 150 },
];

/* eslint-disable-next-line */
export interface CustomersProps {}

export function Customers(props: CustomersProps) {

  const { data, error, isLoading } = useGetAllContactsQuery();

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <DataGridPro rows={rows} columns={columns} />
    </div>
  );
}

export default Customers;
