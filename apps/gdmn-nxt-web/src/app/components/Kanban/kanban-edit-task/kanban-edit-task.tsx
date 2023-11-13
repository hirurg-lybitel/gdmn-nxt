import { Autocomplete, Box, Button, Checkbox, createFilterOptions, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, Slide, Stack, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { forwardRef, ReactElement, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './kanban-edit-task.module.less';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { IEmployee, IKanbanCard, IKanbanTask } from '@gsbelarus/util-api-types';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { UserState } from '../../../features/user/userSlice';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { DesktopDatePicker, TimePicker } from '@mui/x-date-pickers-pro';
import { useGetEmployeesQuery } from '../../../features/contact/contactApi';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import { useAddTaskMutation, useDeleteCardMutation, useDeleteTaskMutation, useGetKanbanDealsQuery, useUpdateCardMutation, useUpdateTaskMutation } from '../../../features/kanban/kanbanApi';
import filterOptions from '../../helpers/filter-options';
import { useGetTaskTypesQuery } from '../../../features/kanban/kanbanCatalogsApi';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';

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
  field: {
    '& .MuiInputBase-input':{
      padding:'8.5px'
    },
    '& .MuiFormLabel-root':{
      top:'-8.5px'
    },
  }
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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    CREATOR: task?.CREATOR
      ? task.CREATOR
      : {
        ID: user.userProfile?.contactkey || -1,
        NAME: user.userProfile?.userName || ''
      },
    USR$CLOSED: task?.USR$CLOSED || false,
    USR$DEADLINE: task?.USR$DEADLINE,
    TASKTYPE: task?.TASKTYPE
      ? task.TASKTYPE
      : {
        ID: -1,
        NAME: ''
      },
    USR$INPROGRESS: task?.USR$INPROGRESS || false,
    DESCRIPTION: task?.DESCRIPTION ?? ''
  };

  const formik = useFormik<IKanbanTask>({
    enableReinitialize: true,
    initialValues: {
      ...task,
      ...initValue,
    },
    validationSchema: yup.object().shape({
      USR$NAME: yup.string()
        .required('')
        .max(80, 'Слишком длинное описание'),
      // USR$CARDKEY: yup.number()
      //   .required()
      //   .moreThan(-1),
      // TASKTYPE: yup.object().shape({
      //   ID: yup.number()
      //     .required()
      //     .moreThan(-1),
      // })
    }),
    onSubmit: (values) => {
      if (!confirmOpen) {
        setDeleting(false);
        setConfirmOpen(true);
        return;
      };
      setConfirmOpen(false);
    },
    validateOnMount: true,
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const handleDeleteClick = () => {
    setDeleting(true);
    setConfirmOpen(true);
  };

  const handleCancelClick = useCallback(() => {
    setDeleting(false);
    onCancelClick();
  }, [formik, onCancelClick]);

  const handleConfirmOkClick = useCallback(() => {
    setConfirmOpen(false);
    onSubmit(formik.values, deleting);
  }, [formik.values, deleting]);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

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

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      title={deleting ? 'Удаление задачи' : 'Сохранение'}
      text="Вы уверены, что хотите продолжить?"
      dangerous={deleting}
      confirmClick={handleConfirmOkClick}
      cancelClick={handleConfirmCancelClick}
    />,
  [confirmOpen, deleting]);


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
    onCancel: async (isFetching?: boolean) => {
      setEditDeal(false);
    },
  };

  const canOpenDeal = useMemo(() =>
    formik.values.ID > 0 &&
    (dealCard?.DEAL?.CREATOR?.ID === contactId ||
    dealCard?.DEAL?.PERFORMERS?.some(performer => performer.ID === contactId))
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
                <Stack direction="column" spacing={3}>
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
                        size='small'
                        label="Тип задачи"
                        placeholder="Выберите тип задачи"
                      />
                    )}
                    loading={taskTypesFetching}
                    loadingText="Загрузка данных..."
                  />
                  <TextField
                    size='small'
                    style={{marginTop:'15px'}}
                    label="Описание"
                    type="text"
                    name="USR$NAME"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.USR$NAME}
                    required
                    autoFocus
                    multiline
                    minRows={1}
                  />
                  <Autocomplete
                    options={employees || []}
                    style={{marginTop:'15px'}}
                    readOnly
                    value={employees?.find(el => el.ID === formik.values.CREATOR?.ID) || null}
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
                        size='small'
                        label="Постановщик"
                        placeholder="Выберите постановщика"
                        required
                      />
                    )}
                    loading={employeesIsFetching}
                    loadingText="Загрузка данных..."
                  />
                  <Autocomplete
                    options={employees || []}
                    style={{marginTop:'15px'}}
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
                        size='small'
                        label="Исполнитель"
                        placeholder="Выберите исполнителя"
                      />
                    )}
                    loading={employeesIsFetching}
                    loadingText="Загрузка данных..."
                  />
                  <Stack direction="row" spacing={1} style={{marginTop:'15px'}}>
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
                          size='small'
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
                  <Divider textAlign="left" style={{marginTop:'5px'}}>Срок выполнения</Divider>
                  <Stack direction="row" spacing={3} style={{marginTop:'15px'}}>
                    <DesktopDatePicker
                      className={classes.field}
                      label="Дата"
                      value={formik.values.USR$DEADLINE || null}
                      mask="__.__.____"
                      // onChange={formik.handleChange}
                      onChange={(value) => {
                        formik.setFieldValue('USR$DEADLINE', value);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    <TimePicker
                      className={classes.field}
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
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Stack>
                  {/* <Divider textAlign="left" style={{marginTop:'5px'}}>Дата выполнения</Divider>
                  <Stack direction="row" spacing={3} style={{marginTop:'5px'}}>
                    <DesktopDatePicker
                      className={classes.field}
                      label="Дата"
                      readOnly
                      value={formik.values.USR$DATECLOSE || null}
                      mask="__.__.____"
                      onChange={formik.handleChange}
                      // onChange={(value) => {
                      //   formik.setFieldValue(
                      //     'DEAL',
                      //     { ...formik.values.DEAL, USR$DEADLINE: value ? value : null }
                      //   );
                      // }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    <TimePicker
                      className={classes.field}
                      label="Время"
                      readOnly
                      value={formik.values.USR$DATECLOSE || null}
                      onChange={formik.handleChange}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Stack> */}
                  <Divider style={{marginTop:'15px'}} />
                  <Stack direction="row" spacing={3} style={{marginTop:'5px'}}>
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
        <IconButton onClick={handleDeleteClick} size="small">
          <DeleteIcon />
        </IconButton>
        }
        <Box flex={1} />
        <Button
          className={classes.button}
          onClick={handleCancelClick}
          variant="text"
          color="primary"
        >
            Отменить
        </Button>
        <Button
          className={classes.button}
          type={!formik.isValid ? 'submit' : 'button'}
          form="taskForm"
          onClick={() => {
            setDeleting(false);
            setConfirmOpen(formik.isValid);
          }}
          variant="contained"
        >
            OK
        </Button>
      </DialogActions>
      {memoConfirmDialog}
      {memoEditCard}
    </CustomizedDialog>
  );
}

export default KanbanEditTask;
