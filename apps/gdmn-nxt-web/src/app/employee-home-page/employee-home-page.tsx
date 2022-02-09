import { useState } from 'react';
import AccountsToApprove from '../accounts-to-approve/accounts-to-approve';
import Customers from '../customers/customers';
import ErModel from '../er-model/er-model';
import { MenuItem, PageHeader } from '../page-header/page-header';
import './employee-home-page.module.less';

type Pages = 'CUSTOMERS' | 'ACCOUNTS_TO_APPROVE' | 'ER-MODEL';

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
    {
      type: 'divider'
    },
    {
      type: 'item',
      caption: 'erModel',
      onClick: () => setCurrPage('ER-MODEL')
    },
  ];

  return (
    <PageHeader menuItems={menuItems}>
      {
        currPage === 'CUSTOMERS' ?
          <Customers />
        : currPage === 'ACCOUNTS_TO_APPROVE' ?
          <AccountsToApprove />
        :
          <ErModel />  
      }
    </PageHeader>
  );
}

export default EmployeeHomePage;
