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
  createFilterOptions,
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
import { forwardRef, ReactElement, useState } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import { makeStyles } from '@mui/styles';
import { ErrorMessage, Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { IDeal, IKanbanCard, IKanbanColumn } from '@gsbelarus/util-api-types';
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


const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    width: '40vw',
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
    padding: 0
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

// const filterOptions = createFilterOptions({
//   matchFrom: 'any',
//   limit: 100,
//   stringify: (option: ICustomer) => option.NAME,
// });

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
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState('');
  const [tabIndex, setTabIndex] = useState('1');
  const user = useSelector<RootState, UserState>(state => state.user);

  const { data: employees, isFetching: employeesIsFetching } = useGetEmployeesQuery();
  const { data: customers, isFetching: customerFetching } = useGetCustomersQuery();
  const { data: departments, isFetching: departmentsIsFetching, refetch: departmentsRefetch } = useGetDepartmentsQuery();


  // console.log('employees', employees);

  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));
  // const allCustomers = customers as ICustomer[];

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

  const initValue: IKanbanCard & IDeal = {
    ID: card?.ID || -1,
    USR$MASTERKEY: card?.USR$MASTERKEY || currentStage?.ID || -1,
    USR$INDEX: card?.USR$INDEX || currentStage?.CARDS?.length || 0,
    USR$NAME: card?.DEAL?.USR$NAME || '',
    USR$DEALKEY: card?.USR$DEALKEY || -1,
    USR$CONTACTKEY: card?.DEAL?.CONTACT?.ID || -1,
    DEAL: card?.DEAL || {
      ID: -1,
      CREATOR: {
        ID: user.userProfile?.contactkey || -1,
        NAME: ''
      },
      DEPARTMENT: card?.DEAL?.DEPARTMENT || undefined,
    },
    CREATOR: card?.DEAL?.CREATOR || undefined,
    PERFORMER: card?.DEAL?.PERFORMER || undefined,
    USR$READYTOWORK: card?.DEAL?.USR$READYTOWORK || false,
    USR$DONE: card?.DEAL?.USR$DONE || false,
    TASKS: card?.TASKS || undefined
  };

  const formik = useFormik<IKanbanCard & IDeal>({
    enableReinitialize: true,
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
          PERFORMER: yup.object()
            .nullable()
            .required('Не указан создатель сделки'),
          DEPARTMENT: yup.object()
            .nullable()
            .required('Не указан отдел')
            // .shape({
            //   ID: yup.number()
            //     .nullable()
            //     .required('Не указан отдел 2')
            // })
        })
    }),
    onSubmit: (values) => {
      setConfirmOpen(false);
      onSubmit(values, deleting);
    },
    onReset: () => {
      setTabIndex('1');
    }
  });

  // console.log('KanbanEditCard', formik.values);
  // console.log('getIn', getIn(formik.errors, 'DEAL.DEPARTMENT'), Boolean(getIn(formik.errors, 'DEAL.DEPARTMENT')));

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
        {formik.values.ID > 0 ? `Редактирование ${formik.values?.DEAL?.USR$NAME}` : 'Создание сделки'}
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
                      <Tab label="Задачи" value="2" />
                      <Tab label="Хронология" value="3" />
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
                        name="USR$NAME"
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          const value = e.target.value;
                          formik.setFieldValue(
                            'DEAL',
                            { ...formik.values.DEAL, USR$NAME: value ? value : null }
                          );
                        }}
                        value={formik.values.DEAL?.USR$NAME || ''}
                        error={Boolean(getIn(formik.errors, 'DEAL.USR$NAME'))}
                        helperText={getIn(formik.errors, 'DEAL.USR$NAME')}
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
                          onChange={(event, value) => {
                            formik.setFieldValue(
                              'DEAL',
                              { ...formik.values.DEAL, CONTACT: value ? value : null }
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
                              label="Клиент"
                              placeholder="Выберите клиента"
                              required
                              error={Boolean(getIn(formik.errors, 'DEAL.CONTACT'))}
                              helperText={getIn(formik.errors, 'DEAL.CONTACT')}
                            />
                          )}
                        />
                        <TextField
                          label="Источник"
                          fullWidth
                          type="text"
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
                          fullWidth
                          InputProps={{
                            startAdornment: <InputAdornment position="start">BYN</InputAdornment>,
                          }}
                          onBlur={formik.handleBlur}
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
                          inputFormat="dd/MM/yyyy"
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
                          onChange={(event, value) => {
                            formik.setFieldValue(
                              'DEAL',
                              { ...formik.values.DEAL, CREATOR: value ? value : null }
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
                              label="Создал"
                              required
                              placeholder="Выберите сотрудника"
                              error={Boolean(getIn(formik.errors, 'DEAL.CREATOR'))}
                              helperText={getIn(formik.errors, 'DEAL.CREATOR') || ''}
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
                              error={Boolean(getIn(formik.errors, 'DEAL.DEPARTMENT'))}
                              helperText={getIn(formik.errors, 'DEAL.DEPARTMENT') || ''}
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
                              placeholder="Выберите сотрудника"
                            />
                          )}
                        />
                      </Stack>
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
                    <KanbanTasks card={card} />
                  </TabPanel>
                  <TabPanel value="3" className={tabIndex === '3' ? classes.tabPanel : ''}>
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
            // form="mainForm"
            // type="submit"
            variant="contained"
            onClick={() => {
              setDeleting(false);
              setConfirmOpen(formik.isValid);
            }}
          >Сохранить</Button>
        </PermissionsGate>
      </DialogActions>
      <ConfirmDialog
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title="Удаление"
        text="Вы уверены, что хотите продолжить?"
        onConfirm={formik.handleSubmit}
      />
    </Dialog>
  );
}

export default KanbanEditCard;
