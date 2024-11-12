import './kanban-edit-card.module.less';
import {
  Autocomplete,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Theme,
  Box,
  Divider,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  Tab,
  useMediaQuery,
  useTheme,
  Tooltip,
  StepButton,
  LinearProgress
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import { IContactWithID, IKanbanCard, IKanbanColumn, Permissions } from '@gsbelarus/util-api-types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import KanbanHistory from '../kanban-history/kanban-history';
import { DesktopDatePicker } from '@mui/x-date-pickers-pro';
import { useGetEmployeesQuery } from '../../../features/contact/contactApi';
import { UserState } from '../../../features/user/userSlice';
import { useGetCustomersQuery } from '../../../features/customer/customerApi_new';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import KanbanTasks from '../kanban-tasks/kanban-tasks';
import { useGetDepartmentsQuery } from '../../../features/departments/departmentsApi';
import filterOptions from '../../helpers/filter-options';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DealSourcesSelect } from './components/deal-sources-select';
import { CustomerSelect } from './components/customer-select';
import styles from './kanban-edit-card.module.less';
import { useGetDenyReasonsQuery } from '../../../features/kanban/kanbanCatalogsApi';
import { DenyReasonsSelect } from './components/deny-reasons-select';
import { TabDescription } from './components/tab-descrption';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import CustomizedScrollBox from '../../Styled/customized-scroll-box/customized-scroll-box';
import { DealDocuments } from './components/deal-documents';
import { ClientHistory } from './components/client-history';
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import TelephoneInput, { validatePhoneNumber } from '@gdmn-nxt/components/telephone-input';
import EmailInput from '@gdmn-nxt/components/email-input/email-input';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import Dropzone from '@gdmn-nxt/components/dropzone/dropzone';
import { useGetDealsFilesQuery } from '../../../features/kanban/kanbanApi';
import { DepartmentsSelect } from '@gdmn-nxt/components/departments-select/departments-select';
import { EmployeesSelect } from '@gdmn-nxt/components/employees-select/employees-select';

const useStyles = makeStyles((theme: Theme) => ({
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
    padding: 0,
    marginTop: '12px !important',
  },
  scrollContainer: {
    marginRight: -16
  },
  scrollBox: {
    paddingRight: 16
  }
}));

export interface KanbanEditCardProps {
  open: boolean;
  currentStage?: IKanbanColumn;
  card?: IKanbanCard;
  stages: IKanbanColumn[];
  deleteable?: boolean;
  onSubmit: (arg1: IKanbanCard, arg2: boolean) => void;
  onCancelClick: (newCard: IKanbanCard) => void;
}

