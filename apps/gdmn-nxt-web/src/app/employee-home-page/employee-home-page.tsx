import { useState } from 'react';
import AccountsToApprove from '../accounts-to-approve/accounts-to-approve';
import Customers from '../customers/customers';
import { MenuItem, PageHeader } from '../page-header/page-header';
import './employee-home-page.module.less';

type Pages = 'CUSTOMERS' | 'ACCOUNTS_TO_APPROVE';

/* eslint-disable-next-line */
export interface EmployeeHomePageProps {}

export function EmployeeHomePage(props: EmployeeHomePageProps) {

  const [currPage, setCurrPage] = useState<Pages>('CUSTOMERS');

  const menuItems: MenuItem[] = [
    {
      type: 'item',
      caption: 'Customers',
      onClick: () => setCurrPage('CUSTOMERS')
    },
    {
      type: 'item',
      caption: 'Accounts to approve',
      onClick: () => setCurrPage('ACCOUNTS_TO_APPROVE')
    },
  ];

  return (
    <PageHeader menuItems={menuItems}>
      {
        currPage === 'CUSTOMERS' ?
          <Customers />
        :
          <AccountsToApprove />
      }
    </PageHeader>
  );
}

export default EmployeeHomePage;
