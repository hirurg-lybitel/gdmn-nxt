import UserTooltip from '@gdmn-nxt/components/userTooltip/user-tooltip';
import { ILabel, ITicketHistory, ticketStateCodes, UserType } from '@gsbelarus/util-api-types';
import { TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import { Avatar, Tooltip, useMediaQuery, useTheme } from '@mui/material';
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
      case 1: return `создал(a) ${ticketsUser ? 'заявку' : 'тикет'} №${ticketId}`;
      case 2: return <span>назначил(a) {history.performer?.ID === history.user?.ID ? 'cебя' : <UserTooltip
        name={history.performer?.fullName ?? ''}
        phone={history.performer?.phone}
        email={history.performer?.email}
        avatar={history.performer?.avatar}
      >
        <span>{history.performer?.fullName}</span>
      </UserTooltip>}
      </span>;
      case 3: return <span>переназначил(a) <UserTooltip
        name={history.performer?.fullName ?? ''}
        phone={history.performer?.phone}
        email={history.performer?.email}
        avatar={history.performer?.avatar}
      >
        <span>{history.performer?.fullName}</span>
      </UserTooltip>
      </span>;
      default: return `изменил(a) статус ${ticketsUser ? 'заявки' : 'тикета'} на "${history.state?.name}"`;
    }
  };

  const getHistoryText = (history: ITicketHistory) => {
    const labelsToJSX = (labels: ILabel[]) => labels.map((label, index) => <LabelMarker key={index} label={label} />);

    if (history.addedLabels && history.removedLabels) {
      return (
        <>
          Добавил(а)
          {labelsToJSX(history.addedLabels)}
          и убрал(а)
          {labelsToJSX(history.removedLabels)}
        </>
      );
    }
    if (history.addedLabels) {
      return (
        <>
          Добавил(а)
          {labelsToJSX(history.addedLabels)}
        </>
      );
    }
    if (history.removedLabels) {
      return (
        <>
          Убрал(а)
          {labelsToJSX(history.removedLabels)}
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

    if (secondsPassed <= 60) return 1000;
    if (secondsPassed <= (60 * 60)) return 1000 * 60;
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
    <Tooltip arrow title={formatToFullDate(date)}>
      <div>
        {timeAgo(date)}
      </div>
    </Tooltip>
  );
};
