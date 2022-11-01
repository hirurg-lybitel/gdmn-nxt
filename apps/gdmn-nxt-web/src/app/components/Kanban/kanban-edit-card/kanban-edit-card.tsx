import './kanban-edit-card.module.less';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Slide,
  Stack,
  TextField,
  Theme,
  Box,
  Divider,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Tab,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { forwardRef, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { IKanbanCard, IKanbanColumn } from '@gsbelarus/util-api-types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { ICustomer } from '@gsbelarus/util-api-types';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import KanbanHistory from '../kanban-history/kanban-history';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { useGetEmployeesQuery } from '../../../features/contact/contactApi';
import { UserState } from '../../../features/user/userSlice';
import { useGetCustomersQuery } from '../../../features/customer/customerApi_new';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import KanbanTasks from '../kanban-tasks/kanban-tasks';
import { useGetDepartmentsQuery } from '../../../features/departments/departmentsApi';
import filterOptions from '../../filter-options';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import { useGetDenyReasonsQuery } from '../../../features/kanban/kanbanApi';


const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    width: '40vw',
    [theme.breakpoints.down('ultraWide')]: {
      width: '50vw'
    },
    maxWidth: '100%',
    minWidth: 400,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  accordionTitle: {
    width: '33%',
    flexShrink: 0
  },
  accordionCaption: {
    color: theme.color.grey['500']
  },
  button: {
    width: '120px',
  },
  tabPanel: {
    flex: 1,
    display: 'flex',
    padding: 0,
    paddingBottom: 16
  },
}));


const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export interface KanbanEditCardProps {
  open: boolean;
  currentStage?: IKanbanColumn;
  card?: IKanbanCard;
  stages: IKanbanColumn[];
  onSubmit: (arg1: IKanbanCard, arg2: boolean) => void;
  onCancelClick: () => void;
  onClose: (e: any, r: string) => void;
}

