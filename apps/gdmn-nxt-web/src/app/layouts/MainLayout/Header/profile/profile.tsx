import './profile.module.less';
import {
  Avatar,
  Typography,
  Stack,
  ClickAwayListener,
  Divider,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Theme
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import {
  logoutUser,
  UserState
} from 'apps/gdmn-nxt-web/src/app/features/user/userSlice';
import { AppDispatch, RootState } from 'apps/gdmn-nxt-web/src/app/store';
import { ForwardedRef, forwardRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';
import { setActiveMenu } from 'apps/gdmn-nxt-web/src/app/store/settingsSlice';
import { useGetProfileSettingsQuery } from 'apps/gdmn-nxt-web/src/app/features/profileSettings';

const useStyles = makeStyles((theme: Theme) => ({
  popper: {
    zIndex: 2000,
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.71em',
      '&::before': {
        transformOrigin: '0 100%'
      }
    },
  },
  arrow: {
    position: 'absolute',
    width: '0.71em',
    height: '0.71em',
    boxSizing: 'border-box',
    color: theme.palette.background.paper,
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: '100%',
      height: '100%',
      boxShadow: theme.shadows[1],
      backgroundColor: 'currentColor',
      transform: 'translateY(-50%) rotate(45deg)'
    }
  },
  listItemIcon: {
    minWidth: '40px'
  }
}));

export interface ProfileProps {}

export function Profile(props: ProfileProps) {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [anchorProfileEl, setAnchorProfileEl] = useState(null);
  const [arrowRef, setArrowRef] = useState<HTMLElement | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector<RootState, UserState>(state => state.user);

  const { userProfile } = useSelector<RootState, UserState>(state => state.user);
  const { data: settings } = useGetProfileSettingsQuery(userProfile?.id || -1);

  const handleToogle = (target: any) => {
    setAnchorProfileEl(target);
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAccountClick = () => {
    dispatch(setActiveMenu('account'));
    handleClose();
  };

  const handleSettingsClick = () => {
    dispatch(setActiveMenu('settings'));
    handleClose();
  };

  const welcomeText = () => {
    const date = new Date();
    const hours = date.getHours();
    const text = hours < 12 ? 'Доброе утро' : hours >= 18 ? 'Добрый вечер' : 'Добрый день';
    return text + ',';
  };

  const accountComponent = {
    // eslint-disable-next-line react/display-name
    component: forwardRef((props, ref: ForwardedRef<any>) =>
      <Link
        ref={ref}
        {...props}
        to="preferences/account"
        target="_self"
      />)
  };

  const settingsComponent = {
    // eslint-disable-next-line react/display-name
    component: forwardRef((props, ref: ForwardedRef<any>) =>
      <Link
        ref={ref}
        {...props}
        to="preferences/settings"
        target="_self"
      />)
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  return (
    <>
      <IconButton
        size="large"
        onClick={(event: any) => handleToogle(event.currentTarget)}
      >
        <Avatar src={settings?.AVATAR || undefined} />
      </IconButton>
      <Popper
        className={classes.popper}
        open={open}
        placement="bottom"
        anchorEl={anchorProfileEl}
        transition
        popperOptions={{
          modifiers: [
            // {
            //   name:'offset',
            //   options: {
            //       offset: [0, 10]
            //   }
            // },
            {
              name: 'arrow',
              options: {
                enabled: true,
                element: arrowRef
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper style={{ marginRight: 20 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <CustomizedCard borders elevation={15}>
                  <span className={classes.arrow} ref={setArrowRef} />
                  <List>
                    <ListItem>
                      <Stack direction="column">
                        <Stack direction="row" spacing={0.5}>
                          <Typography variant="h4">{welcomeText()}</Typography>
                          <Typography variant="body1">
                            {user.userProfile?.userName ?? 'Неизвестный пользователь'}
                          </Typography>
                        </Stack>
                        <Typography variant="caption">{user.userProfile?.rank || ''}</Typography>
                      </Stack>
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
                      <ListItemButton {...accountComponent} onClick={handleAccountClick}>
                        <ListItemIcon className={classes.listItemIcon}>
                          <AccountCircleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Профиль" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton {...settingsComponent} onClick={handleSettingsClick}>
                        <ListItemIcon className={classes.listItemIcon}>
                          <Settings />
                        </ListItemIcon>
                        <ListItemText primary="Настройки" />
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={logout}
                      >
                        <ListItemIcon className={classes.listItemIcon}>
                          <Logout />
                        </ListItemIcon>
                        <ListItemText primary="Выйти" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </CustomizedCard>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
}

export default Profile;
