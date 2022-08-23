import { Divider, List, Typography } from '@mui/material';
import MenuCollapse from '../menu-collapse/menu-collapse';
import MenuItem from '../menu-item/menu-item';
import './menu-group.module.less';

export interface MenuGroupProps {
  item: any;
}

export function MenuGroup(props: MenuGroupProps) {
  const { item } = props;

  const items = item.children?.map((menu: any) => {
    switch (menu.type) {
      case 'collapse':
        return <MenuCollapse key={menu.id} menu={menu} level={1} />;

      case 'item':
        return <MenuItem key={menu.id} item={menu} level={1} />;
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
