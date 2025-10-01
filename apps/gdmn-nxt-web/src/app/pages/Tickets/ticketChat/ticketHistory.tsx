import UserTooltip from '@gdmn-nxt/components/userTooltip/user-tooltip';
import { ICRMTicketUser, ILabel, ITicketHistory, ticketStateCodes, UserType } from '@gsbelarus/util-api-types';
import { TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import { Avatar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CreateIcon from '@mui/icons-material/Create';
import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InfoIcon from '@mui/icons-material/Info';
import { useEffect, useReducer, useState } from 'react';
import { formatToFullDate, timeAgo } from '@gsbelarus/util-useful';
import LabelMarker from '@gdmn-nxt/components/Labels/label-marker/label-marker';
import LabelIcon from '@mui/icons-material/Label';
import PhoneIcon from '@mui/icons-material/Phone';
import PhoneForwardedIcon from '@mui/icons-material/PhoneForwarded';

interface ITicketHistoryProps {
  history: ITicketHistory;
  ticketId?: number;
}

const actionText = (text: string) => {
  return <Typography style={{ fontSize: 'inherit' }} variant="caption">{text}</Typography>;
};

export default function TicketHistory({ history, ticketId }: Readonly<ITicketHistoryProps>) {
  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const getIconByStateCode = (code: number) => {
    switch (code) {
      case 1: return <CreateIcon color={'action'} />;
      case 2: return <PersonAddIcon color={'action'} />;
      case 3: return <PersonIcon color={'action'} />;
      case 4: return <SettingsIcon color={'action'} />;
      case 5: return <InfoIcon color={'action'} />;
      case 6: return <DoneIcon color={'action'} />;
      case 7: return <DoneAllIcon color={'action'} />;
      default: return <Brightness1Icon color={'action'} />;
    }
  };

  const getHistoryIcon = (history: ITicketHistory) => {
    if (history.addedLabels || history.removedLabels) {
      return <LabelIcon color={'action'} />;
    }
    if (history.state) {
      return getIconByStateCode(history.state.code);
    }
    if (history.needCall) {
      return <PhoneForwardedIcon color={'action'} />;
    }
    return <PhoneIcon color={'action'} />;
  };

  const ticketsUser = useSelector<RootState, boolean>(state => state.user.userProfile?.type === UserType.Tickets);

  const getTextByStateCode = (code: number) => {
    switch (code) {
      case ticketStateCodes.initial: return <>{actionText('создал(a)')} {`${ticketsUser ? 'заявку' : 'тикет'} №${ticketId}`}</>;
      case ticketStateCodes.assigned: return <span>{actionText('назначил(a)')} {history.performer?.ID === history.user?.ID ? 'cебя' : (
        <UserTooltip
          name={history.performer?.fullName ?? ''}
          phone={history.performer?.phone}
          email={history.performer?.email}
          avatar={history.performer?.avatar}
        >
          <span>{history.performer?.fullName}</span>
        </UserTooltip>
      )}
      </span>;
      case ticketStateCodes.ressigned: return <span>{actionText('переназначил(a)')} {history.performer?.ID === history.user?.ID ? 'cебя' : (
        <UserTooltip
          name={history.performer?.fullName ?? ''}
          phone={history.performer?.phone}
          email={history.performer?.email}
          avatar={history.performer?.avatar}
        >
          <span>{history.performer?.fullName}</span>
        </UserTooltip>
      )}
      </span>;
      case ticketStateCodes.confirmed: return `Подтвердил выполнение ${ticketsUser ? 'заявки' : 'тикета'}`;
      default: return <>{actionText('изменил(a)')} {`статус ${ticketsUser ? 'заявки' : 'тикета'}`} {actionText('на')} {`"${history.state?.name}"`}</>;
    }
  };

  const getHistoryText = (history: ITicketHistory) => {
    const labelsToJSX = (labels: ILabel[]) => labels.map((label, index) => <LabelMarker key={index} label={label} />);

    const performersToJSX = (performers: ICRMTicketUser[]) => {
      return performers.map((performer, index) => {
        return (
          <UserTooltip
            key={performer.ID}
            name={performer?.fullName ?? ''}
            phone={performer?.phone}
            email={performer?.email}
            avatar={performer?.avatar}
          >
            <Typography variant="body1">{performer?.fullName}{performers.length - 1 !== index ? ',' : ''}</Typography>
          </UserTooltip>
        );
      });
    };

    if (history.addedLabels && history.removedLabels) {
      return (
        <>
          {actionText('Добавил(а)')}
          {labelsToJSX(history.addedLabels)}
          {actionText('и убрал(а)')}
          {labelsToJSX(history.removedLabels)}
        </>
      );
    }
    if (history.addedLabels) {
      return (
        <>
          {actionText('Добавил(а)')}
          {labelsToJSX(history.addedLabels)}
        </>
      );
    }
    if (history.removedLabels) {
      return (
        <>
          {actionText('Убрал(а)')}
          {labelsToJSX(history.removedLabels)}
        </>
      );
    }

    if (history.addedPerformers && history.removedPerformers) {
      return (
        <>
          {actionText('Назначил(а)')}
          {performersToJSX(history.addedPerformers)}
          {actionText('и исключил(а)')}
          {performersToJSX(history.removedPerformers)}
        </>
      );
    }
    if (history.addedPerformers) {
      return (
        <>
          {actionText('Назначил(а)')}
          {performersToJSX(history.addedPerformers)}
        </>
      );
    }
    if (history.removedPerformers) {
      return (
        <>
          {actionText('Исключил(а)')}
          {performersToJSX(history.removedPerformers)}
        </>
      );
    }

    if (history.state) {
      return getTextByStateCode(history.state?.code);
    }
    if (history.needCall) {
      return 'Запросил звонок';
    }
    if (!history.needCall) {
      return 'Завершил звонок';
    }
    return '';
  };

  const name = history.user?.fullName ?? 'Система';

  return (
    <div key={history.ID} style={{ marginLeft: matchDownSm ? '10px' : '50px' }}>
      <TimelineItem
        key={history.ID}
        sx={{
          '&::before': {
            display: 'none'
          }
        }}
      >
        <TimelineSeparator>
          <TimelineConnector style={{ background: 'var(--color-card-bg)' }} />
          <TimelineDot style={{ margin: '4px 0px', background: 'var(--color-card-bg)' }}>
            {getHistoryIcon(history)}
          </TimelineDot>
          <TimelineConnector style={{ background: 'var(--color-card-bg)', visibility: history.state?.code !== ticketStateCodes.confirmed ? 'visible' : 'hidden' }} />
        </TimelineSeparator>
        <TimelineContent style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', padding: '8px 16px' }}>
          <UserTooltip
            name={name}
            phone={history.user?.phone}
            email={history.user?.email}
            avatar={history.user?.avatar ? history.user?.avatar : undefined}
            customAvatar={history.user?.avatar ? undefined : <div
              style={{
                height: '40px', width: '40px', zIndex: 2, display: 'flex', flexWrap: 'wrap',
                justifyContent: 'center', alignContent: 'center', background: '#eeeeee', borderRadius: '100%'
              }}
            >
              <ManageAccountsIcon fontSize="medium" style={{ color: 'black' }} />
            </div>}
          >
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              {history.user?.avatar ? <Avatar src={history.user.avatar} style={{ height: '20px', width: '20px', zIndex: 2 }} />
                : <div
                  style={{
                    minHeight: '20px', width: '20px', zIndex: 2, display: 'flex', flexWrap: 'wrap',
                    justifyContent: 'center', alignContent: 'center', background: '#eeeeee', borderRadius: '100%'
                  }}
                >
                  <ManageAccountsIcon style={{ color: 'black', fontSize: '15px' }} />
                </div>}
              {name}
            </div>
          </UserTooltip>
          {getHistoryText(history)}
          <HistoryTime date={history.changeAt} />
        </TimelineContent>
      </TimelineItem>
    </div>
  );
};

interface IHistoryTimeProps {
  date: Date | undefined;
}

const HistoryTime = ({ date }: IHistoryTimeProps) => {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const calcUpdateInterval = (date: Date | undefined) => {
    if (!date) return;
    const pastDate = new Date(date);
    const now = new Date();

    const secondsPassed = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

    const minute = 1000 * 60;

    if (secondsPassed <= (60 * 60)) return minute;
    return;
  };

  const [updateInterval, setUpdateInterval] = useState(calcUpdateInterval(date));

  useEffect(() => {
    if (!date || !updateInterval) return;

    const updateTime = setInterval(() => {
      forceUpdate();
      const newInterval = calcUpdateInterval(date);
      if (newInterval !== updateInterval) {
        setUpdateInterval(newInterval);
      }
    }, updateInterval);

    return () => {
      clearInterval(updateTime);
    };
  }, [date, updateInterval]);

  if (!date) return;

  return (
    <Tooltip
      PopperProps={{
        disablePortal: true
      }}
      arrow
      title={formatToFullDate(date)}
    >
      <div>
        {actionText(`${timeAgo(date, 'minute')} назад`)}
      </div>
    </Tooltip>
  );
};
