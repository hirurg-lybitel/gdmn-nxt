import { Navigate } from 'react-router-dom';
import App from '../app';
import MinimalLayout from '../layouts/MinimalLayout';
import NotFound from '../pages/NotFound';

function AuthenticationRoutes(isLogged: boolean) {
  return {
    path: '/authentication',
    element: !isLogged ? <MinimalLayout /> : <Navigate to={'/'} />,
    children: [
      {
        path: '/authentication',
        element: <App />
      },
      { path: '404', element: <NotFound /> },
    ]
  };
};

export default AuthenticationRoutes;
