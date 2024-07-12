import { Autocomplete, Box, Button, Checkbox, createFilterOptions, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, Slide, Stack, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { forwardRef, ReactElement, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './kanban-edit-task.module.less';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { IEmployee, IKanbanCard, IKanbanTask, Permissions } from '@gsbelarus/util-api-types';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { UserState } from '../../../features/user/userSlice';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { DateTimePicker, TimePicker } from '@mui/x-date-pickers-pro';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { useGetEmployeesQuery } from '../../../features/contact/contactApi';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import { useAddTaskMutation, useDeleteCardMutation, useDeleteTaskMutation, useGetKanbanDealsQuery, useUpdateCardMutation, useUpdateTaskMutation } from '../../../features/kanban/kanbanApi';
import filterOptions from '../../helpers/filter-options';
import { useGetTaskTypesQuery } from '../../../features/kanban/kanbanCatalogsApi';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: 0
  },
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    width: '25vw',
    minWidth: 400,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  dialogAction: {
    paddingRight: '3%',
    paddingLeft: '3%',
  },
  helperText: {
    '& p': {
      color: '#ec5555',
    },
  },
  button: {
    width: '120px',
  },
}));

// const filterOptions = createFilterOptions({
//   matchFrom: 'any',
//   limit: 50,
//   stringify: (option: IEmployee) => option.NAME,
// });

export interface KanbanEditTaskProps {
  open: boolean;
  task?: IKanbanTask;
  onSubmit: (task: IKanbanTask, deleting: boolean) => void;
  onCancelClick: () => void;
}

