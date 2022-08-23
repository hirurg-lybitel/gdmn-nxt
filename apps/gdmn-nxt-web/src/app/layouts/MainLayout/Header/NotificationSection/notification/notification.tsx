import './notification.module.less';
import {
  Badge,
  Box,
  ClickAwayListener,
  Divider,
  Fade,
  IconButton,
  Paper,
  Popper,
  Stack,
  Theme,
  Typography
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import NotificationList from '../notification-list/notification-list';

const useStyles = makeStyles((theme: Theme) => ({
  popper: {
    zIndex: 2000,
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.71em',
      marginLeft: 4,
      marginRight: 4,
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
  mainPaper: {
    marginRight: 20,
    width: '20vw',
    minWidth: '300px'
  },
  header: {
    padding: '16px 24px'
  },
  badgeFadeIn: {
    animationName: '$fadeIn',
    animationDuration: '1000ms',
  },
  badgeFadeOut: {
    animationName: '$fadeOut',
    animationDuration: '1000ms',
  },
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0
    },
    '100%': {
      opacity: 1,
    }
  },
  '@keyframes fadeOut': {
    '0%': {
      opacity: 1
    },
    '100%': {
      opacity: 0
    }
  }
}));

/* eslint-disable-next-line */
export interface NotificationProps {}

export function Notification(props: NotificationProps) {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [anchorProfileEl, setAnchorProfileEl] = useState(null);
  const [arrowRef, setArrowRef] = useState<HTMLElement | null>(null);
  // const arrowRef = useRef<HTMLElement | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setFadeOut(!fadeOut);
      }, 1000);
      return () => clearTimeout(timer);
    };
    return;
  });

  const handleToogle = (target: any) => {
    setAnchorProfileEl(target);
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        mx: 2
      }}
    >
      <IconButton
        size="large"
        onClick={(event: any) => handleToogle(event.currentTarget)}
      >
        {/* <Avatar variant="rounded" color=""> */}
        <Badge
          classes={{
            dot: clsx(classes.badgeFadeIn, { [classes.badgeFadeOut]: fadeOut })
          }}
          color="error"
          variant="dot"
        >
          <NotificationsOutlinedIcon color="secondary" />
        </Badge>
        {/* </Avatar> */}
      </IconButton>
      <Popper
        className={classes.popper}
        open={open}
        placement="bottom"
        anchorEl={anchorProfileEl}
        transition
        popperOptions={{
          modifiers: [
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
            <Paper className={classes.mainPaper}>
              <ClickAwayListener onClickAway={handleClose}>
                <CustomizedCard borders elevation={15}>
                  <span className={classes.arrow} ref={setArrowRef} />
                  <Stack direction="column" style={{ maxHeight: '50vh' }}>
                    <Stack
                      className={classes.header}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Typography variant="h3">
                        Уведомления
                      </Typography>
                      {/* <Avatar
                        style={{
                          backgroundColor: 'red',
                          height: '25px',
                          width: '25px'
                        }}
                      >
                        <Typography variant="body1" >2</Typography>
                      </Avatar> */}
                    </Stack>
                    <Divider />
                    <PerfectScrollbar>
                      <NotificationList />
                    </PerfectScrollbar>
                  </Stack>
                </CustomizedCard>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default Notification;
