import TagIcon from '@mui/icons-material/Tag';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Autocomplete, Box, Button, DialogActions, DialogContent, DialogTitle, InputAdornment, Stack, TextField } from '@mui/material';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import styles from './add-contact.module.less';
import TelephoneInput from '../../telephone-input';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import { IContactPerson, ICustomer, IEmail, IMessenger, IPhone } from '@gsbelarus/util-api-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LabelsSelect } from '../../Labels/labels-select';
import { CustomerSelect } from '../../Kanban/kanban-edit-card/components/customer-select';
import filterOptions from '../../helpers/filter-options';
import { useGetContactPersonsQuery } from '../../../features/contact/contactApi';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { useGetDepartmentsQuery } from '../../../features/departments/departmentsApi';
import { emailsValidation, phonesValidation } from '../../helpers/validators';
import SocialMediaInput, { ISocialMedia } from '../../social-media-input';

export interface AddContactProps {
  open: boolean;
  contact?: IContactPerson;
  onSubmit: (newPerson: IContactPerson) => void;
  onCancel: () => void;
}

export function AddContact({
  open,
  contact,
  onSubmit,
  onCancel
}: AddContactProps) {
  const { data: departments, isFetching: departmentsIsFetching } = useGetDepartmentsQuery(undefined, { skip: !open });
  const { data: persons, isFetching: personsIsFetching, isLoading, refetch } = useGetContactPersonsQuery(undefined, { skip: !open });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const initValue: IContactPerson = {
    ID: -1,
    NAME: '',
    PHONES: [{ ID: -1, USR$PHONENUMBER: '' }],
    EMAILS: [{ ID: -1, EMAIL: '' }],
    MESSENGERS: [{ ID: -1, CODE: 'telegram', USERNAME: '' }],
    LABELS: [],
    COMPANY: contact?.COMPANY,
  };

  const formik = useFormik<IContactPerson>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue
    },
    validationSchema: yup.object().shape({
      NAME: yup.string()
        .required('Не указано имя')
        .max(40, 'Слишком длинное имя'),
      USR$LETTER_OF_AUTHORITY: yup.string().max(80, 'Слишком длинное значение'),
      EMAILS: yup.array().of(emailsValidation()),
      PHONES: yup.array().of(phonesValidation())
    }),
    onSubmit: (values) => {
      if (!confirmOpen) {
        setConfirmOpen(true);
        return;
      };
      setConfirmOpen(false);
    },
    onReset: (values) => {
      setPhones([]);
      setEmails([]);
    }
  });

  const onClose = () => {
    onCancel();
    formik.resetForm();
  };

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const [phones, setPhones] = useState<IPhone[]>(formik.values.PHONES ?? []);
  const [emails, setEmails] = useState<IEmail[]>(formik.values.EMAILS ?? []);

  const handleAddPhone = () => {
    let newPhones: any[] = [];
    if (formik.values.PHONES?.length) {
      newPhones = [...formik.values.PHONES];
    };
    newPhones.push({ ID: -1, USR$PHONENUMBER: '' });

    formik.setFieldValue('PHONES', newPhones);
    setPhones(newPhones);
  };

  const handleAddEmail = () => {
    let newEmails: IEmail[] = [];
    if (formik.values.EMAILS?.length) {
      newEmails = [...formik.values.EMAILS];
    };
    newEmails.push({ ID: -1, EMAIL: '' });

    formik.setFieldValue('EMAILS', newEmails);
    setEmails(newEmails);
  };

  const handleAddMessenger = () => {
    let newMessengers: IMessenger[] = [];
    if (formik.values.MESSENGERS?.length) {
      newMessengers = [...formik.values.MESSENGERS];
    };
    newMessengers.push({ ID: -1, CODE: 'telegram', USERNAME: '' });

    formik.setFieldValue('MESSENGERS', newMessengers);
  };

  const handlePhoneChange = (index: number, value: string) => {
    let newPhones: IPhone[] = [];
    if (formik.values.PHONES?.length && (formik.values.PHONES?.length > index)) {
      newPhones = [...formik.values.PHONES];
      newPhones[index] = { ...newPhones[index], USR$PHONENUMBER: value };
    };

    formik.setFieldValue('PHONES', newPhones);
    setPhones(newPhones);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newValue = value.replace(/\s/g, '');
    let newEmails: IEmail[] = [];
    if (formik.values.EMAILS?.length && (formik.values.EMAILS?.length > index)) {
      newEmails = [...formik.values.EMAILS];
      newEmails[index] = { ...newEmails[index], EMAIL: newValue };
    };

    formik.setFieldValue('EMAILS', newEmails);
    setEmails(newEmails);
  };

  const handleMessengerChange = (index: number, value: ISocialMedia) => {
    let newMessengers: IMessenger[] = [];
    if (formik.values.MESSENGERS?.length && (formik.values.MESSENGERS?.length >= index)) {
      newMessengers = [...formik.values.MESSENGERS];
      newMessengers[index] = {
        ...newMessengers[index],
        CODE: value.name,
        USERNAME: value.text
      };
    };

    formik.setFieldValue('MESSENGERS', newMessengers);
  };

  const handleCustomerChange = (customer: ICustomer | null | undefined) => {
    formik.setFieldValue('COMPANY', { ID: customer?.ID, NAME: customer?.NAME });
  };

  const handleConfirmOkClick = useCallback(() => {
    setConfirmOpen(false);

    const newPhones = formik.values.PHONES?.filter(phone => !!phone.USR$PHONENUMBER);
    if (Array.isArray(newPhones)) formik.values.PHONES = [...newPhones];

    const newEmails = formik.values.EMAILS?.filter(email => !!email.EMAIL);
    if (Array.isArray(newEmails)) formik.values.EMAILS = [...newEmails];

    const newMessengers = formik.values.MESSENGERS?.filter(mes => !!mes.USERNAME);
    if (Array.isArray(newMessengers)) formik.values.MESSENGERS = [...newMessengers];

    onSubmit(formik.values);
    onClose();
  }, [formik.values]);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const emailOptions = useMemo(() =>
    <>
      <TextField
        label="Email"
        type="text"
        name="EMAIL[0]"
        value={formik.values.EMAILS?.length ? formik.values.EMAILS[0].EMAIL : ''}
        onChange={(e) => handleEmailChange(0, e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon />
            </InputAdornment>
          ),
        }}
        helperText={(() => {
          const isTouched = Array.isArray(formik.errors.EMAILS) && Boolean((formik.touched.EMAILS as unknown as IEmail[])?.[0]?.EMAIL);
          const error = Array.isArray(formik.errors.EMAILS) && (formik.errors.EMAILS[0] as unknown as IEmail)?.EMAIL;
          return isTouched ? error : '';
        })()}
        error={(() => {
          const isTouched = Array.isArray(formik.errors.EMAILS) && Boolean((formik.touched.EMAILS as unknown as IEmail[])?.[0]?.EMAIL);
          const error = Array.isArray(formik.errors.EMAILS) && (formik.errors.EMAILS[0] as unknown as IEmail)?.EMAIL;
          return isTouched && Boolean(error);
        })()}
      />
      {emails.slice(1)
        .map((e, index, { length }) => {
          const isTouched = Array.isArray(formik.errors.EMAILS) && Boolean((formik.touched.EMAILS as unknown as IEmail[])?.[index + 1]?.EMAIL);
          const error = Array.isArray(formik.errors.EMAILS) && (formik.errors.EMAILS[index + 1] as unknown as IEmail)?.EMAIL;

          return (
            <TextField
              key={index.toString()}
              name={`EMAIL${index + 2}`}
              label={`Email ${index + 2}`}
              value={e.EMAIL ?? ''}
              onChange={(e) => handleEmailChange(index + 1, e.target.value)}
              error={isTouched && Boolean(error)}
              helperText={isTouched && error}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
          );
        })}
      <div style={{ marginTop: 2 }}>
        <Button
          onClick={handleAddEmail}
          startIcon={<AddCircleRoundedIcon />}
        >
          Добавить email
        </Button>
      </div>
    </>, [emails, formik.errors.EMAILS, formik.touched.EMAILS, formik.values.EMAILS]);

  const phoneOptions = useMemo(() =>
    <>
      <TelephoneInput
        name="PHONES[0]"
        label="Телефон"
        placeholder="введите номер"
        value={formik.values.PHONES?.length ? formik.values.PHONES[0].USR$PHONENUMBER : ''}
        onChange={(value) => handlePhoneChange(0, value)}
        fixedCode
        strictMode
        helperText={(() => {
          const isTouched = Array.isArray(formik.errors.PHONES) && Boolean((formik.touched.PHONES as unknown as IPhone[])?.[0]?.USR$PHONENUMBER);
          const error = Array.isArray(formik.errors.PHONES) && (formik.errors.PHONES[0] as unknown as IPhone)?.USR$PHONENUMBER;
          return isTouched ? error : '';
        })()}
        error={(() => {
          const isTouched = Array.isArray(formik.errors.PHONES) && Boolean((formik.touched.PHONES as unknown as IPhone[])?.[0]?.USR$PHONENUMBER);
          const error = Array.isArray(formik.errors.PHONES) && (formik.errors.PHONES[0] as unknown as IPhone)?.USR$PHONENUMBER;
          return isTouched && Boolean(error);
        })()}
      />
      {phones.slice(1)
        .map((phone, index, { length }) => {
          const isTouched = Array.isArray(formik.errors.PHONES) && Boolean((formik.touched.PHONES as unknown as IPhone[])?.[index + 1]?.USR$PHONENUMBER);
          const error = Array.isArray(formik.errors.PHONES) && (formik.errors.PHONES[index + 1] as unknown as IPhone)?.USR$PHONENUMBER;

          return (
            <TelephoneInput
              key={index.toString()}
              name={`PHONE${index + 2}`}
              label={`Телефон ${index + 2}`}
              value={phone.USR$PHONENUMBER ?? ''}
              placeholder="введите номер"
              onChange={(value) => handlePhoneChange(index + 1, value)}
              fixedCode
              strictMode
              error={isTouched && Boolean(error)}
              helperText={isTouched && error}
            />
          );
        })}
      <div style={{ marginTop: 2 }}>
        <Button
          onClick={handleAddPhone}
          startIcon={<AddCircleRoundedIcon />}
        >
          Добавить телефон
        </Button>
      </div>
    </>, [phones, formik.errors.PHONES, formik.touched.PHONES, formik.values.PHONES]);

  const messengerOptions = useMemo(() =>
    <>
      {formik.values.MESSENGERS?.map((mes, index) => {
        const isTouched = Array.isArray(formik.errors.MESSENGERS) && Boolean((formik.touched.MESSENGERS as unknown as IMessenger[])?.[0]?.USERNAME);
        const error = Array.isArray(formik.errors.MESSENGERS) && (formik.errors.MESSENGERS[0] as unknown as IMessenger)?.USERNAME;
        return (
          <SocialMediaInput
            key={index}
            value={{
              name: mes.CODE,
              text: mes.USERNAME
            }}
            name={`MESSANGER${index}`}
            label={`Мессенджер ${index === 0 ? '' : (index + 1)}`}
            onChange={(value) => handleMessengerChange(index, value)}
            placeholder="имя пользователя"
            error={isTouched && Boolean(error)}
            helperText={isTouched && error}
          />
        );
      })}
      <div style={{ marginTop: 2 }}>
        <Button
          onClick={handleAddMessenger}
          startIcon={<AddCircleRoundedIcon />}
        >
          Добавить мессенджер
        </Button>
      </div>
    </>, [formik.errors.MESSENGERS, formik.touched.MESSENGERS, formik.values.MESSENGERS]);

  return (
    <CustomizedDialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        Добавление контакта
      </DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
          <Form id="contactForm" onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Имя"
                name="NAME"
                autoFocus
                required
                value={formik.values.NAME}
                onChange={formik.handleChange}
                helperText={formik.touched.NAME && formik.errors.NAME}
                error={formik.touched.NAME && Boolean(formik.errors.NAME)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
              {emailOptions}
              {phoneOptions}
              {messengerOptions}
              <Autocomplete
                fullWidth
                options={persons?.records ?? []}
                getOptionLabel={option => option.NAME}
                filterOptions={filterOptions(50, 'NAME')}
                value={persons?.records?.find(el => el.ID === formik.values.RESPONDENT?.ID) || null}
                loading={personsIsFetching}
                loadingText="Загрузка данных..."
                onChange={(event, value) => {
                  formik.setFieldValue('RESPONDENT', value);
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
                    label="Ответственный"
                    placeholder="Выберите ответственного"
                    error={getIn(formik.touched, 'RESPONDENT') && Boolean(getIn(formik.errors, 'RESPONDENT'))}
                    helperText={getIn(formik.touched, 'RESPONDENT') && getIn(formik.errors, 'RESPONDENT')}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="end">
                          <ManageAccountsIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <LabelsSelect
                labels={formik.values.LABELS}
                onChange={(newLabels) => formik.setFieldValue('LABELS', newLabels)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="end">
                      <TagIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <CustomerSelect
                value={formik.values.COMPANY}
                onChange={handleCustomerChange}
                // required
                error={getIn(formik.touched, 'COMPANY') && Boolean(getIn(formik.errors, 'COMPANY'))}
                helperText={getIn(formik.touched, 'COMPANY') && getIn(formik.errors, 'COMPANY')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="end">
                      <PeopleAltIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Должность"
                type="text"
                name="RANK"
                onChange={formik.handleChange}
                value={formik.values.RANK}
              />
              <TextField
                label="Адрес"
                type="text"
                name="ADDRESS"
                onChange={formik.handleChange}
                value={formik.values.ADDRESS}
              />
              <TextField
                label="Доверенность"
                type="text"
                name="USR$LETTER_OF_AUTHORITY"
                onChange={formik.handleChange}
                value={formik.values.USR$LETTER_OF_AUTHORITY}
              />
              <Autocomplete
                options={departments || []}
                value={departments?.find(el => el.ID === formik.values.USR$BG_OTDEL?.ID) || null}
                onChange={(e, value) => {
                  formik.setFieldValue(
                    'USR$BG_OTDEL',
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
                    label="Отдел"
                    type="text"
                    name="USR$BG_OTDEL"
                    onChange={formik.handleChange}
                    value={formik.values.USR$BG_OTDEL}
                    helperText={formik.errors.USR$BG_OTDEL}
                    placeholder="Выберите отдел"
                  />
                )}
                loading={departmentsIsFetching}
                loadingText="Загрузка данных..."
              />
              <TextField
                label="Комментарий"
                type="text"
                name="NOTE"
                multiline
                minRows={1}
                maxRows={4}
                onChange={formik.handleChange}
                value={formik.values.NOTE}
              />
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        <Box flex={1}/>
        <Button
          className={styles.button}
          onClick={onClose}
          variant="outlined"
          color="primary"
        >
             Отменить
        </Button>
        <Button
          className={styles.button}
          type="submit"
          form="contactForm"
          variant="contained"
        >
             Сохранить
        </Button>
      </DialogActions>
      <ConfirmDialog
        open={confirmOpen}
        title={'Сохранение'}
        text="Вы уверены, что хотите продолжить?"
        confirmClick={handleConfirmOkClick}
        cancelClick={handleConfirmCancelClick}
      />
    </CustomizedDialog>
  );
}

export default AddContact;
