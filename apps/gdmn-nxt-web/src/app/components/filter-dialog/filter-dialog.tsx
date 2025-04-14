import { Button, CardActions, CardContent, useMediaQuery, useTheme } from '@mui/material';
import CustomizedDialog from '../Styled/customized-dialog/customized-dialog';
import { ReactNode } from 'react';

interface FilterDialogProps {
  open: boolean,
  onClose: () => void,
  onClear: () => void,
  children: ReactNode,
  width?: number
}

export default function FilterDialog(props: Readonly<FilterDialogProps>) {
  const {
    open,
    onClose,
    onClear,
    children,
    width
  } = props;

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <CustomizedDialog
      open={open}
      onClose={onClose}
      width={width}
      maxWidth="80%"
    >
      <CardContent style={{ flex: 1 }}>{children}</CardContent>
      <CardActions style={{ padding: '16px', flexDirection: 'column' }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            onClear();
            onClose();
          }}
        >
          Очистить
        </Button>
        {matchDownSm && <Button
          style={{ marginLeft: 0, marginTop: '10px', textTransform: 'none' }}
          variant="outlined"
          fullWidth
          onClick={() => onClose()}
        >
          Закрыть
        </Button>}
      </CardActions>
    </CustomizedDialog>
  );
}
