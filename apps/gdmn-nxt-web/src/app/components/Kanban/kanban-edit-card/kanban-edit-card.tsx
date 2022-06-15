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
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Theme,
  Box,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { forwardRef, ReactElement, useState, useEffect, Fragment } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { IDeal, IKanbanCard, IKanbanColumn } from '@gsbelarus/util-api-types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { fetchCustomers } from '../../../features/customer/actions';
import { customersSelectors } from '../../../features/customer/customerSlice';
import { ICustomer } from '@gsbelarus/util-api-types';
import CustomizedCard from '../../customized-card/customized-card';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KanbanHistory from '../kanban-history/kanban-history';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import { ChatView } from '@gsbelarus/ui-common-dialogs';
import { useGetEmployeesQuery } from '../../../features/contact/contactApi';
import { UserState } from '../../../features/user/userSlice';
import { useGetCustomersQuery } from '../../../features/customer/customerApi_new';


const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    width: 500,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  accordionTitle: {
    width: '33%',
    flexShrink: 0
  },
  accordionCaption: {
    color: theme.color.grey['500']
  }
}));


const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const filterOptions = createFilterOptions({
  matchFrom: 'any',
  limit: 100,
  stringify: (option: ICustomer) => option.NAME,
});

export interface KanbanEditCardProps {
  open: boolean;
  currentStage?: IKanbanColumn;
  card?: IKanbanCard;
  stages: IKanbanColumn[];
  onSubmit: (arg1: IKanbanCard, arg2: boolean) => void;
  onCancelClick: () => void;
}

