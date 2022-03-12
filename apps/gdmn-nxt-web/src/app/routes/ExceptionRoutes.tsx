import { Navigate } from 'react-router-dom';

function ExceptionRoutes(isLogged: boolean) {
  return {
    path: '*',
    element: <Navigate to={`${isLogged ? '/404' : '/authentication/404'}`} />,
  };
};

export default ExceptionRoutes;
