import { Icon, ListItemButton, ListItemIcon, ListItemText, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { RootState } from 'apps/gdmn-nxt-web/src/app/store';
import { forwardRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, NavLinkProps } from 'react-router-dom';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { IMenuItem } from 'apps/gdmn-nxt-web/src/app/menu-items';
import { ActionMethod, ActionName, Permissions } from '@gsbelarus/util-api-types';

const useStyles = makeStyles((theme: Theme) => ({
  menuItem: {
    marginBottom: 3,
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: '8px',
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

interface actionCheck {
  name: ActionName;
  method: ActionMethod;
}


export interface MenuItemProps {
  item: IMenuItem;
  level?: number;
};

export function MenuItem(props: MenuItemProps) {
  const { item, level = 0 } = props;

  const classes = useStyles();

  const itemIcon = item?.icon ||
    (level > 1
      ? <div style={{ width: '36px', justifyContent: 'center', display: 'flex' }}>
        <FiberManualRecordIcon
          sx={{
            width: 6,
            height: 6
          }}
          color="secondary"
        />
      </div>
      : <></>);

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const lickClassAndReroute = (isActive: boolean, elClasses: string) => {
    if (isActive) {
      if (item.actionCheck) {
        if (!userPermissions?.[`${item.actionCheck.name}`]?.[`${item.actionCheck.method}`]) {
          window.location.href = '';
        }
      }
      return elClasses + ' Mui-selected';
    } else {
      return elClasses;
    }
  };

  type MyNavLinkProps = Omit<NavLinkProps, 'to'>;
  const MyNavLink = useMemo(() => forwardRef<HTMLAnchorElement, MyNavLinkProps>((navLinkProps, ref) => {
    const { className: previousClasses, ...rest } = navLinkProps;
    const elementClasses = previousClasses?.toString() ?? '';
    return (<NavLink
      {...rest}
      ref={ref}
      to={item.url || ''}
      className={({ isActive }) => lickClassAndReroute(isActive, elementClasses)}
    />);
  }), [item.url]);

  return (
    <ListItemButton
      component={MyNavLink}
      className={classes.menuItem}
      sx={{
        pl: `${level * 12 - level > 0 ? 12 : 0}px`
      }}
    >
      <ListItemIcon sx={{ minWidth: !item?.icon && level > 1 ? 18 : 36 }}>{itemIcon}</ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="subtitle1" color="inherit">
            {item.title}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default MenuItem;
