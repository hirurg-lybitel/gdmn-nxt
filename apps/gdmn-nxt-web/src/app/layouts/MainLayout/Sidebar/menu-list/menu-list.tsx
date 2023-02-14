import { Typography } from '@mui/material';
import menuItems from '../../../../menu-items';
import MenuGroup from '../menu-group/menu-group';
import './menu-list.module.less';
import { IPermissionByUser } from '@gsbelarus/util-api-types';


/* eslint-disable-next-line */
export interface MenuListProps {
  menuPermissions: IPermissionByUser[] | undefined
}

export function MenuList(props: MenuListProps) {
  const { menuPermissions } = props;
  const navItems = menuItems.items.map((item) => {
    switch (item.type) {
      case 'group':
        return <MenuGroup key={item.id} item={item} menuPermissions={menuPermissions} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
              Ошибка отображения
          </Typography>
        );
    }
  });
  return (
    <>{navItems}</>
  );
}

export default MenuList;
