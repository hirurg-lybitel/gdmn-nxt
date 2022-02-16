import { Avatar, Stack, Theme, Typography, useTheme } from '@mui/material';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import './order-card.module.less';
import { makeStyles } from '@mui/styles';
import { CardWithBorderShadow } from '../../main-card/main-card';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    flex: 1,
    padding: 20,
    background: `linear-gradient(to right, ${theme.color.lightBlue[800]}, ${theme.color.lightBlue['A700']} 100%, transparent)`,
    position: 'relative'
  },
  amount: {
    fontSize: '2.125rem',
    fontWeight: 500,
    color: theme.color.common.white
  },
  title: {
    fontSize: '1rem',
    fontFamily: '"Roboto",sans-serif',
    color: theme.color.common.white
  },
  avatar: {
    color: theme.color.common.white,
    backgroundColor: theme.color.lightBlue[900],
    borderRadius: '8px',
    width: '60px',
    height: '60px',
    fontSize: '2.5rem',
    position: 'absolute',
    bottom: 0,
    marginBottom: 20,
    cursor: 'pointer'
  }
}));

const totalSum = 15488

function getFormattedNumber(value: number){
  return value.toLocaleString();
}
/* eslint-disable-next-line */
export interface OrderCardProps {}

export function OrderCard(props: OrderCardProps) {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <CardWithBorderShadow className={classes.card}>
      <Stack direction="row">
        <Typography className={classes.amount}>Br {getFormattedNumber(totalSum)}</Typography>
        <KeyboardDoubleArrowDownIcon fontSize="large" color="error" />
      </Stack>
      <Typography className={classes.title}>Всего Заказано</Typography>
      <Avatar className={classes.avatar}>
        <ShoppingBagOutlinedIcon fontSize="inherit"  />
      </Avatar>
    </CardWithBorderShadow>
  );
}

export default OrderCard;
