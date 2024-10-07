import styles from './styles.module.less';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { Autocomplete, Box, Button, Checkbox, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { DatePicker, TimePicker, TimeValidationError } from '@mui/x-date-pickers-pro';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import EditNoteIcon from '@mui/icons-material/EditNote';
import StopIcon from '@mui/icons-material/Stop';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { CustomerSelect } from '@gdmn-nxt/components/Kanban/kanban-edit-card/components/customer-select';
import { useAddFavoriteMutation, useDeleteFavoriteMutation, useGetWorkProjectsQuery } from 'apps/gdmn-nxt-web/src/app/features/work-projects';
import { ICustomer, ITimeTrack, ITimeTrackTask, IWorkProject } from '@gsbelarus/util-api-types';
import dayjs, { durationFormat } from '@gdmn-nxt/dayjs';
import * as yup from 'yup';
import TextFieldMasked from '@gdmn-nxt/components/textField-masked/textField-masked';
import filterOptions from '@gdmn-nxt/components/helpers/filter-options';
import { GroupHeader, GroupItems } from '@gdmn-nxt/components/Kanban/kanban-edit-card/components/group';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import { useGetTaskQuery } from 'apps/gdmn-nxt-web/src/app/features/time-tracking';

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
  const [addFavorite] = useAddFavoriteMutation();
  const [deleteFavorite] = useDeleteFavoriteMutation();

  const [calcMode, setCalcMode] = useState<CalcMode>(initial?.inProgress ? 'calc' : 'manual');
  const [submitMode, setSubmitMode] = useState<SubmitMode>('add');
  const [isValidTimers, toggleValidTimers] = useState(true);
  const currentDate = useMemo(() => dayjs().toDate(), []);
  const [onDate, setOnDate] = useState<Date>(currentDate);

  const {
    data: workProjects = [],
    isFetching: workProjectsFetching,
    isLoading: workProjectsLoading
  } = useGetWorkProjectsQuery();

  const calcModeChange = (
    event: MouseEvent<HTMLElement>,
    newAlignment: CalcMode | null,
  ) => {
    newAlignment && setCalcMode(newAlignment);
  };

  const { STATUS, ...defaultWorkProject } = workProjects.length > 0 ? workProjects[0] : { } as IWorkProject;

  const initialValues = {
    ID: -1,
    date: onDate,
    customer: null,
    startTime: currentDate,
    endTime: null,
    description: '',
    inProgress: false,
    workProject: Object.keys(defaultWorkProject).length > 0 ? defaultWorkProject : undefined,
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

      /** Запоминаем выбранную дату, чтобы можно было добавить несколько записей за прошедший день без перевыбора даты*/
      setOnDate(values.date);
    }
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
    if (value) {
      setOnDate(value);
    }
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

  const handleWorkProjectChange = (e: any, value: IWorkProject | null) => formik.setFieldValue('workProject', value);;

  const handleFavoriteClick = useCallback((workProject: IWorkProject) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    workProject.isFavorite
      ? deleteFavorite(workProject.ID)
      : addFavorite(workProject.ID);
  }, []);

  const billableChange = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    formik.setFieldValue('billable', checked);
  };

  const [selectedTask, setSelectedTask] = useState<ITimeTrackTask | null>(null);
  const { data: selectedTaskInfo } = useGetTaskQuery(selectedTask?.ID ?? -1, { skip: !selectedTask });

  const handleTaskSelected = async (task: ITimeTrackTask | null) => {
    setSelectedTask(task);
    formik.setFieldValue('task', task);
  };

  useEffect(() => {
    if (!selectedTaskInfo) {
      return;
    }

    const workProjectIndex = workProjects.findIndex(p => p.NAME === selectedTaskInfo.project?.name);
    if (workProjectIndex < 0) {
      return;
    }

    formik.setFieldValue('workProject', workProjects[workProjectIndex]);
  }, [selectedTaskInfo, workProjects]);

  return (
    <CustomizedCard className={styles.itemCard}>
      <FormikProvider value={formik}>
        <Form id="timeTrackingForm" onSubmit={formik.handleSubmit}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <Stack spacing={1} flex={1}>
              <TextField
                placeholder="Над чем вы работали?"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                style={{
                  flex: 1
                }}
                InputProps={{
                  startAdornment:
                  <InputAdornment position="start">
                    <div style={{ position: 'relative', color: 'transparent' }}>
                      {/* Костыль для автоширины Autocomplete */}
                      <Stack direction={'row'}>
                        {workProjectsLoading
                          ? 'Загрузка'
                          : `${formik.values.workProject?.NAME ?? defaultWorkProject.NAME}`
                        }
                        <Box width={34} />
                      </Stack>
                      <Autocomplete
                        disableClearable
                        options={workProjects}
                        loading={workProjectsFetching}
                        loadingText="Загрузка данных..."
                        value={formik.values.workProject ?? defaultWorkProject}
                        filterOptions={filterOptions(100, 'NAME')}
                        getOptionLabel={option => option?.NAME ?? ''}
                        onChange={handleWorkProjectChange}
                        sx={{
                          position: 'absolute',
                          top: -2,
                          width: '100%',
                          '& .MuiInput-root::before': { borderBottom: 0 }
                        }}

                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                          />
                        )}
                        slotProps={{
                          paper: {
                            style: {
                              width: 'max-content'
                            }
                          }
                        }}
                        renderOption={(props, option) => (
                          <li
                            {...props}
                            key={option.ID}
                            style={{
                              paddingTop: 2,
                              paddingBottom: 2
                            }}
                          >
                            {option.NAME}
                            <Box flex={1} minWidth={12} />
                            <SwitchStar selected={!!option.isFavorite} onClick={handleFavoriteClick(option)} />
                          </li>
                        )}
                        groupBy={({ isFavorite }: IWorkProject) => isFavorite ? 'Избранные' : 'Остальные'}
                        renderGroup={(params) => (
                          <li key={params.key}>
                            <GroupHeader>
                              <Typography variant="subtitle1">{params.group}</Typography>
                            </GroupHeader>
                            <GroupItems>{params.children}</GroupItems>
                          </li>
                        )}
                      />
                    </div>
                  </InputAdornment>,
                }}
              />
              <CustomerSelect
                disableEdition
                disableCaption
                disableFavorite={false}
                withTasks
                required
                value={formik.values.customer}
                onChange={handleCustomerChange}
                task={formik.values.task}
                onTaskSelected={handleTaskSelected}
                error={getIn(formik.touched, 'customer') && Boolean(getIn(formik.errors, 'customer'))}
                helperText={getIn(formik.touched, 'customer') && getIn(formik.errors, 'customer')}
              />
            </Stack>
            {calcMode === 'manual' &&
              <Stack spacing={1} width={216}>
                <DatePicker
                  slotProps={{ textField: { placeholder: 'Сегодня' } }}
                  value={onDate}
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
                    name="endTime"
                    minTime={formik.values.startTime ?? undefined}
                    value={formik.values.endTime}
                    onChange={handleDateTimeChange('endTime')}
                    onError={timePickerOnError}
                  />
                </Stack>
              </Stack>
            }
            <Stack spacing={2}>
              <Stack spacing={1} direction="row">
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
                direction="row"
                alignItems="center"
                spacing={1}
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
