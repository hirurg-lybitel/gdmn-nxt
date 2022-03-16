import { Outlet } from 'react-router-dom';
import { MenuItem, PageHeader } from '../page-header/page-header';
import './customer-home-page.module.less';

export function CustomerHomePage() {

  const menuItems: MenuItem[] = [
    {
      type: 'link',
      caption: 'Акт сверки',
      link: 'reconciliation-statement'
    },
    {
      type: 'link',
      caption: 'Покупка стандарта',
      link: 'standard-order'
    },
  ];

  return (
    <PageHeader menuItems={menuItems}><Outlet /></PageHeader>
  );
}

export default CustomerHomePage;
