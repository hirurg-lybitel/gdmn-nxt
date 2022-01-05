import { PageHeader } from '../page-header/page-header';
import './employee-home-page.module.less';

/* eslint-disable-next-line */
export interface EmployeeHomePageProps {}

export function EmployeeHomePage(props: EmployeeHomePageProps) {
  return (
    <PageHeader>
      <h1>Welcome to EmployeeHomePage!</h1>
    </PageHeader>
  );
}

export default EmployeeHomePage;
