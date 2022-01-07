import { useGetAllContactsQuery } from '../features/contact/contactApi';
import { DataGridPro, GridColDef, GridToolbar } from '@mui/x-data-grid-pro';
import './customers.module.less';

const columns: GridColDef[] = [
  { field: 'NAME', headerName: 'Name', width: 350 },
  { field: 'PHONE', headerName: 'Phone', width: 250 },
  { field: 'FOLDERNAME', headerName: 'Folder', width: 250 },
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
        components={{
          Toolbar: GridToolbar,
        }}
      />
    </div>
  );
}

export default Customers;