export function KanbanEditCard(props: KanbanEditCardProps) {
  const { open, currentStage, card, stages } = props;
  const { onSubmit, onCancelClick } = props;

  const classes = useStyles();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // const dispatch = useDispatch();
  // const allCustomers = useSelector(customersSelectors.selectAll);
  // const allCustomers = options['customers'] as ICustomer[];
  // const { loading: customersLoading } = useSelector((state: RootState) => state.customers);

  const { data: employees, isFetching: employeesIsFetching } = useGetEmployeesQuery();

  const user = useSelector<RootState, UserState>(state => state.user);

  const [expanded, setExpanded] = useState('');

  const { data: customers, isFetching: customerFetching } = useGetCustomersQuery();
  // const allCustomers = customers as ICustomer[];

  const handleChangeAccordion = (panel: string) => (event: any, newExpanded: any) => {
    if (newExpanded) setExpanded(panel);
    if (expanded === panel) setExpanded('');
  };

  // console.log('allCustomers', customerFetching, customerLoading, allCustomers);

  // useEffect(() => {
  //   open && dispatch(fetchCustomers());
  // }, [open, dispatch]);

  const handleDeleteClick = () => {
    setDeleting(true);
    setConfirmOpen(true);
  };

  const handleCancelClick = () => {
    setDeleting(false);
    formik.resetForm();
    onCancelClick();
  };

  const initValue: IKanbanCard & IDeal = {
    ID: card?.ID || -1,
    USR$MASTERKEY: card?.USR$MASTERKEY || currentStage?.ID || -1,
    USR$INDEX: card?.USR$INDEX || currentStage?.CARDS.length || 0,
    USR$NAME: card?.DEAL?.USR$NAME || '',
    USR$DEALKEY: card?.USR$DEALKEY || -1,
    USR$CONTACTKEY: card?.DEAL?.CONTACT?.ID || -1,
    DEAL: card?.DEAL || {
      ID: -1,
      CREATOR: {
        ID: user.userProfile?.contactkey || -1,
        NAME: ''
      },
    },
    CREATOR: card?.DEAL?.CREATOR || undefined,
    PERFORMER: card?.DEAL?.PERFORMER || undefined,
    USR$READYTOWORK: card?.DEAL?.USR$READYTOWORK || false,
    USR$DONE: card?.DEAL?.USR$DONE || false
  };

  const formik = useFormik<IKanbanCard & IDeal>({
    enableReinitialize: true,
    initialValues: {
      ...card,
      ...initValue
    },
    validationSchema: yup.object().shape({
      // USR$NAME:
      //   yup.string()
      //     .required('')
      //     .max(20, 'Слишком длинное наименование'),
      USR$MASTERKEY: yup.string().required(''),
    }),
    onSubmit: (values) => {
      setConfirmOpen(false);
      onSubmit(values, deleting);
    },
  });

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      classes={{
        paper: classes.dialog
      }}
    >
      <DialogTitle>
        {formik.values.ID > 0 ? `Редактирование ${formik.values?.DEAL?.USR$NAME}` : 'Создание сделки'}
      </DialogTitle>
      <DialogContent dividers style={{ padding: 0 }}>
        <PerfectScrollbar style={{ padding: '16px 24px' }}>
          <FormikProvider value={formik}>
            <Form id="mainForm" onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Наименование"
                  type="text"
                  required
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
                  // helperText={formik.errors.USR$NAME}
                />
                <Autocomplete
                  options={stages?.filter(stage => stage.ID !== formik.values.USR$MASTERKEY) || []}
                  getOptionLabel={option => option.USR$NAME}
                  value={stages?.filter(el => el.ID === formik.values.USR$MASTERKEY)[0] || null}
                  // isOptionEqualToValue={(option, value) => {
                  //   console.log('option', option);
                  //   console.log('value', value);
                  //   return option.ID === value.ID;
                  // }}
                  readOnly
                  onChange={(event, value) => {
                    formik.setFieldValue(
                      'USR$MASTERKEY',
                      value ? value.ID : initValue.USR$MASTERKEY
                    );
                  }}
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option.ID}>
                        {option.USR$NAME}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      key={params.id}
                      label="Этап"
                      type="text"
                      name="USR$MASTERKEY"
                      required
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.USR$MASTERKEY}
                      helperText={formik.errors.USR$MASTERKEY}
                      placeholder="Выберите стадию"
                    />
                  )}
                />
                <Autocomplete
                  options={customers || []}
                  getOptionLabel={option => option.NAME}
                  filterOptions={filterOptions}
                  value={customers?.find(el => el.ID === formik.values.DEAL?.CONTACT?.ID) || null}
                  loading={customerFetching}
                  loadingText="Загрузка данных..."
                  onChange={(event, value) => {
                    // formik.setFieldValue(
                    //   'USR$CONTACTKEY',
                    //   value ? value.ID : initValue.USR$CONTACTKEY
                    // );
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
                    />
                    // <TextField
                    //   {...params}
                    //   key={params.id}
                    //   label="Клиент"
                    //   type="text"
                    //   name="USR$CONTACTKEY"
                    //   required
                    //   onBlur={formik.handleBlur}
                    //   onChange={formik.handleChange}
                    //   value={formik.values.USR$CONTACTKEY}
                    //   helperText={formik.errors.USR$CONTACTKEY}
                    //   placeholder="Выберите клиента"
                    // />
                  )}
                />
                <TextField
                  label="Сумма"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">BYN</InputAdornment>,
                  }}
                  // name="USR$AMOUNT"
                  onBlur={formik.handleBlur}
                  // onChange={formik.handleChange}
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
                <Divider variant="middle" />
                <Autocomplete
                  options={employees || []}
                  getOptionLabel={option => option.NAME}
                  filterOptions={filterOptions}
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
                    />
                  )}
                />
                <Autocomplete
                  options={employees || []}
                  getOptionLabel={option => option.NAME}
                  filterOptions={filterOptions}
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
                {/* <FormikDatePicker label="date" name="USR$DEADLINE" /> */}
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
                  <DesktopDatePicker
                    label="Срок"
                    value={formik.values.DEAL?.USR$DEADLINE || null}
                    mask="__.__.____"
                    onChange={(value) => {
                      formik.setFieldValue(
                        'DEAL',
                        { ...formik.values.DEAL, USR$DEADLINE: value ? value : null }
                      );
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
                <TextField
                  label="Источник"
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
                {(formik.values.USR$MASTERKEY === stages[1].ID || formik.values.USR$MASTERKEY === stages[2].ID) ?
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.DEAL?.USR$READYTOWORK}
                        onChange={(e) => {
                          const value = e.target.checked;
                          formik.setFieldValue(
                            'DEAL',
                            { ...formik.values.DEAL, USR$READYTOWORK: value}
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
                {/* <FormControlLabel
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
                  label="работе"
                />
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
                /> */}
                <Divider variant="middle" />
                <CustomizedCard
                  borders
                  style={{
                    borderColor: 'lightgrey',
                  }}
                >
                  <Accordion
                    disableGutters
                    expanded={expanded === 'panel1'}
                    onChange={handleChangeAccordion('panel1')}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      style={{
                        height: 56,
                      }}
                    >
                      <Typography sx={{ width: '33%', flexShrink: 0 }}>
                        Хронология
                      </Typography>
                      <Typography className={classes.accordionCaption}>история изменений</Typography>
                    </AccordionSummary>
                    <AccordionDetails
                      style={{
                        height: '40vh',
                      }}
                    >
                      <PerfectScrollbar>
                        {card?.ID
                          ? <KanbanHistory cardId={card.ID} />
                          : <></>}
                      </PerfectScrollbar>
                    </AccordionDetails>
                  </Accordion>
                </CustomizedCard>
              </Stack>
            </Form>
          </FormikProvider>
        </PerfectScrollbar>
      </DialogContent>
      <DialogActions style={{ display: 'flex' }}>
        <IconButton onClick={handleDeleteClick} size="large" >
          <DeleteIcon />
        </IconButton>
        {/* <Button variant="outlined" color="error" onClick={handleDeleteClick}>Удалить</Button> */}
        <Button onClick={handleCancelClick} style={{ marginLeft: 'auto' }}>Отменить</Button>
        <Button
          form="mainForm"
          type="submit"
          variant="contained"
          onClick={() => {
            setDeleting(false);
          }}
        >Сохранить</Button>
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
