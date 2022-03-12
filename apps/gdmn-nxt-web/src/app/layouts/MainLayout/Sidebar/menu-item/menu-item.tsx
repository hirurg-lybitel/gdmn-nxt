import { ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { ForwardedRef, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import './menu-item.module.less';

export interface MenuItemProps {
  item: any;
}

export function MenuItem(props: MenuItemProps) {
  const { item } = props;

  const itemIcon = item?.icon;
  const itemUrl = item?.url;

  const listComponent = {
    component: forwardRef((props, ref: ForwardedRef<any>) => <Link ref={ref} {...props} to={`${itemUrl}`} target="_self" />)
  };
  listComponent.component.displayName = 'ListComponent';

  return (
    <ListItem
      {...listComponent}
      button
    >
      <ListItemIcon>{itemIcon}</ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="h4" color="inherit">
            {item.title}
          </Typography>
        }
      />

    </ListItem>
  );
}

export default MenuItem;
