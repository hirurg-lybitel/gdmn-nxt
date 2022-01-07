import { PageHeader } from '../page-header/page-header';
import ReconciliationStatement from '../reconciliation-statement/reconciliation-statement';
import './customer-home-page.module.less';

/* eslint-disable-next-line */
export interface CustomerHomePageProps {}

export function CustomerHomePage(props: CustomerHomePageProps) {
  return (
    <PageHeader>
      <ReconciliationStatement
        custId={148333193}
      />
    </PageHeader>
  );
}

export default CustomerHomePage;
