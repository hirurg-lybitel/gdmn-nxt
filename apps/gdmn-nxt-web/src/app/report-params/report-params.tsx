import './report-params.module.less';
import DateRangePicker, { DateRange } from '@mui/lab/DateRangePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import {
  Dialog,
  DialogTitle,
  TextField,
  Box ,
  DialogContent,
  DialogActions,
  Button } from '@mui/material';
import React from 'react';
import { useStyles } from './styles';
import ruLocale from 'date-fns/locale/ru';

export interface ReportParamsProps {
  open: boolean;
  dates: DateRange<Date | null>;
  //onDateChange?: (newValue: DateRange<Date | null>) => void;
  onCancelClick: () => void;
  onSaveClick: (arg: DateRange<Date>) => void;
}

export function ReportParams(props: ReportParamsProps) {
  const { open } = props;
  const { onSaveClick, onCancelClick } = props;
  const { dates } = props;

  const [value, setValue] = React.useState<DateRange<Date>>(dates[0] && dates[1] ? dates : [new Date(), new Date()]);

  const classes = useStyles();

  return (
    <Dialog open={open}>
      <DialogTitle>Введите параметры</DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={ruLocale}>
          <DateRangePicker
            startText="Начало периода"
            endText="Конец периода"
            value={value}
            onChange={setValue}
            renderInput={(startProps: object, endProps: object) => (
              <React.Fragment>
                <TextField {...startProps} />
                <Box sx={{ mx: 2 }}/>
                <TextField {...endProps} />
              </React.Fragment>
            )}
          />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions className={classes.dialogAction} >
        <Button
          className={classes.button}
          onClick={onCancelClick}
          variant="text"
          color="primary"
          //size="small"
        >
            Отменить
        </Button>
        <Button
          className={classes.button}
          onClick={() => onSaveClick(value)}
          variant="contained"
          color="primary"
          //size="small"
        >
            OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReportParams;