export function KanbanEditTask(props: KanbanEditTaskProps) {
  const { open, task } = props;
  const { onSubmit, onCancelClick } = props;

  const classes = useStyles();
  const [cards, setCards] = useState<IKanbanCard[]>([]);

  const { data: employees, isFetching: employeesIsFetching } = useGetEmployeesQuery();
  const { data: deals = [], isLoading: dealsIsLoading } = useGetKanbanDealsQuery({ userId: -1 });
  const { data: taskTypes = [], isFetching: taskTypesFetching } = useGetTaskTypesQuery();

  const refComment = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    refComment?.current && refComment.current.scrollIntoView({ behavior: 'smooth' });
  }, [refComment.current]);

  useEffect(() => {
    if (dealsIsLoading) return;
    setCards(deals.map(d => d.CARDS)?.flat());
  }, [deals, dealsIsLoading]);

  const user = useSelector<RootState, UserState>(state => state.user);

  const initValue: IKanbanTask = {
    ID: task?.ID || -1,
    USR$CARDKEY: task?.USR$CARDKEY || -1,
    USR$NAME: task?.USR$NAME || '',
    CREATOR: task?.CREATOR,
    USR$CLOSED: task?.USR$CLOSED || false,
    USR$DEADLINE: task?.USR$DEADLINE,
    TASKTYPE: task?.TASKTYPE,
    USR$INPROGRESS: task?.USR$INPROGRESS || false,
    DESCRIPTION: task?.DESCRIPTION ?? ''
  };

  const formik = useFormik<IKanbanTask>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...task,
      ...initValue,
    },
    validationSchema: yup.object().shape({
      USR$NAME: yup.string()
        .max(80, 'Слишком длинное описание'),
      CREATOR: yup.object()
        .required('Не указан постановщик'),
      TASKTYPE: yup.object()
        .required('Не указан тип задачи'),
    }),
    onSubmit: (values) => {
      onSubmit(values, false);
    },
    validateOnMount: true,
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const handleDeleteClick = () => {
    onSubmit(formik.values, true);
  };

  const handleCancelClick = useCallback(() => {
    onCancelClick();
  }, [formik, onCancelClick]);

  const handleClose = useCallback(() => {
    handleCancelClick();
  }, [handleCancelClick]);

  function combineDateAndTime(date?: Date, time?: Date) {
    if (!date || !time) return;

    const timeString = time.getHours() + ':' + time.getMinutes() + ':00';
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateString = '' + year + '-' + month + '-' + day;
    const combined = new Date(dateString + ' ' + timeString);

    return combined;
  };

  const [editDeal, setEditDeal] = useState(false);
  const contactId = useSelector<RootState, number | undefined>(state => state.user.userProfile?.contactkey);

  const dealCard = useMemo(() => cards?.find(el => el.ID === formik.values.USR$CARDKEY), [cards, formik.values.USR$CARDKEY]);

  const [updateCard] = useUpdateCardMutation();
  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const cardHandlers = {
    onSubmit: async (newCard: IKanbanCard, deleting: boolean) => {
      if (newCard.ID) {
        updateCard(newCard);
        setEditDeal(false);

        const tasksWithoutCurrent = dealCard?.TASKS?.filter(t => t.ID !== task?.ID);
        const newTasksWithoutCurrent = newCard.TASKS?.filter(t => t.ID !== task?.ID);

        const deletedTasks = tasksWithoutCurrent?.filter(task => (newTasksWithoutCurrent?.findIndex(({ ID }) => ID === task.ID) ?? -1) < 0) ?? [];
        deletedTasks.forEach(task => deleteTask(task.ID));

        newTasksWithoutCurrent?.forEach(task => {
          const oldTask = tasksWithoutCurrent?.find(({ ID }) => ID === task.ID);
          if (!oldTask) {
            addTask({ ...task, ID: -1 });
            return;
          };

          if (JSON.stringify(task) !== JSON.stringify(oldTask)) {
            updateTask(task);
          };
        });
      }
    },
    onCancel: async (newCard: IKanbanCard) => {
      setEditDeal(false);
    },
  };

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const canOpenDeal = useMemo(() =>
    formik.values.ID > 0 &&
    (dealCard?.DEAL?.CREATOR?.ID === contactId ||
    dealCard?.DEAL?.PERFORMERS?.some(performer => performer.ID === contactId) ||
    dealCard?.TASKS?.some(task => task.PERFORMER?.ID === contactId) ||
    userPermissions?.deals.ALL)
  , [dealCard]);

  const memoEditCard = useMemo(() => {
    return (
      <KanbanEditCard
        deleteable={false}
        open={editDeal}
        card={dealCard}
        currentStage={deals.find(column => column.ID === dealCard?.USR$MASTERKEY)}
        stages={deals}
        onSubmit={cardHandlers.onSubmit}
        onCancelClick={cardHandlers.onCancel}
      />
    );
  }, [editDeal, dealCard, deals]);


  return (
    <CustomizedDialog
      open={open}
      onClose={handleClose}
      confirmation={formik.dirty}
      width={500}
    >
      <DialogTitle>
        {Number(task?.ID) > 0 ? `Редактирование: ${task?.USR$NAME}` : 'Добавление задачи'}
      </DialogTitle>
      <DialogContent
        dividers
        className={classes.dialogContent}
      >
        <PerfectScrollbar>
          <Stack direction="column" p="16px 24px">
            <FormikProvider value={formik}>
              <Form id="taskForm" onSubmit={formik.handleSubmit}>
                <Stack direction="column" spacing={2}>
                  <Autocomplete
                    options={taskTypes || []}
                    value={taskTypes?.find(el => el.ID === formik.values.TASKTYPE?.ID) || null}
                    onChange={(e, value) => {
                      formik.setFieldValue(
                        'TASKTYPE',
                        value ? { ID: value.ID, NAME: value.NAME } : undefined
                      );
                    }}
                    getOptionLabel={option => option.NAME}
                    renderOption={(props, option) => (
                      <li {...props} key={option.ID}>
                        {option.NAME}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Тип задачи"
                        placeholder="Выберите тип задачи"
                        required
                        error={getIn(formik.touched, 'TASKTYPE') && Boolean(getIn(formik.errors, 'TASKTYPE'))}
                        helperText={getIn(formik.touched, 'TASKTYPE') && getIn(formik.errors, 'TASKTYPE')}
                      />
                    )}
                    loading={taskTypesFetching}
                    loadingText="Загрузка данных..."
                  />
                  <TextField
                    label="Описание"
                    type="text"
                    name="USR$NAME"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.USR$NAME}
                    autoFocus
                    minRows={1}
                    error={getIn(formik.touched, 'USR$NAME') && Boolean(getIn(formik.errors, 'USR$NAME'))}
                    helperText={getIn(formik.touched, 'USR$NAME') && getIn(formik.errors, 'USR$NAME')}
                  />
                  <Autocomplete
                    options={employees || []}
                    // readOnly
                    value={employees?.find(el => el.ID === formik.values.CREATOR?.ID) || null}
                    onChange={(e, value) => {
                      formik.setFieldValue(
                        'CREATOR',
                        value ? { ID: value.ID, NAME: value.NAME } : undefined
                      );
                    }}
                    getOptionLabel={option => option.NAME}
                    renderOption={(props, option) => (
                      <li {...props} key={option.ID}>
                        {option.NAME}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Постановщик"
                        placeholder="Выберите постановщика"
                        required
                        error={getIn(formik.touched, 'CREATOR') && Boolean(getIn(formik.errors, 'CREATOR'))}
                        helperText={getIn(formik.touched, 'CREATOR') && getIn(formik.errors, 'CREATOR')}
                      />
                    )}
                    loading={employeesIsFetching}
                    loadingText="Загрузка данных..."
                  />
                  <Autocomplete
                    options={employees || []}
                    filterOptions={filterOptions(50, 'NAME')}
                    value={employees?.find(el => el.ID === formik.values.PERFORMER?.ID) || null}
                    onChange={(e, value) => {
                      formik.setFieldValue(
                        'PERFORMER',
                        value ? { ID: value.ID, NAME: value.NAME } : undefined
                      );
                    }}
                    getOptionLabel={option => option.NAME}
                    renderOption={(props, option) => (
                      <li {...props} key={option.ID}>
                        {option.NAME}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Исполнитель"
                        placeholder="Выберите исполнителя"
                      />
                    )}
                    loading={employeesIsFetching}
                    loadingText="Загрузка данных..."
                  />
                  <Stack direction="row" spacing={1}>
                    <Autocomplete
                      options={cards}
                      fullWidth
                      filterOptions={(option, { inputValue }) => option.filter(o => o.DEAL?.USR$NAME?.toUpperCase().includes(inputValue.toUpperCase()) || o.DEAL?.CONTACT?.NAME?.toUpperCase().includes(inputValue.toUpperCase()))
                      }
                      getOptionLabel={option => option.DEAL?.USR$NAME || ''}
                      value={cards?.find(el => el.ID === formik.values.USR$CARDKEY) || null}
                      readOnly={(initValue.USR$CARDKEY || 0) > 0}
                      onChange={(e, value) => formik.setFieldValue('USR$CARDKEY', value?.ID)}
                      renderOption={(props, option) => (
                        <li {...props} key={option.ID}>
                          <Box>
                            <div>{option.DEAL?.USR$NAME}</div>
                            <Typography variant="caption">{option.DEAL?.CONTACT?.NAME}</Typography>
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Сделка"
                          placeholder="Выберите сделку"
                          // required
                        />
                      )}
                      loading={dealsIsLoading}
                      loadingText="Загрузка данных..."
                    />
                    {canOpenDeal &&
                      <IconButton color="primary" onClick={() => setEditDeal(true)}>
                        <VisibilityIcon visibility={'none'}/>
                      </IconButton>
                    }
                  </Stack>
                  <Divider textAlign="left">Срок выполнения</Divider>
                  <Stack direction="row" spacing={2}>
                    <DesktopDatePicker
                      label="Дата"
                      value={formik.values.USR$DEADLINE || null}
                      // onChange={formik.handleChange}
                      onChange={(value) => {
                        formik.setFieldValue('USR$DEADLINE', value);
                      }}
                      slotProps={{ textField: { variant: 'outlined' } }}
                    />
                    <TimePicker
                      label="Время"
                      ampm={false}
                      value={formik.values.USR$DEADLINE || null}
                      disabled={formik.values.USR$DEADLINE ? false : true}
                      onChange={(value) => {
                        formik.setFieldValue(
                          'USR$DEADLINE',
                          combineDateAndTime(formik.values.USR$DEADLINE ? new Date(formik.values.USR$DEADLINE) : new Date(), value || undefined)
                        );
                      }}
                      slotProps={{ textField: { variant: 'outlined' } }}
                    />
                  </Stack>
                  {!!formik.values.USR$DATECLOSE &&
                  <>
                    <Divider textAlign="left">Дата выполнения</Divider>
                    <Stack direction="row" spacing={2}>
                      <DesktopDatePicker
                        label="Дата"
                        readOnly
                        value={formik.values.USR$DATECLOSE || null}
                        onChange={formik.handleChange}
                        slotProps={{ textField: { variant: 'outlined' } }}
                      />
                      <TimePicker
                        label="Время"
                        ampm={false}
                        readOnly
                        value={formik.values.USR$DATECLOSE || null}
                        disabled={formik.values.USR$DATECLOSE ? false : true}
                        onChange={formik.handleChange}
                        slotProps={{ textField: { variant: 'outlined' } }}
                      />
                    </Stack>
                  </>}
                  <Divider />
                  <Stack direction="row" spacing={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="USR$INPROGRESS"
                          checked={!!formik.values.USR$INPROGRESS}
                          onChange={formik.handleChange}
                        />
                      }
                      label="В работе"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="USR$CLOSED"
                          checked={!!formik.values.USR$CLOSED}
                          // onChange={formik.handleChange}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            formik.setFieldValue('USR$CLOSED', checked);
                            if (checked) formik.setFieldValue('USR$INPROGRESS', false);
                          }}
                        />
                      }
                      label="Выполнена"
                    />
                  </Stack>
                  {formik.values.USR$CLOSED &&
                    <TextField
                      label="Комментарий"
                      ref={refComment}
                      type="text"
                      name="DESCRIPTION"
                      multiline
                      minRows={4}
                      onChange={formik.handleChange}
                      value={formik.values.DESCRIPTION}
                    />
                  }
                </Stack>
              </Form>
            </FormikProvider>
          </Stack>
        </PerfectScrollbar>
      </DialogContent>
      <DialogActions className={classes.dialogAction}>
        {formik.values.ID > 0 &&
          <PermissionsGate actionAllowed={userPermissions?.tasks?.DELETE}>
            <ItemButtonDelete button onClick={handleDeleteClick} />
          </PermissionsGate>
        }
        <Box flex={1} />
        <ButtonWithConfirmation
          className={classes.button}
          variant="outlined"
          onClick={handleCancelClick}
          title="Внимание"
          text={'Изменения будут утеряны. Продолжить?'}
          confirmation={formik.dirty}
        >
          Отменить
        </ButtonWithConfirmation>
        <Button
          className={classes.button}
          variant="contained"
          form="taskForm"
          type="submit"
        >
          Сохранить
        </Button>
      </DialogActions>
      {memoEditCard}
    </CustomizedDialog>
  );
}

export default KanbanEditTask;
