import { Navigate } from "react-router-dom";
import ErModel from "../er-model/er-model";
import MainLayout from "../layouts/MainLayout";
import CustomersList from "../pages/Customers/customers-list/customers-list";
import OrderList from "../pages/Customers/order-list/order-list";
import Dashboard from "../pages/Dashboard/dashboard/dashboard";
import ReconciliationAct from "../pages/UserReports/ReconciliationAct";

function MainRoutes(isLogged: boolean) {
  return {
    path: '/',
    element: isLogged ? <MainLayout /> : <Navigate to={`/authentication/login`} />,
    children: [
      {
        path: '/',
        element: <Dashboard />
      },
      {
        path: '/dashboard',
        element: <Navigate to="/" />
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
      {
        path: '/system/er-model',
        element: <ErModel />
      },
    ]
  }
}

export default MainRoutes;
