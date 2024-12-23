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
      gap: '8px',
      padding: '12px',
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
