import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import styles from './mailing-upsert.module.less';
import EmailTemplate from '@gdmn-nxt/components/email-template/email-template';
import { ArrayElement, IMailing, ISegment, MailingStatus } from '@gsbelarus/util-api-types';
import { Autocomplete, Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import { useGetAllSegmentsQuery, useGetCustomersCountMutation } from '../../../features/Marketing/segments/segmentsApi';
import filterOptions from '@gdmn-nxt/components/helpers/filter-options';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { DesktopDateTimePicker } from '@mui/x-date-pickers-pro';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/components/helpers/hooks/usePermissions';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import InfoIcon from '@mui/icons-material/Info';
import { useAddTemplateMutation } from '../../../features/Marketing/templates/templateApi';
import { useGetMailingByIdQuery, useLaunchTestMailingMutation } from '../../../features/Marketing/mailing';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from '@gdmn-nxt/components/helpers/hooks/useSnackbar';
import Dropzone from '@gdmn-nxt/components/dropzone/dropzone';
import { useAutocompleteVirtualization } from '@gdmn-nxt/components/helpers/hooks/useAutocompleteVirtualization';

const sendTypes = [
  {
    id: 1,
    name: 'Сейчас'
  },
  {
    id: 2,
    name: 'Вручную позже'
  },
  {
    id: 3,
    name: 'Запланировать'
  }
];

const maxFileSize = 5000000; // in bytes

export interface MailingUpsertProps {
  mailing: IMailing | null;
  open: boolean;
  onCancel: () => void;
  onSubmit: (newSegment: IMailing, deleting?: boolean) => void;
}

export function MailingUpsert({
  open,
  onCancel,
  onSubmit,
  mailing
}: MailingUpsertProps) {
  const userPermissions = usePermissions();

  // uwc-debug-below
  const id = mailing?.ID ?? -1;
  const {
    data: { attachments = [] } = { attachments: [] },
    isFetching: attachmentsFetching
  } = useGetMailingByIdQuery(id, { skip: !open || id <= 0, refetchOnMountOrArgChange: true });

  const { data: { segments } = {
    count: 0,
    segments: [] },
  isFetching: segmentsFetching
  } = useGetAllSegmentsQuery();

  const { addSnackbar } = useSnackbar();

  const [getCustomersCount, { isLoading: customersCountLoading }] = useGetCustomersCountMutation();
  const [addTemplate] = useAddTemplateMutation();
  const [testLaunching, { isLoading: testLaunchingLoading, isSuccess }] = useLaunchTestMailingMutation();

  useEffect(() => {
    if (isSuccess) {
      addSnackbar('Тестовая рассылка успешно выполнена', {
        variant: 'success'
      });
    }
  }, [isSuccess]);


  const initValue: IMailing = {
    ID: -1,
    NAME: '',
    includeSegments: [],
    excludeSegments: [],
    STATUS: MailingStatus.manual,
    testingEmails: [],
    attachments: attachments
  };

  const formik = useFormik<IMailing>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue,
      ...mailing
    },
    validationSchema: yup.object().shape({
      NAME: yup.string()
        .required('Не указано наименование')
        .max(40, 'Слишком длинное наименование'),
    }),
    onSubmit: (values) => {
      if (saveTemplate) {
        addTemplate({
          ID: -1,
          NAME: values.NAME,
          HTML: values.TEMPLATE ?? ''
        });
      }

      onSubmit({
        ...values,
        ...(mailing?.STATUS !== values.STATUS ? { STATUS_DESCRIPTION: '' } : {})
      }, false);
    },
    onReset: (values) => {
      setSelectedSendType(sendTypes[1]);
      setSaveTemplate(false);
    },
  });

  const [saveTemplate, setSaveTemplate] = useState(false);
  const [selectedSendType, setSelectedSendType] = useState<ArrayElement<typeof sendTypes> | null>(sendTypes[1]);
  const [customersCount, setCustomersCount] = useState(0);

  const sendTypeChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.value;
    const sendType = sendTypes.find(s => s.name === name);
    sendType && setSelectedSendType(sendType);

    switch (sendType) {
      case sendTypes[0]:
        formik.setFieldValue('STATUS', MailingStatus.launchNow);
        break;
      case sendTypes[1]:
        formik.setFieldValue('STATUS', MailingStatus.manual);
        break;
      case sendTypes[2]:
        formik.setFieldValue('STATUS', MailingStatus.delayed);
        break;
      default:
        formik.setFieldValue('STATUS', MailingStatus.manual);
        break;
    }
  };

  useEffect(() => {
    if (!open) {
      formik.resetForm();
      return;
    }

    switch (formik.values.STATUS) {
      case MailingStatus.delayed:
        setSelectedSendType(sendTypes[2]);
        break;
      case MailingStatus.manual:
        setSelectedSendType(sendTypes[1]);
        break;
      case MailingStatus.launchNow:
        setSelectedSendType(sendTypes[0]);
        break;
      default:
        setSelectedSendType(null);
        break;
    }

    const fetchCount = async () => {
      const response = await getCustomersCount({
        includeSegments: formik.values.includeSegments ?? [],
        excludeSegments: formik.values.excludeSegments ?? [],
      });

      if (!('data' in response)) {
        return;
      }

      setCustomersCount(response.data?.count ?? 0);
    };
    fetchCount();
  }, [
    open,
    formik.values.STATUS,
    formik.values.includeSegments,
    formik.values.excludeSegments
  ]);

  const onDelete = () => {
    onSubmit(formik.values, true);
  };

  const templateChange = (value: string) => formik.setFieldValue('TEMPLATE', value);
  const saveTemplateChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => setSaveTemplate(checked);
  const testingEmailsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value.split(',').map(s => s.trim());
    if (value.length > 0 && value[0].length === 0) {
      formik.setFieldValue('testingEmails', []);
      return;
    }
    formik.setFieldValue('testingEmails', value);
  };

  const testLaunch = async () => {
    const {
      NAME,
      TEMPLATE = '',
      testingEmails = [],
      attachments = []
    } = formik.values;

    testLaunching({
      emails: testingEmails,
      subject: NAME,
      template: TEMPLATE,
      attachments
    });
  };

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
    if (JSON.stringify(formik.values.attachments) === JSON.stringify(attachments)) {
      return;
    }
    formik.setFieldValue('attachments', attachments);
  }, [formik.values.attachments]);


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

  const [ListboxComponent] = useAutocompleteVirtualization();

  const segmentsSelect = useCallback((type: 'includeSegments' | 'excludeSegments') => {
    return (
      <Autocomplete
        fullWidth
        ListboxComponent={ListboxComponent}
        options={segments}
        getOptionLabel={option => option.NAME}
        value={segments.filter(({ ID }) => (formik.values[`${type}`]?.findIndex(s => s.ID === ID) ?? 0) >= 0) ?? []}
        loading={segmentsFetching}
        loadingText="Загрузка данных..."
        multiple
        limitTags={3}
        disableCloseOnSelect
        onChange={(event, value) => {
          formik.setFieldValue(type, value);
        }}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.ID}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              checked={selected}
            />
            <Stack>
              <div>{option.NAME}</div>
              <Typography variant="caption">клиентов: {option.QUANTITY ?? 0}</Typography>
            </Stack>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={type === 'includeSegments' ? 'Выбор сегмента получателей' : 'Выбор исключающих сегментов'}
          />
        )}
      />
    );
  }, [ListboxComponent, formik, segments, segmentsFetching]);

  return (
    <CustomizedDialog
      open={open}
      onClose={onCancel}
      width="calc(100% - var(--menu-width))"
    >
      <DialogTitle>
        {mailing?.ID && mailing?.ID > 0
          ? `Редактирование: ${mailing.NAME}`
          : 'Создание новой рассылки'}
      </DialogTitle>
      <DialogContent dividers style={{ display: 'grid' }}>
        <FormikProvider value={formik}>
          <Form id="mailingForm" onSubmit={formik.handleSubmit}>
            <Stack
              height="100%"
              spacing={2}
            >
              <TextField
                name="NAME"
                value={formik.values.NAME}
                onChange={formik.handleChange}
                label="Тема письма"
                autoFocus
                required
                error={getIn(formik.touched, 'NAME') && Boolean(getIn(formik.errors, 'NAME'))}
                helperText={getIn(formik.touched, 'NAME') && getIn(formik.errors, 'NAME')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      <Tooltip
                        style={{ cursor: 'help' }}
                        arrow
                        title={
                          <div>
                            Системные символы:
                            <br />
                            {'#NAME# - наименование клиента'}
                          </div>}
                      >
                        <InfoIcon />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              <Stack
                direction="row"
                spacing={2}
              >
                {segmentsSelect('includeSegments')}
                {segmentsSelect('excludeSegments')}
              </Stack>
              <Box
                sx={{
                  marginTop: '2px !important',
                  marginLeft: '14px !important'
                }}
              >
                <Typography variant="caption">{`Итоговое количество получателей: ${customersCountLoading ? 'идёт расчёт...' : customersCount}`}</Typography>
              </Box>
              <Box minHeight={600} position="relative">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={saveTemplate}
                      onChange={saveTemplateChange}
                    />
                  }
                  label="Добавить в сохранённые шаблоны"
                  style={{
                    position: 'absolute',
                    left: 280,
                    top: 2
                  }}
                />
                <EmailTemplate
                  value={formik.values.TEMPLATE ?? ''}
                  onChange={templateChange}
                />
              </Box>
              <Stack
                direction="row"
                spacing={2}
                alignItems={'center'}
              >
                <TextField
                  label="Получатели тестовой отправки"
                  placeholder="Укажите адреса через запятую (test@gmail.com, test2@tut.by, ...)"
                  fullWidth
                  name="testingEmails"
                  value={formik.values.testingEmails?.join(',') ?? ''}
                  onChange={testingEmailsChange}
                />
                <Tooltip arrow title="Отправить текущий шаблон на указанные тестовые email адреса ">
                  <Box>
                    <LoadingButton
                      onClick={testLaunch}
                      loading={testLaunchingLoading}
                      loadingPosition="start"
                      startIcon={<ForwardToInboxIcon />}
                      variant="contained"
                      size="small"
                    >
                      Отправить
                    </LoadingButton>
                  </Box>
                </Tooltip>
              </Stack>
              <Stack
                direction="row"
                width="50%"
                spacing={2}
              >
                <TextField
                  select
                  required
                  label="Отправить рассылку"
                  onChange={sendTypeChange}
                  value={selectedSendType?.name ?? ''}
                  fullWidth
                >
                  {sendTypes.map(el => (
                    <MenuItem
                      key={el.id}
                      id={String(el.id)}
                      value={el.name}
                    >
                      {el.name}
                    </MenuItem>
                  ))}
                </TextField>
                {selectedSendType?.id === 3 &&
                <DesktopDateTimePicker
                  name="LAUNCHDATE"
                  label="Дата запуска"
                  value={formik.values.LAUNCHDATE ? new Date(formik.values.LAUNCHDATE) : null}
                  onChange={(value) => formik.setFieldValue('LAUNCHDATE', value, true)}
                  slotProps={{
                    actionBar: {
                      actions: ['today', 'cancel', 'accept']
                    },
                    textField: {
                      style: {
                        minWidth: '180px'
                      },
                      required: true,
                      error: Boolean(getIn(formik.errors, 'LAUNCHDATE')),
                      helperText: getIn(formik.errors, 'LAUNCHDATE'),
                    },
                  }}
                />
                }
              </Stack>
              <Dropzone
                // acceptedFiles={['image/*']}
                maxFileSize={maxFileSize}
                filesLimit={3}
                showPreviews
                initialFiles={initialAttachments}
                onChange={attachmentsChange}
                disabled={attachmentsFetching}
              />
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        {formik.values.ID > 0 &&
          <PermissionsGate
            key="delete"
            actionAllowed={userPermissions?.mailings.DELETE}
            show
          >
            <ItemButtonDelete
              button
              text={`Вы действительно хотите удалить рассылку ${mailing?.NAME}?`}
              onClick={onDelete}
            />
          </PermissionsGate>
        }
        <Box flex={1} />
        <ButtonWithConfirmation
          className={'DialogButton'}
          variant="outlined"
          onClick={onCancel}
          text={'Изменения будут утеряны. Продолжить?'}
          confirmation={formik.dirty}
        >
          Отменить
        </ButtonWithConfirmation>
        <Button
          className={'DialogButton'}
          type="submit"
          form="mailingForm"
          variant="contained"
        >
          Сохранить
        </Button>
      </DialogActions>
    </CustomizedDialog>
  );
}

export default MailingUpsert;
