import MainLayout from "../layouts/MainLayout";
import CustomersList from "../pages/Customers/customers-list/customers-list";
import OrderList from "../pages/Customers/order-list/order-list";
import Dashboard from "../pages/Dashboard/dashboard/dashboard";
import ReconciliationAct from "../pages/UserReports/ReconciliationAct";

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <Dashboard />
    },
    {
      path: '/dashboard',
      element: <Dashboard />
    },
    {
      path: '/customers/list',
      element: <CustomersList />
    },
    {
      path: '/customers/orders/list',
      element: <OrderList />
    },
    {
      path: '/reports/reconciliation',
      element: <ReconciliationAct />
    },
    {
      path: '/reports/reconciliation/:customerId',
      element: <ReconciliationAct />
    },

  ]
}

export default MainRoutes;
