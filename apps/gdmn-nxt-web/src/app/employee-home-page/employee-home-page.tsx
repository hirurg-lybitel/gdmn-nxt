import Customers from '../customers/customers';
import { PageHeader } from '../page-header/page-header';
import './employee-home-page.module.less';

/* eslint-disable-next-line */
export interface EmployeeHomePageProps {}

export function EmployeeHomePage(props: EmployeeHomePageProps) {
  return (
    <PageHeader>
      <Customers />
    </PageHeader>
  );
}

export default EmployeeHomePage;
