import { Button, CardActions, CardContent, useMediaQuery, useTheme } from '@mui/material';
import CustomizedDialog from '../Styled/customized-dialog/customized-dialog';
import { ReactNode, useEffect, useMemo, useState } from 'react';

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
    width: propsWiddth
  } = props;

  const theme = useTheme();

  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

  const width = useMemo(() => propsWiddth ?? matchDownMd ? 320 : 400, [matchDownMd, propsWiddth]);

  const modile = useMediaQuery(`(max-width:${width + 200}px)`);

  return (
    <CustomizedDialog
      open={open}
      onClose={onClose}
      width={width}
    >
      <CardContent style={{ flex: 1 }}>{children}</CardContent>
      <CardActions style={{ padding: '16px', flexDirection: 'column' }}>
        <Button
          variant={modile ? 'outlined' : 'contained'}
          fullWidth
          onClick={() => {
            onClear();
            onClose();
          }}
        >
          Очистить
        </Button>
        {modile && <Button
          style={{ marginLeft: 0, marginTop: '10px', textTransform: 'none' }}
          variant="contained"
          fullWidth
          onClick={() => onClose()}
        >
          Закрыть
        </Button>}
      </CardActions>
    </CustomizedDialog>
  );
}