export function KanbanEditCard(props: KanbanEditCardProps) {
  const { open, currentStage, card, stages } = props;
  const { onSubmit, onCancelClick, onClose } = props;

  const classes = useStyles();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState('');
  const [tabIndex, setTabIndex] = useState('1');
  const user = useSelector<RootState, UserState>(state => state.user);

  const { data: employees, isFetching: employeesIsFetching } = useGetEmployeesQuery();
  const { data, isFetching: customerFetching } = useGetCustomersQuery();
  const customers: ICustomer[] = useMemo(() => [...data?.data || []], [data?.data]);
  const { data: departments, isFetching: departmentsIsFetching, refetch: departmentsRefetch } = useGetDepartmentsQuery();
  const { data: denyReasons, isFetching: denyReasonsIsFetching } = useGetDenyReasonsQuery();

  const refComment = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    refComment && refComment.current && refComment.current.scrollIntoView({ behavior: 'smooth' });
  }, [refComment.current]);

  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));

  const handleChangeAccordion = (panel: string) => (event: any, newExpanded: any) => {
    if (newExpanded) setExpanded(panel);
    if (expanded === panel) setExpanded('');
  };

  const handleDeleteClick = () => {
    setDeleting(true);
    setConfirmOpen(true);
  };

  const handleCancelClick = () => {
    setDeleting(false);
    formik.resetForm();
    onCancelClick();
  };

  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const initValue: IKanbanCard = {
    ID: card?.ID || 0,
    USR$MASTERKEY: card?.USR$MASTERKEY || currentStage?.ID || 0,
    USR$INDEX: card?.USR$INDEX || currentStage?.CARDS?.length || 0,
    USR$DEALKEY: card?.USR$DEALKEY || -1,
    DEAL: {
      ...card?.DEAL,
      ID: card?.DEAL?.ID || -1,
      USR$NAME: card?.DEAL?.USR$NAME || '',
      CREATOR:
        card?.ID
          ? card?.DEAL?.CREATOR
          : {
            ID: user.userProfile?.contactkey || -1,
            NAME: ''
          },
      DEPARTMENT: card?.DEAL?.DEPARTMENT,
      PERFORMER: card?.DEAL?.PERFORMER,
      CONTACT: card?.DEAL?.CONTACT,
      COMMENT: card?.DEAL?.COMMENT || '',
      CREATIONDATE: card?.DEAL?.CREATIONDATE || currentDate
    },
    TASKS: card?.TASKS || undefined,
  };

  const formik = useFormik<IKanbanCard>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...card,
      ...initValue
    },
    validationSchema: yup.object().shape({
      USR$MASTERKEY: yup.string().required(''),
      DEAL: yup.object()
        .shape({
          USR$NAME: yup.string()
            .required('Не указано наименование')
            .max(20, 'Слишком длинное наименование'),
          CONTACT: yup.object()
            .nullable()
            .required('Не указан клиент'),
          CREATOR: yup.object()
            .nullable()
            .required('Не указан создатель'),
          DEPARTMENT: yup.object()
            .nullable()
            .required('Не указан отдел'),
          CONTACT_NAME: yup.string().nullable().max(80, 'Слишком длинное имя'),
          CONTACT_EMAIL: yup.string()
            .nullable()
            .matches(/@./, 'Адрес электрочнной почты должен содержать символы @ и .')
            .max(40, 'Слишком длинный email'),
          CONTACT_PHONE: yup.string().nullable().max(40, 'Слишком длинный номер'),
          REQUESTNUMBER: yup.string().nullable().max(20, 'Слишком длинный номер'),
          PRODUCTNAME: yup.string().nullable().max(180, 'Слишком длинное наименование'),
        })
    }),
    onSubmit: (values) => {
      if (!confirmOpen) {
        setDeleting(false);
        setConfirmOpen(true);
        return;
      };
      setConfirmOpen(false);
    },
    onReset: () => {
      setTabIndex('1');
    }
  });

  const handleConfirmOkClick = useCallback(() => {
    setConfirmOpen(false);
    onSubmit(formik.values, deleting);
  }, [formik.values, deleting]);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const KanbanRequestInfo = useMemo(() => {
    if ((getIn(formik.touched, 'DEAL.REQUESTNUMBER') && Boolean(getIn(formik.errors, 'DEAL.REQUESTNUMBER'))) ||
        (getIn(formik.touched, 'DEAL.PRODUCTNAME') && Boolean(getIn(formik.errors, 'DEAL.PRODUCTNAME'))) ||
        (getIn(formik.touched, 'DEAL.CONTACT_NAME') && Boolean(getIn(formik.errors, 'DEAL.CONTACT_NAME'))) ||
        (getIn(formik.touched, 'DEAL.CONTACT_EMAIL') && Boolean(getIn(formik.errors, 'DEAL.CONTACT_EMAIL'))) ||
        (getIn(formik.touched, 'DEAL.CONTACT_PHONE') && Boolean(getIn(formik.errors, 'DEAL.CONTACT_PHONE')))) {
      setTabIndex('2');
    };

    return (
      <Stack flex={1} spacing={3}>
        <TextField
          label="Продукция"
          type="text"
          name="DEAL.PRODUCTNAME"
          onChange={formik.handleChange}
          value={formik.values.DEAL?.PRODUCTNAME || ''}
          error={getIn(formik.touched, 'DEAL.PRODUCTNAME') && Boolean(getIn(formik.errors, 'DEAL.PRODUCTNAME'))}
          helperText={getIn(formik.touched, 'DEAL.PRODUCTNAME') && getIn(formik.errors, 'DEAL.PRODUCTNAME')}
        />
        <Stack direction={"row"} spacing={3}>
          <TextField
            fullWidth
            label="Номер заявки"
            type="text"
            name="DEAL.REQUESTNUMBER"
            onChange={formik.handleChange}
            value={formik.values.DEAL?.REQUESTNUMBER || ''}
            error={getIn(formik.touched, 'DEAL.REQUESTNUMBER') && Boolean(getIn(formik.errors, 'DEAL.REQUESTNUMBER'))}
            helperText={getIn(formik.touched, 'DEAL.REQUESTNUMBER') && getIn(formik.errors, 'DEAL.REQUESTNUMBER')}
          />
          <DesktopDatePicker
            label="Дата"
            value={formik.values.DEAL?.CREATIONDATE}
            inputFormat="dd.MM.yyyy"
            onChange={(value) => formik.setFieldValue('DEAL.CREATIONDATE', value)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Stack>
        <Divider />
        <TextField
          label="Заявитель"
          type="text"
          name="DEAL.CONTACT_NAME"
          onChange={formik.handleChange}
          value={formik.values.DEAL?.CONTACT_NAME || ''}
          error={getIn(formik.touched, 'DEAL.CONTACT_NAME') && Boolean(getIn(formik.errors, 'DEAL.CONTACT_NAME'))}
          helperText={getIn(formik.touched, 'DEAL.CONTACT_NAME') && getIn(formik.errors, 'DEAL.CONTACT_NAME')}
        />
        <Stack flex={1} spacing={3} direction={{ sm: 'column', md: 'row', lg: 'row' }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            name="DEAL.CONTACT_EMAIL"
            onChange={formik.handleChange}
            value={formik.values.DEAL?.CONTACT_EMAIL || ''}
            error={getIn(formik.touched, 'DEAL.CONTACT_EMAIL') && Boolean(getIn(formik.errors, 'DEAL.CONTACT_EMAIL'))}
            helperText={getIn(formik.touched, 'DEAL.CONTACT_EMAIL') && getIn(formik.errors, 'DEAL.CONTACT_EMAIL')}
          />
          <TextField
            label="Телефон"
            type="text"
            fullWidth
            name="DEAL.CONTACT_PHONE"
            onChange={formik.handleChange}
            value={formik.values.DEAL?.CONTACT_PHONE || ''}
            error={getIn(formik.touched, 'DEAL.CONTACT_PHONE') && Boolean(getIn(formik.errors, 'DEAL.CONTACT_PHONE'))}
            helperText={getIn(formik.touched, 'DEAL.CONTACT_PHONE') && getIn(formik.errors, 'DEAL.CONTACT_PHONE')}
          />
        </Stack>
      </Stack>
    )
  }, [formik.values, formik.touched, formik.errors]);


  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      title={deleting ? 'Удаление' : 'Сохранение'}
      text="Вы уверены, что хотите продолжить?"
      dangerous={deleting}
      confirmClick={handleConfirmOkClick}
      cancelClick={handleConfirmCancelClick}
    />,
    [confirmOpen, deleting, handleConfirmOkClick, handleConfirmCancelClick]);

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      classes={{
        paper: classes.dialog
      }}
      onClose={onClose}
    >
      <DialogTitle>
        {formik.values.ID > 0 ? `Редактирование ${card?.DEAL?.USR$NAME}` : 'Создание сделки'}
      </DialogTitle>
      <DialogContent dividers style={{ padding: 0 }}>
        <PerfectScrollbar style={{ padding: '16px 24px', display: 'flex' }}>
          <FormikProvider value={formik}>
            <Form id="mainForm" onSubmit={formik.handleSubmit} style={{ flex: 1, display: 'flex' }}>
              <Stack spacing={3} flex={1}>
                <Stepper
                  activeStep={stages.findIndex(stage => stage.ID === formik.values.USR$MASTERKEY)}
                  alternativeLabel
                  style={{
                    ...(matchDownLg ? { display: 'none' } : '')
                  }}
                >
                  {stages.map(stage =>
                    <Step key={stage.ID}>
                      <StepLabel>{stage.USR$NAME}</StepLabel>
                    </Step>)}
                </Stepper>
                <TabContext value={tabIndex}>
                  <Box>
                    <TabList onChange={handleTabsChange}>
                      <Tab label="Сведения" value="1" />
                      <Tab label="Заявка" value="2" />
                      <Tab label="Задачи" value="3" />
                      <Tab label="Хронология" value="4" />
                    </TabList>
                  </Box>
                  <Divider style={{ margin: 0 }} />
                  <TabPanel value="1" className={tabIndex === '1' ? classes.tabPanel : ''}>
                    <Stack flex={1} spacing={3}>
                      <TextField
                        label="Наименование"
                        type="text"
                        required
                        fullWidth
                        autoFocus
                        name="DEAL.USR$NAME"
                        onChange={(e) => {
                          const value = e.target.value;
                          formik.setFieldValue(
                            'DEAL',
                            { ...formik.values.DEAL, USR$NAME: value ? value : null }
                          );
                        }}
                        value={formik.values.DEAL?.USR$NAME || ''}
                        error={getIn(formik.touched, 'DEAL.USR$NAME') && Boolean(getIn(formik.errors, 'DEAL.USR$NAME'))}
                        helperText={getIn(formik.touched, 'DEAL.USR$NAME') && getIn(formik.errors, 'DEAL.USR$NAME')}
                      />
                      <Stack direction={matchDownLg ? 'column' : 'row'} spacing={3}>
                        <Autocomplete
                          options={customers || []}
                          fullWidth
                          getOptionLabel={option => option.NAME}
                          filterOptions={filterOptions(50, 'NAME')}
                          value={customers?.find(el => el.ID === formik.values.DEAL?.CONTACT?.ID) || null}
                          loading={customerFetching}
                          loadingText="Загрузка данных..."
                          // onOpen={formik.handleBlur}
                          onChange={(event, value) => {
                            formik.setFieldValue('DEAL.CONTACT', value);
                          }}
                          renderOption={(props, option) => {
                            return (
                              <li {...props} key={option.ID}>
                                {option.NAME}
                              </li>
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Клиент"
                              placeholder="Выберите клиента"
                              required
                              name="DEAL.CONTACT"
                              error={getIn(formik.touched, 'DEAL.CONTACT') && Boolean(getIn(formik.errors, 'DEAL.CONTACT'))}
                              helperText={getIn(formik.touched, 'DEAL.CONTACT') && getIn(formik.errors, 'DEAL.CONTACT')}
                            />
                          )}
                        />
                        <TextField
                          label="Источник"
                          fullWidth
                          type="text"
                          name="DEAL.USR$SOURCE"
                          value={formik.values.DEAL?.USR$SOURCE || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            formik.setFieldValue(
                              'DEAL',
                              { ...formik.values.DEAL, USR$SOURCE: value ? value : null }
                            );
                          }}
                        />
                      </Stack>
                      <Stack direction="row" spacing={3}>
                        <TextField
                          label="Сумма"
                          type="number"
                          name="DEAL.USR$AMOUNT"
                          fullWidth
                          InputProps={{
                            startAdornment: <InputAdornment position="start">BYN</InputAdornment>,
                          }}
                          value={formik.values.DEAL?.USR$AMOUNT || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            formik.setFieldValue(
                              'DEAL',
                              { ...formik.values.DEAL, USR$AMOUNT: value ? value : null }
                            );
                          }}
                          placeholder="0.00"
                        />
                        <DesktopDatePicker
                          label="Срок"
                          value={formik.values.DEAL?.USR$DEADLINE || null}
                          // mask="__.__.____"
                          inputFormat="dd.MM.yyyy"
                          onChange={(value) => {
                            formik.setFieldValue(
                              'DEAL',
                              { ...formik.values.DEAL, USR$DEADLINE: value ? value : null }
                            );
                          }}
                          renderInput={(params) => <TextField {...params} fullWidth/>}
                        />
                      </Stack>

                      <Divider variant="middle" />
                      <Stack direction={matchDownMd ? 'column' : 'column'} spacing={3}>
                        <Autocomplete
                          fullWidth
                          options={employees || []}
                          getOptionLabel={option => option.NAME}
                          filterOptions={filterOptions(50, 'NAME')}
                          value={employees?.find(el => el.ID === formik.values.DEAL?.CREATOR?.ID) || null}
                          loading={employeesIsFetching}
                          loadingText="Загрузка данных..."
                          // onOpen={formik.handleBlur}
                          onChange={(event, value) => {
                            formik.setFieldValue('DEAL.CREATOR', value);
                          }}
                          renderOption={(props, option) => {
                            return (
                              <li {...props} key={option.ID}>
                                {option.NAME}
                              </li>
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Создал"
                              // name="DEAL.CREATOR"
                              required
                              placeholder="Выберите сотрудника"
                              error={getIn(formik.touched, 'DEAL.CREATOR') && Boolean(getIn(formik.errors, 'DEAL.CREATOR'))}
                              helperText={getIn(formik.touched, 'DEAL.CREATOR') && getIn(formik.errors, 'DEAL.CREATOR')}
                            />
                          )}
                        />
                        <Autocomplete
                          fullWidth
                          options={departments || []}
                          getOptionLabel={option => option.NAME}
                          filterOptions={filterOptions(50, 'NAME')}
                          value={departments?.find(el => el.ID === formik.values.DEAL?.DEPARTMENT?.ID) || null}
                          loading={departmentsIsFetching}
                          loadingText="Загрузка данных..."
                          // onOpen={formik.handleBlur}
                          onChange={(event, value) => {
                            formik.setFieldValue(
                              'DEAL',
                              { ...formik.values.DEAL, DEPARTMENT: value ? value : null }
                            );
                          }}
                          renderOption={(props, option) => {
                            return (
                              <li {...props} key={option.ID}>
                                {option.NAME}
                              </li>
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Отдел"
                              required
                              placeholder="Выберите отдел"
                              name="DEAL.DEPARTMENT"
                              error={getIn(formik.touched, 'DEAL.DEPARTMENT') && Boolean(getIn(formik.errors, 'DEAL.DEPARTMENT'))}
                              helperText={getIn(formik.touched, 'DEAL.DEPARTMENT') && getIn(formik.errors, 'DEAL.DEPARTMENT')}
                            />
                          )}
                        />
                        <Autocomplete
                          fullWidth
                          options={employees || []}
                          getOptionLabel={option => option.NAME}
                          filterOptions={filterOptions(50, 'NAME')}
                          readOnly={formik.values.DEAL?.USR$READYTOWORK || false}
                          value={employees?.find(el => el.ID === formik.values.DEAL?.PERFORMER?.ID) || null}
                          loading={employeesIsFetching}
                          loadingText="Загрузка данных..."
                          // onOpen={formik.handleBlur}
                          onChange={(event, value) => {
                            formik.setFieldValue(
                              'DEAL',
                              { ...formik.values.DEAL, PERFORMER: value ? value : null }
                            );
                            formik.setFieldValue(
                              'USR$MASTERKEY',
                              value ? stages[1].ID : stages[0].ID
                            );
                          }}
                          renderOption={(props, option) => {
                            return (
                              <li {...props} key={option.ID}>
                                {option.NAME}
                              </li>
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Исполнитель"
                              disabled={formik.values.DEAL?.USR$READYTOWORK || false}
                              placeholder="Выберите сотрудника"
                              name="DEAL.PERFORMER"
                            />
                          )}
                        />
                      </Stack>
                      <Stack direction="row" spacing={3}>
                        <Stack>
                          <Stack direction="row" spacing={3}>
                            {(formik.values.USR$MASTERKEY === stages[1].ID || formik.values.USR$MASTERKEY === stages[2].ID) ?
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={formik.values.DEAL?.USR$READYTOWORK}
                                    onChange={(e) => {
                                      const value = e.target.checked;
                                      formik.setFieldValue(
                                        'DEAL',
                                        { ...formik.values.DEAL, USR$READYTOWORK: value }
                                      );
                                      formik.setFieldValue(
                                        'USR$MASTERKEY',
                                        value ? stages[2].ID : stages[1].ID
                                      );
                                    }}
                                  />
                                }
                                label="В работе"
                              />
                              : <></>}
                            {(formik.values.USR$MASTERKEY === stages[2].ID || formik.values.USR$MASTERKEY === stages[3].ID) ?
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={formik.values.DEAL?.USR$DONE}
                                    onChange={(e) => {
                                      const value = e.target.checked;
                                      formik.setFieldValue(
                                        'DEAL',
                                        { ...formik.values.DEAL, USR$DONE: value }
                                      );
                                      formik.setFieldValue(
                                        'USR$MASTERKEY',
                                        value ? stages[3].ID : stages[2].ID
                                      );
                                    }}
                                  />
                                }
                                label="Исполнено"
                              />
                              : <></>
                            }
                            {(formik.values.USR$MASTERKEY === stages[3].ID || formik.values.USR$MASTERKEY === stages[4].ID) ?
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={formik.values.DEAL?.DENIED}
                                    onChange={(e) => {
                                      const value = e.target.checked;
                                      formik.setFieldValue(
                                        'DEAL',
                                        { ...formik.values.DEAL, DENIED: value }
                                      );
                                      formik.setFieldValue(
                                        'USR$MASTERKEY',
                                        value ? stages[4].ID : stages[3].ID
                                      );
                                    }}
                                  />
                                }
                                label="Отказ"
                              />
                              : <></>
                            }
                          </Stack>
                          <Box flex={1} />
                        </Stack>

                        {formik.values.DEAL?.DENIED &&
                          <Stack flex={1} spacing={3}>
                            <Autocomplete
                              options={denyReasons || []}
                              getOptionLabel={option => option.NAME}
                              value={denyReasons?.find(el => el.ID === formik.values.DEAL?.DENYREASON?.ID) || null}
                              loading={denyReasonsIsFetching}
                              loadingText="Загрузка данных..."
                              // onOpen={formik.handleBlur}
                              onChange={(event, value) => {
                                formik.setFieldValue(
                                  'DEAL',
                                  { ...formik.values.DEAL, DENYREASON: value ? value : null }
                                );
                              }}
                              renderOption={(props, option) => {
                                return (
                                  <li {...props} key={option.ID}>
                                    {option.NAME}
                                  </li>
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Причина отказа"
                                  autoFocus
                                  required
                                  placeholder="Выберите причину отказа"
                                  name="DEAL.DENYREASON"
                                  error={getIn(formik.touched, 'DEAL.DENYREASON') && Boolean(getIn(formik.errors, 'DEAL.DENYREASON'))}
                                  helperText={getIn(formik.touched, 'DEAL.DENYREASON') && getIn(formik.errors, 'DEAL.DENYREASON')}
                                />
                              )}
                            />
                            <TextField
                              label="Комментарий"
                              ref={refComment}
                              type="text"
                              name="COMMENT"
                              multiline
                              minRows={4}
                              // onChange={formik.handleChange}
                              onChange={(e) => {
                                formik.setFieldValue('DEAL.COMMENT', e.target.value);
                              }}
                              value={formik.values.DEAL.COMMENT}
                              // helperText={formik.errors.USR$DESCRIPTION}
                            />
                          </Stack>}

                      </Stack>

                      {/* <FormControlLabel
                        control={
                          <Checkbox
                            checked={formik.values.DEAL?.DENIED}
                            onChange={(e) => {
                              const value = e.target.checked;
                              formik.setFieldValue(
                                'DEAL',
                                { ...formik.values.DEAL, DENIED: value }
                              );
                              formik.setFieldValue(
                                'USR$MASTERKEY',
                                value ? stages[4].ID : stages[4].ID
                              );
                            }}
                          />
                        }
                        label="Отказ"
                      /> */}
                    </Stack>
                  </TabPanel>
                  <TabPanel value="2" className={tabIndex === '2' ? classes.tabPanel : ''}>
                    {KanbanRequestInfo}
                  </TabPanel>
                  <TabPanel value="3" className={tabIndex === '3' ? classes.tabPanel : ''}>
                    <KanbanTasks card={card} />
                  </TabPanel>
                  <TabPanel value="4" className={tabIndex === '4' ? classes.tabPanel : ''}>
                    <CustomizedCard
                      borders
                      style={{
                        borderColor: 'lightgrey',
                        flex: 1,
                        marginBottom: '16px'
                      }}
                    >
                      <PerfectScrollbar>
                        {card?.ID
                          ? <KanbanHistory cardId={card.ID} />
                          : <></>}
                      </PerfectScrollbar>
                    </CustomizedCard>

                  </TabPanel>
                </TabContext>
              </Stack>
            </Form>
          </FormikProvider>
        </PerfectScrollbar>
      </DialogContent>
      <DialogActions style={{ display: 'flex' }}>
        <PermissionsGate actionCode={4}>
          <IconButton onClick={handleDeleteClick} size="large" >
            <DeleteIcon />
          </IconButton>
        </PermissionsGate>
        <Box flex={1} />
        {/* <Button variant="outlined" color="error" onClick={handleDeleteClick}>Удалить</Button> */}
        <Button
          className={classes.button}
          onClick={handleCancelClick}
        >Отменить</Button>
        <PermissionsGate actionCode={formik.values.ID > 0 ? 3 : 1}>
          <Button
            className={classes.button}
            form="mainForm"
            type="submit"
            variant="contained"
            disabled={customerFetching || employeesIsFetching || denyReasonsIsFetching || departmentsIsFetching}
          >Сохранить</Button>
        </PermissionsGate>
      </DialogActions>
      {memoConfirmDialog}
    </Dialog>
  );
}

export default KanbanEditCard;
