import SmsIcon from '@mui/icons-material/Sms';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import EmailIcon from '@mui/icons-material/Email';
import { Autocomplete, Avatar, Box, Button, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, Stack, Tab, TextField } from '@mui/material';
import CustomizedDialog from '../Styled/customized-dialog/customized-dialog';
import styles from './edit-contact.module.less';
import { IContactPerson, ICustomer, IEmail, IMessenger, IPhone } from '@gsbelarus/util-api-types';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FormikProvider, Form, useFormik } from 'formik';
import * as yup from 'yup';
import { emailsValidation, phonesValidation } from '../helpers/validators';
import EditableTypography from '../editable-typography/editable-typography';
import TelephoneInput from '../telephone-input';
import { useGetContactPersonsQuery } from '../../features/contact/contactApi';
import filterOptions from '../helpers/filter-options';
import { LabelsSelect } from '../Labels/labels-select';
import { CustomerSelect } from '../Kanban/kanban-edit-card/components/customer-select';
import ConfirmDialog from '../../confirm-dialog/confirm-dialog';
import SocialMediaInput, { ISocialMedia, socialMediaIcons } from '../social-media-input';
import CustomizedScrollBox from '../Styled/customized-scroll-box/customized-scroll-box';
import CustomNoData from '../Styled/Icons/CustomNoData';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';

export interface EditContactProps {
  contact: IContactPerson;
  open: boolean;
  onSubmit: (newPerson: IContactPerson, deleting?: boolean) => void;
  onCancel: () => void;
}

