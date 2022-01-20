import { useState } from 'react';
import { MenuItem, PageHeader } from '../page-header/page-header';
import ReconciliationStatement from '../reconciliation-statement/reconciliation-statement';
import { StandardOrder } from '../standard-order/standard-order';
import './customer-home-page.module.less';

/* eslint-disable-next-line */
export interface CustomerHomePageProps {}

type Pages = 'BLANK' | 'RECSTMT' | 'STANDARD_ORDER';

export function CustomerHomePage(props: CustomerHomePageProps) {

  const [currPage, setCurrPage] = useState<Pages>('BLANK');

  const menuItems: MenuItem[] = [
    {
      type: 'item',
      caption: 'Акт сверки',
      onClick: () => setCurrPage('RECSTMT')
    },
    {
      type: 'item',
      caption: 'Покупка стандарта',
      onClick: () => setCurrPage('STANDARD_ORDER')
    },
  ];

  return (
    <PageHeader menuItems={menuItems}>
      {
        currPage === 'BLANK' ?
          <StandardOrder />
        : currPage === 'RECSTMT' ?
          <ReconciliationStatement
            custId={148333193}
          />
        :
          <div></div>
      }
    </PageHeader>
  );
}

export default CustomerHomePage;
