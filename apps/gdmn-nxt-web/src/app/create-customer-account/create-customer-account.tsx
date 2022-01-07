import { useGetContactByTaxIdQuery } from '../features/contact/contactApi';
import './create-customer-account.module.less';

/* eslint-disable-next-line */
export interface CreateCustomerAccountProps {}

export function CreateCustomerAccount(props: CreateCustomerAccountProps) {

  const { data, isLoading } = useGetContactByTaxIdQuery({ taxId: '600411078' });

  return (
    <div>
      <h1>Welcome to CreateCustomerAccount!</h1>
      {
        JSON.stringify(data, undefined, 2)
      }
    </div>
  );
}

export default CreateCustomerAccount;
