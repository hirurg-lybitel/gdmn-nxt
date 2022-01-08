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
import { RangeInput } from '@mui/lab/DateRangePicker/RangeTypes';

export interface ReportParamsProps {
  open: boolean;
  dates: RangeInput<Date | null>;
  onDateChange: (newValue: DateRange<Date | null>) => void;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

export function ReportParams(props: ReportParamsProps) {
  const { open } = props;
  const { onSaveClick, onCancelClick, onDateChange } = props;
  const { dates } = props;

  return (
    <Dialog open={open}>
      <DialogTitle>Введите параметры</DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateRangePicker
            startText="Начало периода"
            endText="Конец периода"
            value={dates}
            onChange={onDateChange}
            renderInput={(startProps, endProps) => (
              <React.Fragment>
                <TextField {...startProps} />
                <Box sx={{ mx: 2 }}> to </Box>
                <TextField {...endProps} />
              </React.Fragment>
            )}
          />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancelClick}
          variant="contained"
          color="primary"
          size="small">
            Отменить
        </Button>
        <Button
          onClick={onSaveClick}
          variant="contained"
          color="primary"
          size="small">
            OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReportParams;
