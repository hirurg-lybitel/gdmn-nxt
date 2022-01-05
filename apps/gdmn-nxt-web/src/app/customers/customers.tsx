import { useGetAllContactsQuery } from '../features/contact/contactApi';
import './customers.module.less';

/* eslint-disable-next-line */
export interface CustomersProps {}

export function Customers(props: CustomersProps) {

  const { data, error, isLoading } = useGetAllContactsQuery();

  return (
    <div>
      <h1>Welcome to Customers!</h1>
    </div>
  );
}

export default Customers;
