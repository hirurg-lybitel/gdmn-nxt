import { useRoutes } from "react-router-dom";
import AuthenticationRoutes from "./AuthenticationRoutes";
import MainRoutes from "./MainRoutes";

interface IRoutesProps {
  isLogged: boolean;
}

export default function Routes(props: IRoutesProps) {
  const {isLogged} = props;

  return useRoutes([
    MainRoutes(isLogged),
    AuthenticationRoutes(isLogged)
  ]);
}
