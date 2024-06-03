import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import styles from './mailing-upsert.module.less';
import EmailTemplate from '@gdmn-nxt/components/email-template/email-template';
import { ArrayElement, IMailing, ISegment } from '@gsbelarus/util-api-types';
import { Autocomplete, Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import { useGetAllSegmentsQuery } from '../../../features/Marketing/segments/segmentsApi';
import filterOptions from '@gdmn-nxt/components/helpers/filter-options';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { ChangeEvent, useEffect, useState } from 'react';

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
  const { data: { segments } = {
    count: 0,
    segments: [] },
  isFetching: segmentsFetching
  } = useGetAllSegmentsQuery();

  const initValue: IMailing = {
    ID: -1,
    NAME: '',
    includeSegments: [],
    excludeSegments: []
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
      // USR$LETTER_OF_AUTHORITY: yup.string().max(80, 'Слишком длинное значение'),
      // EMAILS: yup.array().of(emailsValidation()),
      // PHONES: yup.array().of(phonesValidation())
    }),
    onSubmit: (values) => {
      onSubmit(values, false);
      // onSubmit(validValues(), false);
    },
    onReset: (values) => {
      setSelectedSendType(sendTypes[1]);
    }
  });

  const [selectedSendType, setSelectedSendType] = useState(sendTypes[1]);

  const sendTypeChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.value;
    const sendType = sendTypes.find(s => s.name === name);
    sendType && setSelectedSendType(sendType);
  };

  useEffect(() => {
    if (open) return;
    formik.resetForm();
  }, [open]);


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
          <Form id="contactEditForm" onSubmit={formik.handleSubmit}>
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
              />
              <Stack
                direction="row"
                spacing={2}
              >
                <Autocomplete
                  fullWidth
                  options={segments}
                  getOptionLabel={option => option.NAME}
                  filterOptions={filterOptions(50, 'NAME')}
                  value={segments.filter(({ ID }) => (formik.values.includeSegments?.findIndex(s => s.ID === ID) ?? 0) >= 0) ?? []}
                  loading={segmentsFetching}
                  loadingText="Загрузка данных..."
                  multiple
                  limitTags={3}
                  disableCloseOnSelect
                  onChange={(event, value) => {
                    formik.setFieldValue('includeSegments', value);
                  }}
                  renderOption={(props, option: ISegment, { selected }) => (
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
                      label="Выбор сегмента получателей"
                      // placeholder="Выберите ответственного"
                      // InputProps={{
                      //   ...params.InputProps,
                      //   startAdornment: (
                      //     <InputAdornment position="end">
                      //       <ManageAccountsIcon />
                      //     </InputAdornment>
                      //   ),
                      // }}
                    />
                  )}
                />
                <Autocomplete
                  fullWidth
                  options={segments}
                  getOptionLabel={option => option.NAME}
                  filterOptions={filterOptions(50, 'NAME')}
                  value={segments.filter(({ ID }) => (formik.values.excludeSegments?.findIndex(s => s.ID === ID) ?? 0) >= 0) ?? []}
                  loading={segmentsFetching}
                  loadingText="Загрузка данных..."
                  multiple
                  limitTags={3}
                  disableCloseOnSelect
                  onChange={(event, value) => {
                    formik.setFieldValue('excludeSegments', value);
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
                      label="Выбор исключающих сегментов"
                      // placeholder="Выберите ответственного"
                      // InputProps={{
                      //   ...params.InputProps,
                      //   startAdornment: (
                      //     <InputAdornment position="end">
                      //       <ManageAccountsIcon />
                      //     </InputAdornment>
                      //   ),
                      // }}
                    />
                  )}
                />
              </Stack>
              <Box minHeight={600}>
                <EmailTemplate
                  initialValue={mailing?.TEMPLATE ?? ''}
                  onChange={(value) => console.log('value', value)}
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
                />
                <Tooltip arrow title="Отправить текущий шаблон на указанные тестовые email адреса ">
                  <Box>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<ForwardToInboxIcon />}
                    >
                      Отправить
                    </Button >
                  </Box>
                </Tooltip>
              </Stack>
              <Box width="30%">
                <TextField
                  select
                  required
                  label="Отправить рассылку"
                  onChange={sendTypeChange}
                  value={selectedSendType.name ?? ''}
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
              </Box>
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
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
          form="dealSource"
          variant="contained"
        >
          Сохранить
        </Button>
      </DialogActions>
    </CustomizedDialog>
  );
}

export default MailingUpsert;
