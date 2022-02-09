import { useRoutes } from "react-router-dom";
import AuthenticationRoutes from "./AuthenticationRoutes";
import MainRoutes from "./MainRoutes";

interface IRoutesProps {
  isLogged: boolean;
};

export default function Routes({ isLogged }: IRoutesProps) {
  return useRoutes([
    MainRoutes(isLogged),
    AuthenticationRoutes(isLogged)
  ]);
};
