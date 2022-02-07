import Customers from '../../../customers/customers';
import './customers-list.module.less';

/* eslint-disable-next-line */
export interface CustomersListProps {}

export function CustomersList(props: CustomersListProps) {
  return (
    <Customers />
  );
}

export default CustomersList;
