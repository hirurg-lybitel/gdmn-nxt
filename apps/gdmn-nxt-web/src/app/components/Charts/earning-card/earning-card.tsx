import { Avatar, Stack, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import MainCard from '../../main-card/main-card';
import './earning-card.module.less';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    flex: 1,
    padding: 20,
    background: `linear-gradient(to right, ${theme.color.cyan[800]}, ${theme.color.cyan['A700']} 100%, transparent)`,
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
    backgroundColor: theme.color.cyan[900],
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

const totalSum = 268540.23
/* eslint-disable-next-line */
export interface EarningCardProps {}

function getFormattedNumber(value: number){
  return value.toLocaleString();
}

export function EarningCard(props: EarningCardProps) {
  const classes = useStyles();

  return (
    <MainCard
      border
      boxShadow
      className={classes.card}
      style= {{
        flex: 1,
      }}
    >
      <Stack direction="row">
        <Typography className={classes.amount}>Br {getFormattedNumber(totalSum)}</Typography>
        <KeyboardDoubleArrowUpIcon fontSize="large" color="success" />
      </Stack>

      <Avatar className={classes.avatar}>
        <MonetizationOnOutlinedIcon fontSize="inherit"  />
      </Avatar>
      <Typography className={classes.title}>Общая Выручка</Typography>

    </MainCard>
  );
}

export default EarningCard;
