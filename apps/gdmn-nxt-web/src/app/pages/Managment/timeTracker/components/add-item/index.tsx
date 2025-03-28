import styles from './styles.module.less';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { Autocomplete, Box, Button, Checkbox, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { DatePicker, TimePicker, TimeValidationError } from '@mui/x-date-pickers-pro';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import EditNoteIcon from '@mui/icons-material/EditNote';
import StopIcon from '@mui/icons-material/Stop';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
// import { useAddFavoriteMutation, useDeleteFavoriteMutation, useGetWorkProjectsQuery } from 'apps/gdmn-nxt-web/src/app/features/work-projects';
import { ICustomer, ITimeTrack, ITimeTrackTask, IWorkProject } from '@gsbelarus/util-api-types';
import dayjs, { durationFormat } from '@gdmn-nxt/dayjs';
import * as yup from 'yup';
import TextFieldMasked from '@gdmn-nxt/components/textField-masked/textField-masked';
import filterOptions from '@gdmn-nxt/helpers/filter-options';
import { GroupHeader, GroupItems } from '@gdmn-nxt/components/Kanban/kanban-edit-card/components/group';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import { useGetTaskQuery } from 'apps/gdmn-nxt-web/src/app/features/time-tracking';
import { useAutocompleteVirtualization } from '@gdmn-nxt/helpers/hooks/useAutocompleteVirtualization';

const durationMask = [
  /[0-9]/,
  /[0-9]/,
  ':',
  /[0-5]/,
  /[0-9]/,
  ':',
  /[0-5]/,
  /[0-9]/
];

type CalcMode = 'calc' | 'manual';
type SubmitMode = 'add' | 'update';

interface AddItemProps {
  initial?: Partial<ITimeTrack>;
  onSubmit: (value: ITimeTrack, mode: SubmitMode) => void
}

export const AddItem = ({
  initial,
  onSubmit
}: AddItemProps) => {
  const [calcMode, setCalcMode] = useState<CalcMode>(initial?.inProgress ? 'calc' : 'manual');
  const [submitMode, setSubmitMode] = useState<SubmitMode>('add');
  const [isValidTimers, toggleValidTimers] = useState(true);
  const currentDate = useMemo(() => dayjs().toDate(), []);

  const calcModeChange = (
    event: MouseEvent<HTMLElement>,
    newAlignment: CalcMode | null,
  ) => {
    newAlignment && setCalcMode(newAlignment);
  };

  const initialValues = {
    ID: -1,
    date: currentDate,
    customer: null,
    startTime: currentDate,
    endTime: null,
    description: '',
    inProgress: false,
    billable: true,
    task: undefined,
  };

  const formik = useFormik<ITimeTrack>({
    enableReinitialize: true,
    initialValues: {
      ...initialValues,
      ...initial,
      ...(initial?.date && {
        date: dayjs(initial.date).toDate()
      }),
      ...(initial?.startTime && {
        startTime: dayjs(initial.startTime).toDate()
      }),
      ...(initial?.endTime && {
        endTime: dayjs(initial.endTime).toDate()
      }),
    },
    validationSchema: yup.object().shape({
      date: yup.date().required('Не указана дата')
    }),
    onSubmit: (values, { resetForm }) => {
      if (!isValidTimers) {
        return;
      }

      onSubmit(values, submitMode);
      resetForm();

      /** Устанавливаем выбранную дату, чтобы можно было добавить несколько записей за прошедший день без перевыбора даты*/
      formik.setFieldValue('date', values.date);
    },
  });

  useEffect(() => {
    if (!formik.values.inProgress) {
      return;
    }

    setCalcMode('calc');

    const clockId = setInterval(() => {
      const startTime = dayjs(formik.values.startTime);
      const endTime = dayjs();
      const duration = dayjs.duration(endTime.diff(startTime));

      formik.setFieldValue('duration', duration.toISOString());
    }, 1000);

    return () => {
      clearInterval(clockId);
    };
  }, [formik, formik.values.inProgress]);

  useEffect(() => {
    calcDuration(
      formik.values.startTime,
      formik.values.endTime
    );
  }, [
    formik.values.startTime,
    formik.values.endTime
  ]);

  const handleCustomerChange = useCallback((customer: ICustomer | null | undefined) => {
    formik.setFieldValue('customer', customer);
  }, []);

  const calcDuration = (
    startTime?: Date | null,
    endTime?: Date | null
  ) => {
    if (!endTime || !startTime) {
      return;
    }

    const dStartTime = dayjs(startTime);
    const dEndTime = dayjs(endTime);

    if (dEndTime.isBefore(dStartTime)) {
      return;
    }

    const duration = dayjs.duration(dEndTime.diff(dStartTime));
    formik.setFieldValue('duration', duration.toISOString());
  };

  const handleDateTimeChange = (fieldName: string) => (value: Date | null) => {
    if (!dayjs(value).isValid()) {
      return;
    }

    formik.setFieldValue(fieldName, value);

    formik.values.date?.setSeconds(0, 0);
    formik.values.startTime?.setSeconds(0, 0);
    formik.values.endTime?.setSeconds(0, 0);
  };

  const startClick = () => {
    setSubmitMode('add');
    formik.setFieldValue('date', dayjs().toDate());
    formik.setFieldValue('startTime', dayjs().toDate());
    formik.setFieldValue('endTime', null);
    formik.setFieldValue('inProgress', true);

    formik.submitForm();
  };

  const stopClick = () => {
    setSubmitMode('update');
    formik.setFieldValue('endTime', dayjs().toDate());
    formik.setFieldValue('inProgress', false);

    const startTime = dayjs(formik.values.startTime);
    const endTime = dayjs(formik.values.endTime);

    const duration = dayjs.duration(endTime.diff(startTime));
    formik.setFieldValue('duration', duration.toISOString());

    toggleValidTimers(true);

    formik.submitForm();
  };

  const addClick = () => {
    setSubmitMode('add');
    formik.submitForm();
  };

  const timePickerOnError = (e: TimeValidationError, v: Date | null) => toggleValidTimers(!e);

  const durationOnChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const [hours, minutes, seconds] = e.target.value
      .replaceAll('_', '0')
      .split(':')
      .map(Number);

    const newDuration = dayjs.duration({ hours, minutes, seconds });
    const isoDuration = newDuration.toISOString();
    formik.setFieldValue('duration', isoDuration);

    const startTime = dayjs(formik.values.startTime);
    formik.setFieldValue('endTime', startTime.add(newDuration).toDate());
  };

  const billableChange = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    formik.setFieldValue('billable', checked);
  };

  const handleTaskSelected = async (task: ITimeTrackTask | null) => {
    formik.setFieldValue('task', task);
  };

  const [descriptionOnFocus, setDescriptionOnFocus] = useState(false);

  const matches = useMediaQuery('(max-width:755px)');

  return (
    <CustomizedCard className={styles.itemCard}>
      <FormikProvider value={formik}>
        <Form id="timeTrackingForm" onSubmit={formik.handleSubmit}>
          <Stack
            direction={matches ? 'column' : 'row'}
            spacing={2}
            alignItems="center"
          >
            <Stack
              width={matches ? '100%' : undefined}
              spacing={1}
              flex={1}
            >
              <CustomerSelect
                disableEdition
                disableCaption
                disableFavorite={false}
                withTasks
                debt
                agreement
                required
                value={formik.values.customer}
                onChange={handleCustomerChange}
                task={formik.values.task}
                onTaskSelected={handleTaskSelected}
                error={getIn(formik.touched, 'customer') && Boolean(getIn(formik.errors, 'customer'))}
                helperText={getIn(formik.touched, 'customer') && getIn(formik.errors, 'customer')}
              />
              <div style={{ height: '40px', width: '100%', position: 'relative' }}>
                <TextField
                  placeholder="Над чем вы работали?"
                  name="description"
                  multiline
                  minRows={1}
                  {...(!descriptionOnFocus && { rows: 1 })}
                  fullWidth
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--color-paper-bg)',
                    zIndex: 2
                  }}
                  onFocus={() => setDescriptionOnFocus(true)}
                  onBlur={() => setDescriptionOnFocus(false)}
                />
              </div>
            </Stack>
            {calcMode === 'manual' &&
              <Stack
                width={matches ? '100%' : 216}
                spacing={1}
                direction={matches ? 'row' : 'column'}
              >
                <DatePicker
                  slotProps={{ textField: { placeholder: 'Сегодня' } }}
                  value={formik.values.date}
                  onChange={handleDateTimeChange('date')}
                  sx={{
                    '& .MuiInputBase-root': {
                      paddingRight: 1,
                    }
                  }}
                />
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                >
                  <TimePicker
                    className={styles.selectTime}
                    slotProps={{
                      textField: {
                        sx: {
                          '& .MuiInputBase-root': {
                            paddingRight: 1,
                          }
                        }
                      },
                    }}
                    views={['hours', 'minutes']}
                    name="startTime"
                    value={formik.values.startTime}
                    onChange={handleDateTimeChange('startTime')}
                    onError={timePickerOnError}
                  />
                  <div>-</div>
                  <TimePicker
                    className={styles.selectTime}
                    slotProps={{
                      textField: {
                        sx: {
                          '& .MuiInputBase-root': {
                            paddingRight: 1,
                          }
                        }
                      },
                    }}
                    views={['hours', 'minutes']}
                    name="endTime"
                    minTime={formik.values.startTime ?? undefined}
                    value={formik.values.endTime}
                    onChange={handleDateTimeChange('endTime')}
                    onError={timePickerOnError}
                  />
                </Stack>
              </Stack>
            }
            <Stack
              direction={matches ? 'row-reverse' : 'column'}
              width={matches ? '100%' : undefined}
              spacing={2}
            >
              <Stack spacing={1} direction={matches ? 'row-reverse' : 'row'}>
                <Box display="inline-flex" alignSelf="center">
                  {calcMode === 'calc'
                    ? (formik.values.inProgress)
                      ? <Button
                        className={styles.startButton}
                        color="error"
                        variant="contained"
                        startIcon={<StopIcon />}
                        onClick={stopClick}
                        disabled={!formik.values.customer}
                      >
                        Стоп
                      </Button>
                      : <Button
                        className={styles.startButton}
                        variant="contained"
                        startIcon={<PlayCircleFilledWhiteIcon />}
                        onClick={startClick}
                        disabled={!formik.values.customer}
                      >
                        Начать
                      </Button>
                    : <Button
                      className={styles.startButton}
                      variant="contained"
                      onClick={addClick}
                      disabled={!formik.values.customer || !formik.values.duration}
                    >
                      Добавить
                    </Button>}

                </Box>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={calcMode}
                  onChange={calcModeChange}
                  disabled={calcMode === 'calc' && formik.values.inProgress}
                >
                  <Tooltip arrow title="Таймер">
                    <ToggleButton value="calc" style={{ padding: 5 }}>
                      <AccessTimeFilledIcon />
                    </ToggleButton>
                  </Tooltip>
                  <Tooltip arrow title="Вручную">
                    <ToggleButton value="manual" style={{ padding: 5 }}>
                      <EditNoteIcon />
                    </ToggleButton>
                  </Tooltip>
                </ToggleButtonGroup>
              </Stack>
              <Stack
                alignItems="center"
                spacing={1}
                direction={matches ? 'row-reverse' : 'row'}
              >
                <TextFieldMasked
                  label="Длительность"
                  style={{
                    maxWidth: 117
                  }}
                  mask={durationMask}
                  value={durationFormat(formik.values.duration)}
                  onChange={durationOnChange}
                />
                <Tooltip title={formik.values.billable ? 'Оплачиваемый' : 'Неоплачиваемый'}>
                  <Checkbox
                    size="small"
                    icon={<MonetizationOnOutlinedIcon fontSize="medium" />}
                    checkedIcon={<MonetizationOnIcon fontSize="medium" />}
                    sx={{
                      height: 34,
                      width: 34,
                    }}
                    checked={formik.values.billable}
                    onChange={billableChange}
                  />
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>
        </Form>
      </FormikProvider>
    </CustomizedCard>
  );
};