export function KanbanEditCard(props: KanbanEditCardProps) {
  const { open, card, stages, currentStage = stages[0], deleteable = true } = props;
  const { onSubmit, onCancelClick } = props;

  const classes = useStyles();

  const [isFetchingCard, setIsFetchingCard] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tabIndex, setTabIndex] = useState('1');
  const user = useSelector<RootState, UserState>(state => state.user);

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const { data: employees, isFetching: employeesIsFetching } = useGetEmployeesQuery();
  const { isFetching: customerFetching } = useGetCustomersQuery();
  const { data: departments, isFetching: departmentsIsFetching, refetch: departmentsRefetch } = useGetDepartmentsQuery();
  const { isFetching: denyReasonsIsFetching } = useGetDenyReasonsQuery();
  const id = card?.DEAL?.ID ?? -1;
  const { data: attachments = [], isFetching: attachmentsFetching } = useGetDealsFilesQuery(id, { skip: !open || id <= 0, refetchOnMountOrArgChange: true });
  const refComment = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    refComment?.current && refComment.current.scrollIntoView({ behavior: 'smooth' });
  }, [refComment.current]);

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const theme = useTheme();
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));
  const matchDownUW = useMediaQuery(theme.breakpoints.down('ultraWide'));
  const matchBetweenLgUw = useMediaQuery(theme.breakpoints.between('lg', 'ultraWide'));

  const windowWidth = useMemo(() => {
    switch (true) {
      case matchBetweenLgUw:
        return '70vw';
      case matchDownUW:
        return '60vw';
      default:
        return '50vw';
    }
  }, [matchBetweenLgUw, matchDownUW]);

  const handleDeleteClick = () => {
    onSubmit(formik.values, true);
    setTabIndex('1');
  };

  const handleOnClose = () => {
    handleCancelClick();
  };

  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const initValue: IKanbanCard = {
    ID: card?.ID === -1 ? 0 : card?.ID || 0,
    USR$MASTERKEY: card?.USR$MASTERKEY || currentStage?.ID || 0,
    USR$INDEX: card?.USR$INDEX || currentStage?.CARDS?.length || 0,
    USR$DEALKEY: card?.USR$DEALKEY || -1,
    DEAL: {
      ...card?.DEAL,
      ID: card?.DEAL?.ID || -1,
      USR$NAME: card?.DEAL?.USR$NAME || '',
      CREATOR:
        (card?.ID && card?.ID !== -1)
          ? card?.DEAL?.CREATOR
          : {
            ID: user.userProfile?.contactkey || -1,
            NAME: ''
          },
      DEPARTMENT: card?.DEAL?.DEPARTMENT,
      PERFORMERS: card?.DEAL?.PERFORMERS || [],
      CONTACT: card?.DEAL?.CONTACT,
      COMMENT: card?.DEAL?.COMMENT || '',
      CREATIONDATE: card?.DEAL?.CREATIONDATE || currentDate,
      PREPAID: card?.DEAL?.PREPAID ?? false,
      ATTACHMENTS: attachments
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
            .max(80, 'Слишком длинное наименование'),
          CONTACT: yup.object()
            .nullable()
            .required('Не указан клиент'),
          CREATOR: yup.object()
            .nullable()
            .required('Не указан создатель'),
          DEPARTMENT: yup.object()
            .nullable()
            .required('Не указан отдел'),
          CONTACT_NAME: yup.string()
            .nullable()
            .max(80, 'Слишком длинное имя'),
          CONTACT_EMAIL: yup.string()
            .nullable()
            .matches(/^[a-zа-я0-9\_\-\'\+]+([.]?[a-zа-я0-9\_\-\'\+])*@[a-zа-я0-9]+([.]?[a-zа-я0-9])*\.[a-zа-я]{2,}$/i,
              ({ value }) => {
                const invalidChar = value.match(/[^a-zа-я\_\-\'\+ @.]/i);
                if (invalidChar) {
                  return `Адрес не может содержать символ "${invalidChar}"`;
                }
                return 'Некорректный адрес';
              })
            .max(40, 'Слишком длинный email'),
          CONTACT_PHONE: yup
            .string()
            .nullable()
            .test('',
              ({ value }) => validatePhoneNumber(value) ?? '',
              (value = '') => !validatePhoneNumber(value ?? '')),
          REQUESTNUMBER: yup.string().nullable()
            .max(20, 'Слишком длинный номер'),
          PRODUCTNAME: yup.string().nullable()
            .max(180, 'Слишком длинное наименование'),
          USR$AMOUNT: yup.number().nullable()
            .max(1000000, 'Слишком большая сумма'),
        })
    }),
    onSubmit: (values) => {
      onSubmit(
        {
          ...values,
          ...(values.DEAL?.ID
            ? {
              DEAL: {
                ...values.DEAL,
                USR$AMOUNT: values.DEAL?.USR$AMOUNT ?? 0,
              }
            }
            : {}),
        },
        false
      );
    },
  });

  const handleCancelClick = () => {
    setTabIndex('1');
    onCancelClick(formik.values);
    if (isFetchingCard) {
      setIsFetchingCard(false);
    }
  };

  useEffect(() => {
    if ((getIn(formik.touched, 'DEAL.USR$NAME"') && Boolean(getIn(formik.errors, 'DEAL.USR$NAME"'))) ||
    (getIn(formik.touched, 'DEAL.CONTACT') && Boolean(getIn(formik.errors, 'DEAL.CONTACT'))) ||
    (getIn(formik.touched, 'DEAL.DEPARTMENT') && Boolean(getIn(formik.errors, 'DEAL.DEPARTMENT'))) ||
    (getIn(formik.touched, 'DEAL.CONTACT_EMAIL') && Boolean(getIn(formik.errors, 'DEAL.CONTACT_EMAIL')))) {
      setTabIndex('1');
    };

    if ((getIn(formik.touched, 'DEAL.REQUESTNUMBER') && Boolean(getIn(formik.errors, 'DEAL.REQUESTNUMBER'))) ||
        (getIn(formik.touched, 'DEAL.PRODUCTNAME') && Boolean(getIn(formik.errors, 'DEAL.PRODUCTNAME'))) ||
        (getIn(formik.touched, 'DEAL.CONTACT_NAME') && Boolean(getIn(formik.errors, 'DEAL.CONTACT_NAME'))) ||
        (getIn(formik.touched, 'DEAL.CONTACT_EMAIL') && Boolean(getIn(formik.errors, 'DEAL.CONTACT_EMAIL'))) ||
        (getIn(formik.touched, 'DEAL.CONTACT_PHONE') && Boolean(getIn(formik.errors, 'DEAL.CONTACT_PHONE')))) {
      setTabIndex('2');
    };
  }, [formik.touched, formik.errors]);

  const handleStep = (stageId: number) => () => {
    formik.setFieldValue('USR$MASTERKEY', stageId);
  };

  const handleStepBack = () => {
    const currentIndex = stages.findIndex(stage => stage.ID === formik.values.USR$MASTERKEY);

    if (currentIndex < 1) return;
    formik.setFieldValue('USR$MASTERKEY', stages[currentIndex - 1].ID);
  };

  const handleStepNext = () => {
    const currentIndex = stages.findIndex(stage => stage.ID === formik.values.USR$MASTERKEY);

    if (currentIndex >= stages.length - 1) return;
    formik.setFieldValue('USR$MASTERKEY', stages[currentIndex + 1].ID);
  };

  const onPhoneChange = (value: string) => {
    formik.setFieldValue('DEAL.CONTACT_PHONE', value);
  };

  const checkDoneAndTasks = useMemo(() =>
    !(formik.values.DEAL?.USR$DONE) &&
    (formik.values.TASKS?.reduce((acc, task) => acc + Number(!task.USR$CLOSED), 0) || 0) > 0
  , [formik.values.DEAL?.USR$DONE, formik.values.TASKS]);

  const KanbanRequestInfo = useMemo(() => {
    return (
      <Stack
        flex={1}
        spacing={2}
        paddingTop={1}
        maxWidth={600}
      >
        <TextField
          label="Продукция"
          type="text"
          name="DEAL.PRODUCTNAME"
          onChange={formik.handleChange}
          value={formik.values.DEAL?.PRODUCTNAME || ''}
          error={getIn(formik.touched, 'DEAL.PRODUCTNAME') && Boolean(getIn(formik.errors, 'DEAL.PRODUCTNAME'))}
          helperText={getIn(formik.touched, 'DEAL.PRODUCTNAME') && getIn(formik.errors, 'DEAL.PRODUCTNAME')}
        />
        <Stack direction={'row'} spacing={2}>
          <Stack direction={'column'} flex={1}>
            <TextField
              label="Номер заявки"
              type="text"
              name="DEAL.REQUESTNUMBER"
              onChange={formik.handleChange}
              value={formik.values.DEAL?.REQUESTNUMBER || ''}
              error={getIn(formik.touched, 'DEAL.REQUESTNUMBER') && Boolean(getIn(formik.errors, 'DEAL.REQUESTNUMBER'))}
              helperText={getIn(formik.touched, 'DEAL.REQUESTNUMBER') && getIn(formik.errors, 'DEAL.REQUESTNUMBER')}
            />
          </Stack>
          <Stack
            direction="column"
            spacing={2}
            width={150}
          >
            <DesktopDatePicker
              label="Дата"
              value={formik.values.DEAL?.CREATIONDATE ? new Date(formik.values.DEAL?.CREATIONDATE) : null}
              format="dd.MM.yyyy"
              onChange={(value) => formik.setFieldValue('DEAL.CREATIONDATE', value)}
              slotProps={{ textField: { variant: 'outlined' } }}
            />
            <TimePicker
              label="Время"
              value={formik.values.DEAL?.CREATIONDATE ? new Date(formik.values.DEAL?.CREATIONDATE) : null}
              onChange={(value) => formik.setFieldValue('DEAL.CREATIONDATE', value)}
              slotProps={{ textField: { variant: 'outlined' } }}
            />
          </Stack>
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
        <Stack
          flex={1}
          spacing={2}
          direction={{ sm: 'column', md: 'row', lg: 'row' }}
        >
          <EmailInput
            fullWidth
            name="DEAL.CONTACT_EMAIL"
            onChange={formik.handleChange}
            value={formik.values.DEAL?.CONTACT_EMAIL || ''}
            error={getIn(formik.touched, 'DEAL.CONTACT_EMAIL') && Boolean(getIn(formik.errors, 'DEAL.CONTACT_EMAIL'))}
            helperText={getIn(formik.touched, 'DEAL.CONTACT_EMAIL') && getIn(formik.errors, 'DEAL.CONTACT_EMAIL')}
          />
          <TelephoneInput
            name="DEAL.CONTACT_PHONE"
            label="Телефон"
            value={formik.values.DEAL?.CONTACT_PHONE ?? ''}
            onChange={onPhoneChange}
            fullWidth
            fixedCode
            strictMode
            error={getIn(formik.touched, 'DEAL.CONTACT_PHONE') && Boolean(getIn(formik.errors, 'DEAL.CONTACT_PHONE'))}
            helperText={getIn(formik.touched, 'DEAL.CONTACT_PHONE') && getIn(formik.errors, 'DEAL.CONTACT_PHONE')}
          />
        </Stack>
      </Stack>
    );
  }, [formik.values, formik.touched, formik.errors]);

  const currentStageIndex = useMemo(() => stages.findIndex(s => s.ID === formik.values.USR$MASTERKEY), [stages, formik.values.USR$MASTERKEY]);

  const attachmentsChange = useCallback(async (files: File[]) => {
    const promises = files.map(file => {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.readAsDataURL(file);
        reader.onerror = () => {
          reader.abort();
          reject(new DOMException('Problem parsing input file.'));
        };
        reader.onloadend = (e) => {
          const stringFile = reader.result?.toString() ?? '';
          resolve({
            fileName: file.name,
            content: stringFile
          });
        };
      });
    });

    const attachments = await Promise.all(promises);
    if (JSON.stringify(formik.values.DEAL?.ATTACHMENTS) === JSON.stringify(attachments)) {
      return;
    }
    formik.setFieldValue('DEAL.ATTACHMENTS', attachments);
  }, [formik.values.DEAL?.ATTACHMENTS]);

  const initialAttachments = useMemo(() => {
    return attachments.reduce((res, { fileName, content }) => {
      if (!content) {
        return res;
      }

      const arr = content.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1];

      const binarystr = window.atob(arr[1]);
      let n = binarystr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = binarystr.charCodeAt(n);
      };

      const file = new File([u8arr], fileName, { type: mime });
      return [...res, file];
    }, [] as File[]);
  }, [attachments]);

  const maxFileSize = 5000000; // in bytes

  return (
    <CustomizedDialog
      open={open}
      onClose={handleOnClose}
      confirmation={formik.dirty}
      minWidth={400}
      width="calc(100% - var(--menu-width))"
    >
      <DialogTitle>
        {formik.values.ID > 0 ? `Редактирование сделки: ${card?.DEAL?.USR$NAME}` : 'Создание сделки'}
      </DialogTitle>
      <DialogContent dividers style={{ display: 'flex' }}>
        <FormikProvider value={formik}>
          <Form
            id="mainForm"
            onSubmit={formik.handleSubmit}
            style={{ flex: 1, display: 'flex' }}
          >
            <Stack spacing={2} flex={1}>
              {matchDownLg
                ? <Stack
                  direction="row"
                  alignItems={'center'}
                  justifyContent={'center'}
                  spacing={2}
                >
                  <IconButton
                    color="primary"
                    onClick={handleStepBack}
                    disabled={currentStageIndex < 1}
                  >
                    <ArrowCircleLeftOutlinedIcon />
                  </IconButton>
                  <Stack>
                    <Box
                      width={200}
                      textAlign={'center'}
                      fontWeight={500}
                    >
                      {stages.find(stage => stage.ID === formik.values.USR$MASTERKEY)?.USR$NAME ?? ''}
                    </Box>
                    <LinearProgress variant="determinate" value={Math.ceil(currentStageIndex / (stages.length - 1) * 100)} />
                  </Stack>
                  <IconButton
                    color="primary"
                    onClick={handleStepNext}
                    disabled={currentStageIndex >= (stages.length - 1)}
                  >
                    <ArrowCircleRightOutlinedIcon />
                  </IconButton>
                </Stack>
                : <Stepper
                  activeStep={stages.findIndex(stage => stage.ID === formik.values.USR$MASTERKEY)}
                  alternativeLabel
                  nonLinear
                >
                  {stages.map((stage, idx) =>
                    <Step
                      key={stage.ID}
                      completed={idx < stages.findIndex(s => s.ID === formik.values.USR$MASTERKEY)}
                    >
                      <StepButton onClick={handleStep(stage.ID)}>
                        {stage.USR$NAME}
                      </StepButton>
                    </Step>)}
                </Stepper>}
              <TabContext value={tabIndex}>
                <Box style={{ width: `calc(${windowWidth} - 5vw)`, alignSelf: 'center' }}>
                  <TabList
                    onChange={handleTabsChange}
                    scrollButtons="auto"
                    variant="scrollable"
                  >
                    <Tab label="Сведения" value="1" />
                    <Tab label="Заявка" value="2" />
                    <Tab label="Задачи" value="3" />
                    <Tab label="Документы" value="4" />
                    <Tab label="Хронология" value="5" />
                    <Tab label="Описание" value="6" />
                    <Tab
                      label="История клиента"
                      value="7"
                      disabled={(card?.ID ?? -1) <= 0}
                    />
                  </TabList>
                </Box>
                <Divider style={{ margin: 0 }} />
                <TabPanel value="1" className={tabIndex === '1' ? classes.tabPanel : ''}>
                  <CustomizedScrollBox container={{ className: classes.scrollContainer }} className={classes.scrollBox}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center'
                      }}
                    >
                      <Stack
                        flex={1}
                        spacing={2}
                        paddingTop={1}
                        maxWidth={600}
                      >
                        <TextField
                          label="Наименование"
                          type="text"
                          multiline
                          minRows={1}
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
                        <Stack direction={matchDownLg ? 'column' : 'row'} spacing={2}>
                          <Stack
                            direction="column"
                            spacing={2}
                            flex={1}
                          >
                            <CustomerSelect
                              value={formik.values.DEAL?.CONTACT}
                              onChange={(value) => formik.setFieldValue('DEAL.CONTACT', value)}
                              required
                              name="DEAL.CONTACT"
                              error={getIn(formik.touched, 'DEAL.CONTACT') && Boolean(getIn(formik.errors, 'DEAL.CONTACT'))}
                              helperText={getIn(formik.touched, 'DEAL.CONTACT') && getIn(formik.errors, 'DEAL.CONTACT')}
                            />
                            <DealSourcesSelect formik={formik} />
                          </Stack>
                          <Stack
                            spacing={2}
                            {...(matchDownLg
                              ? {
                                direction: 'row',
                                flex: 1
                              }
                              : {
                                width: 150
                              })
                            }
                          >
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
                              error={getIn(formik.touched, 'DEAL.USR$AMOUNT') && Boolean(getIn(formik.errors, 'DEAL.USR$AMOUNT'))}
                              helperText={getIn(formik.touched, 'DEAL.USR$AMOUNT') && getIn(formik.errors, 'DEAL.USR$AMOUNT')}
                            />
                            <DesktopDatePicker
                              label="Срок"
                              value={formik.values.DEAL?.USR$DEADLINE ? new Date(formik.values.DEAL?.USR$DEADLINE) : null}
                              format="dd.MM.yyyy"
                              onChange={(value) => {
                                formik.setFieldValue(
                                  'DEAL',
                                  { ...formik.values.DEAL, USR$DEADLINE: value ? value : null }
                                );
                              }}
                              slotProps={{ textField: { variant: 'outlined' } }}
                            />

                          </Stack>
                        </Stack>
                        <Divider variant="middle" />
                        <Stack direction={'column'} spacing={2}>
                          <DepartmentsSelect
                            value={formik.values.DEAL?.DEPARTMENT ?? null}
                            required
                            onChange={(value) => {
                              formik.setFieldValue(
                                'DEAL',
                                { ...formik.values.DEAL, DEPARTMENT: value ? value : null }
                              );
                            }}
                            error={getIn(formik.touched, 'DEAL.DEPARTMENT') && Boolean(getIn(formik.errors, 'DEAL.DEPARTMENT'))}
                            helperText={getIn(formik.touched, 'DEAL.DEPARTMENT') && getIn(formik.errors, 'DEAL.DEPARTMENT')}
                          />
                          <Stack direction="column" spacing={2}>
                            <EmployeesSelect
                              value={formik.values.DEAL?.CREATOR ?? null}
                              onChange={value => formik.setFieldValue('DEAL.CREATOR', value)}
                              label="Создал"
                              required
                              error={getIn(formik.touched, 'DEAL.CREATOR') && Boolean(getIn(formik.errors, 'DEAL.CREATOR'))}
                              helperText={getIn(formik.touched, 'DEAL.CREATOR') && getIn(formik.errors, 'DEAL.CREATOR')}
                            />
                            <EmployeesSelect
                              value={formik.values.DEAL?.PERFORMERS?.[0] ?? null}
                              filter={empl => empl.ID !== formik.values.DEAL?.PERFORMERS?.[1]?.ID}
                              onChange={(value) => {
                                const secondPerformer = formik.values.DEAL?.PERFORMERS?.[1];
                                const newPerformers: IContactWithID[] = []
                                  .concat(value ? value as any : [])
                                  .concat(secondPerformer ? secondPerformer as any : []);

                                formik.setFieldValue(
                                  'DEAL',
                                  {
                                    ...formik.values.DEAL,
                                    PERFORMERS: newPerformers
                                  }
                                );

                                if (!value && newPerformers.length === 0) {
                                  formik.setFieldValue('USR$MASTERKEY', stages[0].ID);
                                  return;
                                }
                                formik.setFieldValue('USR$MASTERKEY', stages[1].ID);
                              }}
                              label={'Исполнитель'}
                              placeholder={'Выберите исполнителя'}
                              disabled={formik.values.DEAL?.USR$READYTOWORK || false}
                            />
                            <EmployeesSelect
                              readOnly={formik.values.DEAL?.USR$READYTOWORK || false}
                              disabled={formik.values.DEAL?.USR$READYTOWORK || (formik.values.DEAL?.PERFORMERS?.length || 0) === 0}
                              value={formik.values.DEAL?.PERFORMERS?.[1] ?? null}
                              onChange={(value) => {
                                const firstPerformer = formik.values.DEAL?.PERFORMERS?.[0];
                                const newPerformers = []
                                  .concat(firstPerformer ? firstPerformer as any : [])
                                  .concat(value ? value as any : []);

                                formik.setFieldValue(
                                  'DEAL',
                                  {
                                    ...formik.values.DEAL,
                                    PERFORMERS: newPerformers
                                  }
                                );
                                if (!value && newPerformers.length === 0) {
                                  formik.setFieldValue('USR$MASTERKEY', stages[0].ID);
                                  return;
                                }
                                formik.setFieldValue('USR$MASTERKEY', stages[1].ID);
                              }}
                              filter={empl => empl.ID !== formik.values.DEAL?.PERFORMERS?.[0]?.ID}
                              label={'Второй исполнитель'}
                              placeholder={'Выберите исполнителя'}
                            />
                          </Stack>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                        >
                          <Stack flex={1}>
                            <Stack direction="column" spacing={1}>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      name="DEAL.PREPAID"
                                      checked={formik.values.DEAL?.PREPAID}
                                      onChange={formik.handleChange}
                                    />
                                  }
                                  label="Оплачено"
                                />
                                {/* {(formik.values.USR$MASTERKEY === stages[1]?.ID || formik.values.USR$MASTERKEY === stages[2]?.ID) ? */}
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={formik.values.DEAL?.USR$READYTOWORK || false}
                                      onChange={(e) => {
                                        const value = e.target.checked;
                                        formik.setFieldValue(
                                          'DEAL',
                                          { ...formik.values.DEAL, USR$READYTOWORK: value }
                                        );
                                        // formik.setFieldValue(
                                        //   'USR$MASTERKEY',
                                        //   value ? stages[2].ID : stages[1].ID
                                        // );
                                      }}
                                    />
                                  }
                                  label="В работе"
                                />
                                {/* : <></>} */}
                                {/* {(formik.values.USR$MASTERKEY === stages[2]?.ID ||
                                    formik.values.USR$MASTERKEY === stages[3]?.ID ||
                                    formik.values.DEAL?.USR$DONE)
                                    ?  */}
                                <Tooltip title={checkDoneAndTasks ? 'Есть незакрытые задачи' : ''} arrow>
                                  <FormControlLabel
                                    disabled={checkDoneAndTasks}
                                    control={
                                      <Checkbox
                                        checked={formik.values.DEAL?.USR$DONE || false}
                                        onChange={(e) => {
                                          const value = e.target.checked;
                                          formik.setFieldValue(
                                            'DEAL',
                                            { ...formik.values.DEAL, USR$DONE: value }
                                          );
                                          // formik.setFieldValue(
                                          //   'USR$MASTERKEY',
                                          //   value ? stages[3].ID : stages[2].ID
                                          // );
                                        }}
                                      />
                                    }
                                    label="Исполнено"
                                  />
                                </Tooltip>
                              </Stack>
                              {/* : <></> */}
                              {/* } */}
                              {/* {card?.DEAL?.ID && (card?.DEAL?.ID > 0) ? */}
                              <Stack direction="row" spacing={2}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={formik.values.DEAL?.DENIED || false}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        formik.setFieldValue(
                                          'DEAL',
                                          { ...formik.values.DEAL, DENIED: checked }
                                        );
                                        // const newMasterKey = (() => {
                                        //   if (checked) return stages[4].ID;
                                        //   if (formik.values.DEAL?.USR$DONE) return stages[3].ID;
                                        //   if (formik.values.DEAL?.USR$READYTOWORK) return stages[2].ID;
                                        //   if (formik.values.DEAL?.PERFORMERS) return stages[1].ID;
                                        //   return stages[0].ID;
                                        // })();
                                        // formik.setFieldValue('USR$MASTERKEY', newMasterKey);
                                        if (!checked) formik.setFieldValue('DEAL.DENYREASON', null);
                                        if (checked) {
                                          formik.setFieldValue('DEAL.USR$DONE', false);
                                          formik.setFieldValue('USR$MASTERKEY', stages[9].ID);
                                        }
                                      }}
                                    />
                                  }
                                  label="Отказ"
                                />
                                {formik.values.DEAL?.DENIED &&
                                    <Stack flex={1} spacing={2}>
                                      <DenyReasonsSelect formik={formik} />
                                    </Stack>}
                              </Stack>
                              {/* : <></> */}
                              {/* } */}
                            </Stack>
                            <Box flex={1} />
                          </Stack>
                        </Stack>
                        {(formik.values.DEAL?.DENIED || formik.values.DEAL?.USR$DONE) &&
                            <TextField
                              label="Комментарий"
                              ref={refComment}
                              type="text"
                              name="COMMENT"
                              multiline
                              minRows={4}
                              onChange={(e) => {
                                formik.setFieldValue('DEAL.COMMENT', e.target.value);
                              }}
                              value={formik.values.DEAL?.COMMENT}
                            />
                        }
                        <div>
                          <Dropzone
                            maxFileSize={maxFileSize}
                            filesLimit={3}
                            showPreviews
                            initialFiles={id <= 0 ? undefined : initialAttachments}
                            onChange={attachmentsChange}
                            disabled={attachmentsFetching}
                          />
                        </div>
                      </Stack>
                    </Box>
                  </CustomizedScrollBox>
                </TabPanel>
                <TabPanel value="2" className={tabIndex === '2' ? classes.tabPanel : ''}>
                  <CustomizedScrollBox container={{ className: classes.scrollContainer }} className={classes.scrollBox}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center'
                      }}
                    >
                      {KanbanRequestInfo}
                    </Box>
                  </CustomizedScrollBox>
                </TabPanel>
                <TabPanel value="3" className={tabIndex === '3' ? classes.tabPanel : ''}>
                  <KanbanTasks card={formik.values} formik={formik} />
                </TabPanel>
                <TabPanel value="4" className={tabIndex === '4' ? classes.tabPanel : ''}>
                  <DealDocuments dealId={card?.DEAL?.ID ?? -1}/>
                </TabPanel>
                <TabPanel value="5" className={tabIndex === '5' ? classes.tabPanel : ''}>
                  <CustomizedCard
                    borders
                    style={{
                      borderColor: 'lightgrey',
                      flex: 1,
                      marginBottom: '16px',
                      height: '100%'
                    }}
                  >
                    <CustomizedScrollBox>
                      <div style={{ height: '100%' }}>
                        {card?.ID
                          ? <KanbanHistory cardId={card.ID} />
                          : <></>}
                      </div>
                    </CustomizedScrollBox>
                  </CustomizedCard>
                </TabPanel>
                <TabPanel value="6" className={tabIndex === '6' ? classes.tabPanel : ''}>
                  <TabDescription formik={formik} />
                </TabPanel>
                <TabPanel value="7" className={tabIndex === '7' ? classes.tabPanel : ''}>
                  <ClientHistory card={formik.values} />
                </TabPanel>
              </TabContext>
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions className={styles.DialogActions}>
        <PermissionsGate actionAllowed={userPermissions?.deals.DELETE}>
          {(card?.DEAL?.ID && (card?.DEAL?.ID > 0)) && deleteable &&
            <ItemButtonDelete button onClick={handleDeleteClick} />
          }
        </PermissionsGate>
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
        <PermissionsGate show={true} actionAllowed={formik.values.ID > 0 ? userPermissions?.deals.PUT : userPermissions?.deals.POST}>
          <Button
            className={classes.button}
            variant="contained"
            disabled={customerFetching || employeesIsFetching || denyReasonsIsFetching || departmentsIsFetching || isFetchingCard}
            form="mainForm"
            type="submit"
          >
            Сохранить
          </Button>
        </PermissionsGate>
      </DialogActions>
    </CustomizedDialog>
  );
}

export default KanbanEditCard;
