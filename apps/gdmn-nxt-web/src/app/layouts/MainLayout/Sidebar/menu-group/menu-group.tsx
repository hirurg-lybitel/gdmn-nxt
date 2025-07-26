import { Divider, List, Typography } from '@mui/material';
import MenuCollapse from '../menu-collapse/menu-collapse';
import MenuItem from '../menu-item/menu-item';
import './menu-group.module.less';
import { IPermissionByUser, Permissions } from '@gsbelarus/util-api-types';
import PermissionsGate from 'apps/gdmn-nxt-web/src/app/components/Permissions/permission-gate/permission-gate';
import { useSelector } from 'react-redux';
import { RootState } from 'apps/gdmn-nxt-web/src/app/store';
import { IMenuItem } from 'apps/gdmn-nxt-web/src/app/menu-items';

export interface MenuGroupProps {
  item: any,
  onClick: (item: IMenuItem, lavel: number) => void;
}

export function MenuGroup(props: MenuGroupProps) {
  const { item, onClick } = props;

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);
  const isAdmin = useSelector<RootState, boolean>(state => state.user.userProfile?.isAdmin ?? false);

  const filteredItems = item.children.filter((item: IMenuItem) =>
    (userPermissions?.[item.actionCheck?.name ?? '']?.[item.actionCheck?.method ?? ''] ?? !item.actionCheck) &&
    (item.adminOnly ? isAdmin : true));

  const items = filteredItems?.map((menu: IMenuItem) => {
    switch (menu.type) {
      case 'collapse': {
        const itemsPermission = menu.children?.findIndex(children => {
          return userPermissions?.[children.actionCheck?.name ?? '']?.[children.actionCheck?.method ?? ''] || !children.actionCheck;
        }) !== -1;

        return <PermissionsGate
          key={menu.id}
          actionAllowed={
            (menu.actionCheck ? userPermissions?.[menu.actionCheck.name ?? '']?.[menu.actionCheck.method ?? ''] : itemsPermission)
          }
        >
          {userPermissions?.[menu.actionCheck?.name ?? '']?.[menu.actionCheck?.method ?? '']}
          <MenuCollapse
            onClick={onClick}
            menu={menu}
            level={1}
          />
        </PermissionsGate>;
      };
      case 'item':
        return <PermissionsGate
          key={menu.id}
          actionAllowed={
            (userPermissions?.[menu.actionCheck?.name ?? '']?.[menu.actionCheck?.method ?? ''] ?? !menu.actionCheck) &&
            (menu.adminOnly ? isAdmin : true)
          }
        >
          <MenuItem
            onClick={onClick}
            key={menu.id}
            item={menu}
            level={1}
          />
        </PermissionsGate>;
      default:
        return (
          <Typography
            key={menu.id}
            variant="h6"
            color="error"
            align="center"
          >
            Ошибка отображения
          </Typography>
        );
    }
  });

  if (filteredItems.length === 0) return;

  return (
    <List
      dense
      disablePadding
      subheader={
        item.title && (
          <Typography
            color="inherit"
            variant="subtitle1"
            fontSize={'16.5px'}
            display="block"
            gutterBottom
          >
            {item.title}
          </Typography>
        )
      }
    >
      {items}
    </List>
  );
}

export default MenuGroup;
