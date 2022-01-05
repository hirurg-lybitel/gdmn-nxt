import { PageHeader } from '../page-header/page-header';
import './customer-home-page.module.less';

/* eslint-disable-next-line */
export interface CustomerHomePageProps {}

export function CustomerHomePage(props: CustomerHomePageProps) {
  return (
    <PageHeader>
      <h1>Welcome to CustomerHomePage!</h1>
    </PageHeader>
  );
}

export default CustomerHomePage;
