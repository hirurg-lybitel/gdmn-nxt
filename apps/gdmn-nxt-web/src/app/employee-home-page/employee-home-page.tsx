import { useState } from 'react';
import AccountsToApprove from '../accounts-to-approve/accounts-to-approve';
import Customers from '../customers/customers';
import { ErModelDomains } from '../er-model-domains/er-model-domains';
import { ErModel } from '../er-model/er-model';
import { MenuItem, PageHeader } from '../page-header/page-header';
import './employee-home-page.module.less';

type Pages = 'CUSTOMERS' | 'ACCOUNTS_TO_APPROVE' | 'ER-MODEL' | 'ER-MODEL-DOMAINS';

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
      caption: 'erModel/Domains',
      onClick: () => setCurrPage('ER-MODEL-DOMAINS')
    },
    {
      type: 'item',
      caption: 'erModel/Entities',
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
        : currPage === 'ER-MODEL' ?
          <ErModel />
        :
          <ErModelDomains />
      }
    </PageHeader>
  );
}

export default EmployeeHomePage;
