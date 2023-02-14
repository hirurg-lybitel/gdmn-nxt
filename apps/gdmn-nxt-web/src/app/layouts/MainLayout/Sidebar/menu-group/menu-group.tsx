import { Divider, List, Typography } from '@mui/material';
import MenuCollapse from '../menu-collapse/menu-collapse';
import MenuItem from '../menu-item/menu-item';
import './menu-group.module.less';
import { IPermissionByUser } from '@gsbelarus/util-api-types';

export interface MenuGroupProps {
  item: any,
  menuPermissions?: IPermissionByUser[]
}

export function MenuGroup(props: MenuGroupProps) {
  const { item, menuPermissions } = props;

  const items = item.children?.map((menu: any) => {
    switch (menu.type) {
      case 'collapse':
        if (menu.checkAction) {
          if (menuPermissions?.find(menuItem => menuItem.CODE === menu.checkAction)?.MODE === 1) {
            return <MenuCollapse key={menu.id} menu={menu} level={1} />;
          } else {
            return null;
          }
        } else {
          return <MenuCollapse key={menu.id} menu={menu} level={1} />;
        }
        break;
      case 'item':
        if (menu.checkAction) {
          if (menuPermissions?.find(menuItem => menuItem.CODE === menu.checkAction)?.MODE === 1) {
            return <MenuItem key={menu.id} item={menu} level={1} />;
          } else {
            return null;
          }
        } else {
          return <MenuItem key={menu.id} item={menu} level={1} />;
        }
        break;
      default:
        return (
          <Typography key={menu.id} variant="h6" color="error" align="center">
              Ошибка отображения
          </Typography>
        );
    }
  });

  return (
    <>
      <List
        subheader={
          item.title && (
            <Typography variant="h2" color="inherit" display="block" gutterBottom>
              {item.title}
            </Typography>
          )
        }
      >
        {items}
      </List>
      <Divider />
    </>
  );
}

export default MenuGroup;
