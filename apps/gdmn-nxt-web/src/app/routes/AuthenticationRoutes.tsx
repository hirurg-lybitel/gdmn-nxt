import { Navigate } from "react-router-dom";
import App from "../app";
import MinimalLayout from "../layouts/MinimalLayout";

function AuthenticationRoutes(isLogged: boolean) {
  return {
    path: '/',
    element: !isLogged ? <MinimalLayout /> : <Navigate to={`/`} />,
    children: [
      {
        path: 'authentication/login',
        element: <App />
      },
      {
        path: 'authentication/register',
        element: <App />
      }
    ]
  }
};

export default AuthenticationRoutes;
