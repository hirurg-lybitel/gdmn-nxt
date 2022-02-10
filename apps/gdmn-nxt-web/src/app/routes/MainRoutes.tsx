import { Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import SalesFunnel from "../pages/Analytics/sales-funnel/sales-funnel";
import ReconciliationAct from "../pages/Analytics/UserReports/ReconciliationAct";
import CustomersList from "../pages/Customers/customers-list/customers-list";
import OrderList from "../pages/Customers/order-list/order-list";
import Dashboard from "../pages/Dashboard/dashboard/dashboard";
import Deals from "../pages/Dashboard/deals/deals";
import NotFound from "../pages/NotFound";
import ErModel from "../er-model/er-model";

function MainRoutes(isLogged: boolean) {
  return {
    path: '/',
    element: isLogged ? <MainLayout /> : <Navigate to={`/authentication`} />,
    children: [
      {
        path: '/',
        element: <Dashboard />
      },
      {
        path: 'dashboard',
        element: <Navigate to="/" />
      },
      {
        path: 'dashboard/deals',
        element: <Deals />
      },
      {
        path: 'customers/list',
        element: <CustomersList />
      },
      {
        path: 'customers/orders/list',
        element: <OrderList />
      },
      {
        path: 'reports/reconciliation',
        element: <ReconciliationAct />
      },
      {
        path: 'reports/reconciliation/:customerId',
        element: <ReconciliationAct />
      },
      {
        path: 'analytics/salesfunnel',
        element: <SalesFunnel />
      },
      {
        path: 'system/er-model',
        element: <ErModel />
      },
      {
        path: '404',
        element: <NotFound />
      },
    ]
  }
};

export default MainRoutes;
