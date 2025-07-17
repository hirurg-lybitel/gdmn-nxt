import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import styles from './ticketsList.module.less';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import { Button, CardContent, Chip, Divider, Theme, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import AdjustIcon from '@mui/icons-material/Adjust';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

/* eslint-disable-next-line */
export interface ticketsListProps { }

const openTickets = Array.from({ length: 25 }, (_, i) => ({
  id: crypto.randomUUID(), // Генерация уникального идентификатора
  title: `Запрос на поддержку №${i + 1}`,
  opened: true,
  state: i % 5 === 0 ? 2 : 1,
}));

const closedTickets = Array.from({ length: 19 }, (_, i) => ({
  id: crypto.randomUUID(),
  title: `Закрытый тикет по проблеме №${i + 31}`,
  opened: false,
  state: 3,
}));

interface ITicket {
  id: string,
  title: string,
  opened: boolean,
  state: number,
}

const useStyles = makeStyles((theme: Theme) => ({
  itemTitle: {
    fontSize: '16px',
    color: 'inherit',
    textDecoration: 'none',
    marginBottom: '6px',
    '&:hover': {
      color: theme.palette.primary.main,
      textDecoration: 'underline'
    }
  },
  openBy: {
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.primary.main,
      textDecoration: 'underline'
    }
  }
}));

export function TicketsList(props: ticketsListProps) {
  const [statusFilter, setStatusFilter] = useState<'opened' | 'closed'>();

  const tickets = statusFilter === 'opened' ? openTickets : closedTickets;

  return (
    <CustomizedCard style={{ width: '100%' }}>
      <CustomCardHeader title={'Настройки'} />
      <Divider />
      <CardContent style={{ padding: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
          <div style={{ padding: '8px 16px' }}>
            <div>
              <Button style={{ gap: '5px', paddingRight: '6px' }} onClick={() => setStatusFilter('opened')}>
                Активные
                <Chip label={openTickets.length} size="small" />
              </Button>
              <Button style={{ gap: '5px', paddingRight: '6px' }} onClick={() => setStatusFilter('closed')}>
                Зарешенные
                <Chip
                  label={closedTickets.length}
                  size="small"
                />
              </Button>
            </div>
          </div>
          <Divider />
          <div style={{ overflow: 'auto', position: 'relative', flex: 1, width: '100%' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              {tickets.map((item, index) => <Item
                key={item.id}
                {...item}
                last={tickets.length - 1 === index}
              />)}
            </div>
          </div>
        </div>
      </CardContent>
    </CustomizedCard>
  );
}

interface IItemProps extends ITicket {
  last: boolean;
}

const Item = ({ id, title, state, last }: IItemProps) => {
  const classes = useStyles();

  const iconByStage = (stage: number) => {
    switch (stage) {
      case 1: return (
        <AdjustIcon color={'success'} />
      );
      case 2: return (
        <ErrorOutlineIcon color={'warning'} />
      );
      default: return (
        <CheckCircleOutlineIcon color={'primary'} />
      );
    }
  };

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '8px 16px', borderBottom: last ? 'none' : '1px solid var(--color-grid-borders)' }}>
      {iconByStage(state)}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Link to={id} className={classes.itemTitle} >
          {title}
        </Link>
        <Typography variant="caption" color="text.secondary">
          # {id}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Отрыт: <span className={classes.openBy}>Иван иванов иванович</span>
        </Typography>
      </div>
    </div >
  );
};

export default TicketsList;
