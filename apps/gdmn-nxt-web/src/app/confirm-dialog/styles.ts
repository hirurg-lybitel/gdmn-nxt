import { Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogTitle: {
      paddingTop: '12px',
      paddingBottom: '12px',
      backgroundColor: 'var(--color-card-bg)'
    },
    dialogAction: {
      display: 'flex',
      justifyContent: 'flex-start',
      padding: '12px 24px',
    },
    button: {
      minWidth: '100px'
    },
    closeButton: {
      position: 'absolute',
      top: '10px',
      right: '10px'
    }
  }),
);

export default useStyles;
