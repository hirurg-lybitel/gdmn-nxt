import { PERMISSIONS } from '../permission-map';
import styles from './permissions-gate.module.less';

// const hasPermission = ({ permissions: string[], scopes }) => {
//   const scopesMap: { [key: string]: any } = {};
//   scopes.forEach((scope: string | number) => {
//     scopesMap[scope] = true;
//   });

//   return permissions.some((permission) => scopesMap[permission]);
// };

export interface PermissionsGateProps {
  children: JSX.Element[];
  scopes?: any[]
}

export function PermissionsGate(props: PermissionsGateProps) {
  const { children, scopes } = props;
  // const { role } = useGetRole();
  const role = '1';
  const permissions = PERMISSIONS[role];

  // const permissionGranted = hasPermission({ permissions, scopes });

  // if (!permissionGranted) return <></>;

  return <>{children}</>;
}

export default PermissionsGate;
