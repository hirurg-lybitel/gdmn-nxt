import { Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogTitle: {
      paddingTop: '12px',
      paddingBottom: '12px'
    },
    dialogAction: {
      display: 'flex',
      justifyContent: 'flex-start',
      padding: '12px 24px',
    },
    button: {
      width: '50%',
    },
  }),
);

export default useStyles;