export function EditContact({
  open,
  contact,
  onSubmit,
  onCancel,
}: EditContactProps) {
  const { data: persons, isFetching: personsIsFetching, isLoading, refetch } = useGetContactPersonsQuery(undefined, { skip: !open });
  const [tabIndex, setTabIndex] = useState('1');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initValue: Omit<IContactPerson, 'ID'> = {
    NAME: '',
    PHONES: [],
    EMAILS: [],
    MESSENGERS: [],
    LABELS: [],
    ADDRESS: '',
    RANK: '',
  };

  const formik = useFormik<IContactPerson>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue,
      ...contact
    },
    validationSchema: yup.object().shape({
      NAME: yup.string()
        .required('Не указано имя')
        .max(40, 'Слишком длинное имя'),
      // USR$LETTER_OF_AUTHORITY: yup.string().max(80, 'Слишком длинное значение'),
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
      setDeleting(false);
    }
  });

  // console.log('formik', formik.values);

  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const handleCustomerChange = (customer: ICustomer | null | undefined) => {
    formik.setFieldValue('WCOMPANYKEY', customer?.ID);
  };

  const handlePhoneChange = (index: number, value: string) => {
    let newPhones: IPhone[] = [];
    if (Array.isArray(formik.values.PHONES) && (formik.values.PHONES?.length > index)) {
      newPhones = [...formik.values.PHONES];
      newPhones[index] = { ...newPhones[index], USR$PHONENUMBER: value };
    };

    formik.setFieldValue('PHONES', newPhones);
    // setPhones(newPhones);
  };

  const handleAddPhone = () => {
    let newPhones: IPhone[] = [];
    if (formik.values.PHONES?.length) {
      newPhones = [...formik.values.PHONES];
    };
    newPhones.push({ ID: -1, USR$PHONENUMBER: '' });

    formik.setFieldValue('PHONES', newPhones);
  };

  const handleDeletePhone = (index: number) => {
    let newPhones: IPhone[] = [];
    if (Array.isArray(formik.values.PHONES)) {
      newPhones = [...formik.values.PHONES];
      newPhones.splice(index, 1);
    };

    formik.setFieldValue('PHONES', newPhones);
  };

  const handleEmailChange = (index: number, value: string) => {
    let newEmails: IEmail[] = [];
    if (Array.isArray(formik.values.EMAILS) && (formik.values.EMAILS?.length > index)) {
      newEmails = [...formik.values.EMAILS];
      newEmails[index] = { ...newEmails[index], EMAIL: value };
    };

    formik.setFieldValue('EMAILS', newEmails);
  };

  const handleAddEmail = () => {
    let newEmails: IEmail[] = [];
    if (formik.values.EMAILS?.length) {
      newEmails = [...formik.values.EMAILS];
    };
    newEmails.push({ ID: -1, EMAIL: '' });

    formik.setFieldValue('EMAILS', newEmails);
  };

  const handleDeleteEmail = (index: number) => {
    let newEmails: IEmail[] = [];
    if (Array.isArray(formik.values.EMAILS)) {
      newEmails = [...formik.values.EMAILS];
      newEmails.splice(index, 1);
    };

    formik.setFieldValue('EMAILS', newEmails);
  };

  const handleAddMessenger = () => {
    let newMessengers: IMessenger[] = [];
    if (Array.isArray(formik.values.MESSENGERS)) {
      newMessengers = [...formik.values.MESSENGERS];
    };
    newMessengers.push({ ID: -1, CODE: 'telegram', USERNAME: '' });

    formik.setFieldValue('MESSENGERS', newMessengers);
  };

  const handleMessengerChange = (index: number, { name, text }: ISocialMedia) => {
    let newMessengers: IMessenger[] = [];
    if (Array.isArray(formik.values.MESSENGERS) && (formik.values.MESSENGERS?.length > index)) {
      newMessengers = [...formik.values.MESSENGERS];
      newMessengers[index] = {
        ...newMessengers[index],
        CODE: name,
        USERNAME: text
      };
    };

    formik.setFieldValue('MESSENGERS', newMessengers);
  };

  const handleDeleteMessenger = (index: number) => {
    let newMessengers: IMessenger[] = [];
    if (Array.isArray(formik.values.MESSENGERS)) {
      newMessengers = [...formik.values.MESSENGERS];
      newMessengers.splice(index, 1);
    };

    formik.setFieldValue('MESSENGERS', newMessengers);
  };

  const onClose = () => {
    onCancel();
    formik.resetForm();
  } ;

  const handleConfirmOkClick = useCallback(() => {
    setConfirmOpen(false);

    onSubmit(formik.values, deleting);
  }, [formik.values, deleting]);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const handleDeleteClick = () => {
    setDeleting(true);
    setConfirmOpen(true);
  };

  const phoneOptions = useMemo(() =>
    <>
      {formik.values.PHONES?.map(({ ID, USR$PHONENUMBER }, index) => {
        const isTouched = Array.isArray(formik.errors.PHONES) && Boolean((formik.touched.PHONES as unknown as IPhone[])?.[index]?.USR$PHONENUMBER);
        const error = Array.isArray(formik.errors.PHONES) && (formik.errors.PHONES[index] as unknown as IPhone)?.USR$PHONENUMBER;

        return (
          <Stack
            key={index.toString()}
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <PhoneAndroidIcon fontSize="small" color="primary" />
            <EditableTypography
              value={USR$PHONENUMBER}
              width={'100%'}
              deleteable
              onDelete={() => handleDeletePhone(index)}
              editComponent={
                <TelephoneInput
                  name={`PHONE${index}`}
                  label={`Телефон ${index + 1}`}
                  value={USR$PHONENUMBER ?? ''}
                  onChange={(value) => handlePhoneChange(index, value)}
                  fixedCode
                  strictMode
                  error={isTouched && Boolean(error)}
                  helperText={isTouched && error}
                />
              }
            />
          </Stack>

        );
      })}
      <div className={styles['addItemButtonContainer']}>
        <Button
          className={styles['button']}
          onClick={handleAddPhone}
          startIcon={<AddCircleRoundedIcon />}
        >
          Добавить телефон
        </Button>
      </div>
    </>, [formik.errors.PHONES, formik.touched.PHONES, formik.values.PHONES]);

  const emailsOptions = useMemo(() =>
    <>
      {formik.values.EMAILS?.map(({ ID, EMAIL }, index) => {
        const isTouched = Array.isArray(formik.errors.EMAILS) && Boolean((formik.touched.EMAILS as unknown as IEmail[])?.[index]?.EMAIL);
        const error = Array.isArray(formik.errors.EMAILS) && (formik.errors.EMAILS[index] as unknown as IEmail)?.EMAIL;

        return (
          <Stack
            key={index.toString()}
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <EmailIcon fontSize="small" color="primary" />
            <EditableTypography
              value={EMAIL}
              width={'100%'}
              deleteable
              onDelete={() => handleDeleteEmail(index)}
              editComponent={
                <TextField
                  fullWidth
                  name={`EMAIL${index}`}
                  label={`Email ${index + 1}`}
                  value={EMAIL ?? ''}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  error={isTouched && Boolean(error)}
                  helperText={isTouched && error}
                />
              }
            />
          </Stack>

        );
      })}
      <div className={styles['addItemButtonContainer']}>
        <Button
          className={styles['button']}
          onClick={handleAddEmail}
          startIcon={<AddCircleRoundedIcon />}
        >
          Добавить e-mail
        </Button>
      </div>
    </>, [formik.errors.EMAILS, formik.touched.EMAILS, formik.values.EMAILS]);

  const messengersOptions = useMemo(() =>
    <>
      {formik.values.MESSENGERS?.map(({ ID, CODE, USERNAME }, index) => {
        const isTouched = Array.isArray(formik.errors.MESSENGERS) && Boolean((formik.touched.MESSENGERS as unknown as IMessenger[])?.[index]?.USERNAME);
        const error = Array.isArray(formik.errors.MESSENGERS) && (formik.errors.MESSENGERS[index] as unknown as IMessenger)?.USERNAME;

        return (
          <Stack
            key={index}
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <SmsIcon fontSize="small" color="primary" />
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              flex={1}
            >
              <img src={socialMediaIcons[CODE]} width={17} />
              <EditableTypography
                value={USERNAME}
                width={'100%'}
                deleteable
                onDelete={() => handleDeleteMessenger(index)}
                editComponent={
                  <SocialMediaInput
                    value={{
                      name: CODE,
                      text: USERNAME
                    }}
                    name={`MESSANGER${index}`}
                    label={`Мессенджер ${index === 0 ? '' : (index + 1)}`}
                    onChange={(value) => handleMessengerChange(index, value)}
                    placeholder="имя пользователя"
                    error={isTouched && Boolean(error)}
                    helperText={isTouched && error}
                  />
                }
              />
            </Stack>
          </Stack>

        );
      })}
      <div className={styles['addItemButtonContainer']}>
        <Button
          className={styles['button']}
          onClick={handleAddMessenger}
          startIcon={<AddCircleRoundedIcon />}
        >
          Добавить мессенджер
        </Button>
      </div>
    </>, [formik.errors.MESSENGERS, formik.touched.MESSENGERS, formik.values.MESSENGERS]);

  const [isAvatarEdit, setIsAvatarEdit] = useState<boolean>(false);

  const handleAvatarEditOpen = () => {
    setIsAvatarEdit(true);
  };

  const handleAvatarEditClose = () => {
    handleAvatarBlur();
    setIsAvatarEdit(false);
  };

  const [isAvatarFocus, setisAvatarFocus] = useState<boolean>(false);

  const handleAvatarFocus = () => {
    setisAvatarFocus(true);
  };

  const handleAvatarBlur = () => {
    setisAvatarFocus(false);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleUploadAvatar = (e: any) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0] || undefined;
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = (e) => {
      formik.setFieldValue('PHOTO', reader.result?.toString());
    };
    handleAvatarEditClose();
  };

  const handleDeleteAvatar = () => {
    formik.setFieldValue('PHOTO', '');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    handleAvatarEditClose();
  };

  const editableAvatar = useMemo(() => {
    return (
      <div
        style={{ display: 'flex', position: 'relative', borderRadius: '100%' }}
        onMouseEnter={handleAvatarFocus}
        onMouseLeave={handleAvatarBlur}
      >
        <div style={{ position: 'relative', borderRadius: '100%' }}>
          {/* {(isAvatarFocus && !isAvatarEdit) &&
            <div
              style={{
                background: 'black',
                borderRadius: '100%',
                opacity: '0.5', width: '40px', height: '40px',
                position: 'absolute', left: '0', zIndex: 1 }}
            />
          } */}
          <Avatar src={formik.values.PHOTO} />
        </div>

        {!isAvatarEdit ?
          <div
            style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: '40px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'rgba(0,0,0,0.5)',
              opacity: isAvatarFocus ? 1 : 0, visibility: isAvatarFocus ? 'visible' : 'hidden',
              borderRadius: '100%'
            }}
          >
            <IconButton
              style={!isAvatarFocus ? { opacity: '0', visibility: 'hidden' } : {}}
              onClick={handleAvatarEditOpen}
              size="small"
            >
              <EditIcon fontSize="small" color="primary" />
            </IconButton>
          </div>
          : <div style={{ margin: '0px 5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconButton
              onClick={handleAvatarEditClose}
              size="small"
            >
              <CloseIcon fontSize="small" color="primary" />
            </IconButton>
            <IconButton
              size="small"
              component="label"
            >
              <input
                disabled={isLoading}
                hidden
                accept="image/*"
                multiple
                type="file"
                onChange={handleUploadAvatar}
                ref={inputRef}
              />
              <UploadFileIcon fontSize="small" color="primary" />
            </IconButton>
            <IconButton
              onClick={handleDeleteAvatar}
              size="small"
            >
              <DeleteIcon fontSize="small" color="primary" />
            </IconButton>
          </div>
        }
      </div>
    );
  }, [formik]);

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      dangerous={deleting}
      title={deleting ? 'Удаление контакта' : 'Сохранение контакта'}
      text="Вы уверены, что хотите продолжить?"
      confirmClick={handleConfirmOkClick}
      cancelClick={handleConfirmCancelClick}
    />,
  [confirmOpen, deleting]);

  return (
    <CustomizedDialog
      open={open}
      onClose={onClose}
      disableEscape
      width="calc(100% - var(--menu-width))"
    >
      <DialogTitle>
        Редактирование контакта
      </DialogTitle>
      <DialogContent dividers style={{ display: 'grid' }}>
        <FormikProvider value={formik}>
          <Form id="contactEditForm" onSubmit={formik.handleSubmit}>
            <Stack
              direction="row"
              flex={1}
              spacing={2}
              height="100%"
            >
              <Stack width={350} spacing={2}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  {editableAvatar}
                  <EditableTypography
                    style={{ marginLeft: '0px !important' }}
                    name="NAME"
                    value={formik.values.NAME}
                    onChange={formik.handleChange}
                  />
                </Stack>
                {phoneOptions}
                {emailsOptions}
                {messengersOptions}
                <Divider flexItem />
                <Autocomplete
                  fullWidth
                  options={persons?.records ?? []}
                  getOptionLabel={option => option.NAME}
                  filterOptions={filterOptions(50, 'NAME')}
                  value={persons?.records?.find(el => el.ID === formik.values.RESPONDENT?.ID) ?? null}
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
                      error={formik.touched.RESPONDENT && Boolean(formik.errors.RESPONDENT)}
                      helperText={formik.touched.RESPONDENT && formik.errors.RESPONDENT}
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
                <LabelsSelect labels={formik.values.LABELS} onChange={(newLabels) => formik.setFieldValue('LABELS', newLabels)}/>
                <CustomerSelect
                  customer={formik.values.WCOMPANYKEY ? { ID: formik.values.WCOMPANYKEY, NAME: '' } as ICustomer : undefined}
                  onChange={handleCustomerChange}
                  // required
                  error={formik.touched.WCOMPANYKEY && Boolean(formik.errors.WCOMPANYKEY)}
                  helperText={formik.touched.WCOMPANYKEY && formik.errors.WCOMPANYKEY}
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
                  value={formik.values.RANK ?? ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Адрес"
                  type="text"
                  name="ADDRESS"
                  onChange={formik.handleChange}
                  value={formik.values.ADDRESS ?? ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack flex={1}>
                <TabContext value={tabIndex}>
                  <TabList onChange={handleTabsChange}>
                    <Tab label="История" value="1" />
                    <Tab
                      label="Сделки"
                      value="2"
                      // disabled={isLoading}
                    />
                    <Tab
                      label="Задачи"
                      value="3"
                      // disabled={isLoading}
                    />
                  </TabList>
                  <Divider style={{ margin: 0 }} />
                  <TabPanel value="1" className={tabIndex === '1' ? styles.tabPanel : ''}>
                    <CustomNoData />
                  </TabPanel>
                  <TabPanel value="2" className={tabIndex === '2' ? styles.tabPanel : ''}>
                    <CustomNoData />
                  </TabPanel>
                  <TabPanel value="3" className={tabIndex === '3' ? styles.tabPanel : ''}>
                    <CustomNoData />
                  </TabPanel>
                </TabContext>
              </Stack>
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        <IconButton
          onClick={handleDeleteClick}
          size="small"
        >
          <DeleteIcon />
        </IconButton>
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
          form="contactEditForm"
          variant="contained"
        >
             Сохранить
        </Button>
      </DialogActions>
      {memoConfirmDialog}
    </CustomizedDialog>
  );
}

export default EditContact;
