import { Theme } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogAction: {
      display: 'flex',
      justifyContent: 'flex-start',
    },
    button: {
      width: '50%',
    },
  }),
);

export default useStyles;
