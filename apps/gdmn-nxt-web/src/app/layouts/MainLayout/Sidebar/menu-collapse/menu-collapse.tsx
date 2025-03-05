import './menu-collapse.module.less';
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, Theme, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import MenuItem from '../menu-item/menu-item';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { IMenuItem } from 'apps/gdmn-nxt-web/src/app/menu-items';
import { makeStyles } from '@mui/styles';
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import { useSelector } from 'react-redux';
import { Permissions } from '@gsbelarus/util-api-types';
import { RootState } from '@gdmn-nxt/store';

const useStyles = makeStyles((theme: Theme) => ({
  menuCollapse: {
    marginBottom: 3,
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, .3)',
    },
    '&.Mui-selected': {
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, .3)',
      },
    },
  }
}));


export interface MenuCollapseProps {
  menu: IMenuItem;
  level?: number;
}

export function MenuCollapse(props: MenuCollapseProps) {
  const { menu, level = 0 } = props;
  const classes = useStyles();

  const [open, setOpen] = useState(false);;

  const handleClick = () => {
    setOpen(!open);
  };

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const menus = menu.children?.map((item: IMenuItem) => {
    switch (item.type) {
      case 'item':
        return (
          <PermissionsGate
            key={item.id}
            actionAllowed={userPermissions?.[item.actionCheck?.name ?? '']?.[item.actionCheck?.method ?? '']}
          >
            <MenuItem
              key={item.id}
              item={item}
              level={level + 1}
            />
          </PermissionsGate>
        );
      case 'collapse':
        return <MenuCollapse
          key={item.id}
          menu={item}
          level={level + 1}
        />;
      default:
        return (
          <Typography
            key={item.id}
            // variant="h6"
            // color="error"
            align="center"
          >
            Ошибка отображения
          </Typography>
        );
    }
  });

  const menuIcon = menu.icon;

  const location = useLocation();

  useEffect(() => {
    /** Рекурсивно проверяем, есть ли в текущем пути вложенный путь, соответствующий одному из подменю */
    const findSubMenuPath = (menu: IMenuItem) => {
      if (menu.children) {
        for (const item of menu.children) {
          if (!!item.url && location.pathname?.includes(item.url || '')) {
            setOpen(true);
            break;
          }
          findSubMenuPath(item);
        }
      }
    };

    findSubMenuPath(menu);
  }, [location.pathname, menu]);

  return (
    <>
      <ListItemButton
        className={classes.menuCollapse}
        sx={{
          pl: `${level * 12}px`,
        }}
        selected={open}
        onClick={handleClick}
      >
        <ListItemIcon color="secondary" sx={{ minWidth: !menu.icon ? 18 : 36 }}>
          {menuIcon}
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              variant="subtitle1"
              color="inherit"
              sx={{ my: 'auto' }}
            >
              {menu.title}
            </Typography>
          }
        />
        {(open) ? (
          <KeyboardArrowUpIcon style={{ marginTop: 'auto', marginBottom: 'auto' }} />
        ) : (
          <KeyboardArrowDownIcon style={{ marginTop: 'auto', marginBottom: 'auto' }} />
        )}
      </ListItemButton>
      <Collapse
        in={open}
        timeout="auto"
        unmountOnExit
      >
        <List
          component="div"
          disablePadding
          sx={{
            position: 'relative',
            '&:after': {
              content: '\'\'',
              position: 'absolute',
              left: '32px',
              top: 0,
              height: '100%',
              width: '1px',
              opacity: 1,
            }
          }}
        >
          {menus}
        </List>
      </Collapse>
    </>
  );
}

export default MenuCollapse;
