import { useGetAllContactsQuery } from '../features/contact/contactApi';
import './customers.module.less';

/* eslint-disable-next-line */
export interface CustomersProps {}

export function Customers(props: CustomersProps) {

  const { data, error, isLoading } = useGetAllContactsQuery();

  return (
    <div>
      <pre>
        {JSON.stringify(data)}
      </pre>
    </div>
  );
}

export default Customers;
