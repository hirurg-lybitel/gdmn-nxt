import { ListItemButton, ListItemIcon, ListItemText, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { RootState } from 'apps/gdmn-nxt-web/src/app/store';
import { setActiveMenu } from 'apps/gdmn-nxt-web/src/app/store/settingsSlice';
import { ForwardedRef, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  menuItem: {
    marginBottom: 3,
    borderRadius: theme.mainContent.borderRadius,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, .3)',
    },
    '&.Mui-selected': {
      backgroundColor: 'rgba(255, 255, 255, .3)',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, .3)',
      },
    },
  }
}));

export interface MenuItemProps {
  item: any;
};

export function MenuItem(props: MenuItemProps) {
  const { item } = props;

  const classes = useStyles();
  const dispatch = useDispatch();

  const itemIcon = item?.icon;

  const listComponent = {
    component: forwardRef((props, ref: ForwardedRef<any>) => <Link ref={ref} {...props} to={`${item.url}`} target="_self" />)
  };

  const settings = useSelector((state: RootState) => state.settings);

  const handleItemOnClick = () => {
    dispatch(setActiveMenu(item.id));
  };

  return (
    <ListItemButton
      {...listComponent}
      onClick={handleItemOnClick}
      selected={settings.activeMenuId === item.id}
      className={classes.menuItem}
    >
      <ListItemIcon>{itemIcon}</ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="h4" color="inherit">
            {item.title}
          </Typography>
        }
      />

    </ListItemButton>
  );
}

export default MenuItem;
