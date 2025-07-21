import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import styles from './ticketsList.module.less';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import { Button, CardContent, Chip, Divider, Skeleton, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import AdjustIcon from '@mui/icons-material/Adjust';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAddTicketMutation, useGetAllTicketsQuery } from '../../../features/tickets/ticketsApi';
import { ITicket } from '@gsbelarus/util-api-types';
import UserTooltip from '@gdmn-nxt/components/userTooltip/user-tooltip';
import pluralize from 'libs/util-useful/src/lib/pluralize';
import TicketEdit from './ticketEdit';

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
  const [statusFilter, setStatusFilter] = useState<'opened' | 'closed'>('opened');

  const { data, refetch, isLoading, isFetching } = useGetAllTicketsQuery({ active: statusFilter === 'opened' });
  const [addTicket] = useAddTicketMutation();

  const [openEdit, setOpenEdit] = useState(false);

  const handleSubmit = useCallback((ticket: ITicket, isDelete: boolean) => {
    setOpenEdit(false);
    addTicket(ticket);
  }, [addTicket]);

  const memoEdit = useMemo(() => (
    <TicketEdit
      open={openEdit}
      onSubmit={handleSubmit}
      onCancelClick={() => setOpenEdit(false)}
    />
  ), [handleSubmit, openEdit]);

  return (
    <>
      {memoEdit}
      <CustomizedCard style={{ width: '100%' }}>
        <CustomCardHeader
          title={'Настройки'}
          addButton
          addButtonHint="Создать тикет"
          onAddClick={() => setOpenEdit(true)}
        />
        <Divider />
        <CardContent style={{ padding: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <div style={{ padding: '8px 16px' }}>
              <div>
                <Button
                  sx={(theme) => ({ gap: '5px', paddingRight: '6px', color: statusFilter === 'closed' ? theme.palette.text.primary : undefined })}
                  onClick={() => setStatusFilter('opened')}
                >
                  Активные
                  <Chip label={openTickets.length} size="small" />
                </Button>
                <Button
                  sx={(theme) => ({ gap: '5px', paddingRight: '6px', color: statusFilter === 'opened' ? theme.palette.text.primary : undefined })}
                  onClick={() => setStatusFilter('closed')}
                >
                  Завершенные
                  <Chip
                    label={closedTickets.length}
                    size="small"
                  />
                </Button>
                <Button onClick={refetch}>
                  refresh
                </Button>
              </div>
            </div>
            <Divider />
            <div style={{ overflow: 'auto', position: 'relative', flex: 1, width: '100%' }}>
              <div style={{ position: 'absolute', inset: 0 }}>
                {(data && !isLoading && !isFetching) ?
                  data.length > 0 ? data.map((item, index) => (
                    <Item
                      key={item.id}
                      {...item}
                      last={false}
                    />
                  ))
                    : <h2 style={{ textAlign: 'center', opacity: '0.2', userSelect: 'none' }}>Нет тикетов</h2>
                  : Array.from({ length: 25 }, (_, index) => {
                    return (
                      <Skeleton
                        key={index}
                        height={83}
                        style={{ marginBottom: '2px' }}
                        variant="rectangular"
                      />
                    );
                  })
                }
              </div>
            </div>
          </div>
        </CardContent>
      </CustomizedCard>
    </>
  );
}

interface IItemProps extends ITicket {
  last: boolean;
}

const Item = ({ id, title, state, last, sender, openAt }: IItemProps) => {
  const classes = useStyles();

  function timeAgo(date: Date): string {
    const now = new Date();
    const openAt = new Date(date);
    const diffMs = now.getTime() - openAt.getTime();

    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hour = Math.floor(min / 60);
    const day = Math.floor(hour / 24);
    const month = Math.floor(day / 30);
    const year = Math.floor(month / 12);

    if (sec < 60) return `${sec} ${pluralize(sec, 'секунду', 'секунды', 'секунд')} назад`;
    if (min < 60) return `${min} ${pluralize(min, 'минуту', 'минуты', 'минут')} назад`;
    if (hour < 24) return `${hour} ${pluralize(hour, 'час', 'часа', 'часов')} назад`;
    if (day < 30) return `${day} ${pluralize(day, 'день', 'дня', 'дней')} назад`;
    if (month < 12) return `${month} ${pluralize(month, 'месяц', 'месяца', 'месяцев')} назад`;
    return `${year} ${pluralize(year, 'год', 'года', 'лет')} назад`;
  }

  function formatDate(dateString: Date): string {
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // месяцы от 0
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

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
      {iconByStage(state.code)}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Link to={id + ''} className={classes.itemTitle} >
          {title}
        </Link>
        <Typography variant="caption" color="text.secondary">
          # {id}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          style={{ display: 'flex', gap: '5px' }}
        >
          Открыт
          <UserTooltip
            name={sender.fullName}
            phone={sender.phone}
            email={sender.email}
            avatar={sender.avatar}
          >
            <div className={classes.openBy}>{sender.fullName}</div>
          </UserTooltip>
          <Tooltip arrow title={formatDate(openAt)}>
            <div>
              {timeAgo(openAt)}
            </div>
          </Tooltip>
        </Typography>
      </div>
    </div >
  );
};

export default TicketsList;
