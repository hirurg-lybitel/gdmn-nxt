import { ListItemButton, ListItemIcon, ListItemText, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { RootState } from 'apps/gdmn-nxt-web/src/app/store';
import React, { ForwardedRef, forwardRef, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, NavLinkProps, useNavigate } from 'react-router-dom';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {usePermissions} from '../../../../features/common/usePermissions'

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
  level?: number;
  isOpen?:boolean
  open?:()=>void;
};

export function MenuItem(props: MenuItemProps) {
  const { item, level = 0, isOpen, open } = props;
  const settings = useSelector((state: RootState) => state.settings);

  const classes = useStyles();

  const [actionCode,setActionCode] = useState(-1)
  const navigate = useNavigate()
  const [permissionsIsFetching,permissions] = usePermissions(actionCode)

  const itemIcon = item?.icon ||
    (level > 1
      ? <FiberManualRecordIcon
        sx={{
          width: 6,
          height: 6
        }}
        color="secondary"
      />
      : <></>);

  useEffect(()=>{
    if(!permissions){
      return
    }
    if(permissions?.MODE !== 1){
      navigate('');
    }
  },[permissions])

  const lickClassAndReroute = (isActive:boolean, elClasses:string) => {
    if(isActive){
      if(item.checkAction){
        setActionCode(item.checkAction)
      }
      return elClasses + " Mui-selected"
    }else{
      return elClasses
    }
  }

  type MyNavLinkProps = Omit<NavLinkProps, 'to'>;
  const MyNavLink = React.useMemo(() => React.forwardRef<HTMLAnchorElement, MyNavLinkProps>((navLinkProps, ref) => {
    const { className: previousClasses, ...rest } = navLinkProps;
    const elementClasses = previousClasses?.toString() ?? "";
    item.checkAction
    return (<NavLink
      {...rest}
      ref={ref}
      to={item.url}
      end
      className={({ isActive }) => lickClassAndReroute(isActive, elementClasses)}
      />)
  }), [item.url]);

  return (
    <ListItemButton
      component={MyNavLink}
      className={classes.menuItem}
      sx={{
        pl: `${level * 24}px`
      }}
    >
      <ListItemIcon sx={{ minWidth: !item?.icon && level > 1 ? 18 : 36 }}>{itemIcon}</ListItemIcon>
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
