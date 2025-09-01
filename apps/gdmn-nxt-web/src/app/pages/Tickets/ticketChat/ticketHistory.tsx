import UserTooltip from '@gdmn-nxt/components/userTooltip/user-tooltip';
import { ITicketHistory, ticketStateCodes, UserType } from '@gsbelarus/util-api-types';
import { TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import { Avatar } from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CreateIcon from '@mui/icons-material/Create';
import AdjustIcon from '@mui/icons-material/Adjust';
import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InfoIcon from '@mui/icons-material/Info';

interface ITicketHistoryProps {
  history: ITicketHistory;
  ticketId?: number;
}

export default function TicketHistory({ history, ticketId }: Readonly<ITicketHistoryProps>) {
  const getIconByStateCode = (code: number) => {
    switch (code) {
      case 1: return <CreateIcon />;
      case 2: return <PersonAddIcon />;
      case 3: return <PersonIcon />;
      case 4: return <SettingsIcon />;
      case 5: return <InfoIcon />;
      case 6: return <DoneIcon />;
      case 7: return <DoneAllIcon />;
      default: return <Brightness1Icon />;
    }
  };

  const ticketsUser = useSelector<RootState, boolean>(state => state.user.userProfile?.type === UserType.Tickets);

  const getTextByStateCode = (code: number) => {
    switch (code) {
      case 1: return `создал ${ticketsUser ? 'заявку' : 'тикет'} №${ticketId}`;
      case 2: return <span>назначил <UserTooltip
        name={history.performer?.fullName ?? ''}
        phone={history.performer?.phone}
        email={history.performer?.email}
        avatar={history.performer?.avatar}
      >
        <span>{history.performer?.fullName}</span>
      </UserTooltip>
      </span>;
      case 3: return <span>переназначил <UserTooltip
        name={history.performer?.fullName ?? ''}
        phone={history.performer?.phone}
        email={history.performer?.email}
        avatar={history.performer?.avatar}
      >
        <span>{history.performer?.fullName}</span>
      </UserTooltip>
      </span>;
      default: return `изменил(a) статус ${ticketsUser ? 'заявки' : 'тикета'} на "${history.state.name}"`;
    }
  };

  const name = history.user?.fullName ?? 'Система';

  return (
    <div key={history.ID} style={{ marginLeft: '50px' }}>
      <TimelineItem
        key={history.ID}
        sx={{
          '&::before': {
            display: 'none'
          }
        }}
      >
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot variant="outlined" style={{ margin: '4px 0px' }}>
            {getIconByStateCode(history.state.code)}
          </TimelineDot>
          <TimelineConnector style={{ visibility: history.state.code !== ticketStateCodes.confirmed ? 'visible' : 'hidden' }} />
        </TimelineSeparator>
        <TimelineContent style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', padding: '8px 16px' }}>
          <UserTooltip
            name={name}
            phone={history.user?.phone}
            email={history.user?.email}
            avatar={history.user?.avatar ? history.user?.email : undefined}
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
          <div>
            {getTextByStateCode(history.state.code)}
          </div>
        </TimelineContent>
      </TimelineItem>
    </div>
  );
};
