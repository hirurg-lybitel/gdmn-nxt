import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import EmailIcon from '@mui/icons-material/Email';
import { Box, Button, DialogActions, DialogContent, DialogTitle, Divider, InputAdornment, Stack, Tab, TextField, useMediaQuery, useTheme } from '@mui/material';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import styles from './edit-contact.module.less';
import { IContactName, IContactPerson, ICustomer, IEmail, IMessenger, IPhone } from '@gsbelarus/util-api-types';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormikProvider, Form, useFormik } from 'formik';
import * as yup from 'yup';
import { emailsValidation, phonesValidation } from '@gdmn-nxt/helpers/validators';
import EditableTypography from '../../editable-typography/editable-typography';
import TelephoneInput from '../../telephone-input';
import { LabelsSelect } from '../../selectors/labels-select';
import { CustomerSelect } from '../../selectors/customer-select/customer-select';
import SocialMediaInput, { ISocialMedia, socialMedia } from '../../social-media-input';
import CustomNoData from '../../Styled/Icons/CustomNoData';
import EditableAvatar from '@gdmn-nxt/components/editable-avatar/editable-avatar';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import ContactsDeals from '../contacts-deals';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import ContactsTasks from '../contact-tasks';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import { parseToMessengerLink } from '@gdmn-nxt/components/social-media-input/parseToLink';
import ContactName from '@gdmn-nxt/components/Styled/contact-name/contact-name';
import { ContactSelect } from '../../selectors/contact-select';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';

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
  const userPermissions = usePermissions();
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const defaultTab = matchDownMd ? '1' : '3';
  const [tabIndex, setTabIndex] = useState(defaultTab);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const voidPhoneValue: IPhone = { ID: -1, USR$PHONENUMBER: '' };
  const voidEmailValue: IEmail = { ID: -1, EMAIL: '' };
  const voidMessengerValue: IMessenger = { ID: -1, CODE: 'telegram', USERNAME: '' };

  const initValue: Omit<IContactPerson, 'ID'> = {
    NAME: '',
    LABELS: [],
    ADDRESS: '',
    RANK: '',
    nameInfo: {
      lastName: '',
      nickName: ''
    }
  };

  const formik = useFormik<IContactPerson>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue,
      ...{
        ...contact,
        PHONES: (contact?.PHONES && contact?.PHONES?.length > 0) ? contact?.PHONES : [voidPhoneValue],
        EMAILS: (contact?.EMAILS && contact?.EMAILS?.length > 0) ? contact?.EMAILS : [voidEmailValue],
        MESSENGERS: (contact?.MESSENGERS && contact?.MESSENGERS?.length > 0) ? contact?.MESSENGERS : [voidMessengerValue]
      }
    },
    validationSchema: yup.object().shape({
      // NAME: yup.string()
      //   .required('Не указано имя')
      //   .max(40, 'Слишком длинное имя'),
      // USR$LETTER_OF_AUTHORITY: yup.string().max(80, 'Слишком длинное значение'),
      EMAILS: yup.array().of(emailsValidation()),
      PHONES: yup.array().of(phonesValidation()),
      MESSENGERS: yup.array().of(
        yup.object().shape({
          USERNAME: yup.string().max(40, 'Слишком длинное имя'),
        })
      ),
      nameInfo: yup.object({
        lastName: yup.string()
          .required('Не указана фамилия')
          .max(20, 'Слишком длинная фамилия'),
        firstName: yup.string()
          .max(20, 'Слишком длинное имя'),
        middleName: yup.string()
          .max(20, 'Слишком длинное отчество'),
      })
    }),
    onSubmit: (values) => {
      onSubmit(validValues(), false);
    },
    onReset: (values) => {
      setDeleting(false);
      setTabIndex(defaultTab);
    }
  });

  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const handleCustomerChange = (customer: ICustomer | null | undefined) => {
    formik.setFieldValue('COMPANY', { ID: customer?.ID, NAME: customer?.NAME });
  };

  const handlePhoneChange = (index: number, value: string) => {
    let newPhones: IPhone[] = [];
    if (Array.isArray(formik.values.PHONES) && (formik.values.PHONES?.length > index)) {
      newPhones = [...formik.values.PHONES];
      newPhones[index] = { ...newPhones[index], USR$PHONENUMBER: value };
    };

    formik.setFieldValue('PHONES', newPhones);
  };

  const handleAddPhone = () => {
    let newPhones: IPhone[] = [];
    const phones = formik.values.PHONES;
    if (phones?.length) {
      newPhones = [...phones];
    };
    if (phones && phones[phones.length - 1]?.USR$PHONENUMBER === '') {
      return;
    }
    newPhones.push(voidPhoneValue);

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
    const newValue = value.replace(/\s/g, '');
    let newEmails: IEmail[] = [];
    if (Array.isArray(formik.values.EMAILS) && (formik.values.EMAILS?.length > index)) {
      newEmails = [...formik.values.EMAILS];
      newEmails[index] = { ...newEmails[index], EMAIL: newValue };
    };

    formik.setFieldValue('EMAILS', newEmails);
  };

  const handleAddEmail = () => {
    if (formik.values.EMAILS?.length === 1 && formik.values.EMAILS[0].EMAIL === '') return;
    let newEmails: IEmail[] = [];
    if (formik.values.EMAILS?.length) {
      newEmails = [...formik.values.EMAILS];
    };
    newEmails.push(voidEmailValue);

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
    if (formik.values.MESSENGERS?.length === 1 && formik.values.MESSENGERS[0].USERNAME === '') return;
    let newMessengers: IMessenger[] = [];
    if (Array.isArray(formik.values.MESSENGERS)) {
      newMessengers = [...formik.values.MESSENGERS];
    };
    newMessengers.push(voidMessengerValue);

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

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const validValues = () => {
    const newPhones = formik.values.PHONES?.filter(phone => phone.USR$PHONENUMBER.length !== 0) || [];
    const newEmails = formik.values.EMAILS?.filter(email => email.EMAIL.length !== 0) || [];
    const newMessengers = formik.values.MESSENGERS?.filter(mes => mes.USERNAME.length !== 0) || [];
    return { ...formik.values, PHONES: newPhones, EMAILS: newEmails, MESSENGERS: newMessengers };
  };

  const handleDeleteClick = () => {
    onSubmit(formik.values, true);
  };

  const handleStopPropagation = (e: any) => {
    e.stopPropagation();
  };

  const phoneOptions = useMemo(() =>
    <div>
      {formik.values.PHONES?.map(({ ID, USR$PHONENUMBER }, index) => {
        const isTouched = Array.isArray(formik.errors.PHONES) && Boolean((formik.touched.PHONES as unknown as IPhone[])?.[index]?.USR$PHONENUMBER);
        const error = Array.isArray(formik.errors.PHONES) ? (formik.errors.PHONES[index] as unknown as IPhone)?.USR$PHONENUMBER : '';
        const firstElement = formik.values.PHONES?.length === 1 && formik.values.PHONES[0].USR$PHONENUMBER === '';
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
              container={(value) =>
                <a
                  className={styles.link}
                  href={`tel:${USR$PHONENUMBER.replace(/\s+/g, '')}`}
                >
                  {value}
                </a>}
              width={'100%'}
              deleteable
              onDelete={() => handleDeletePhone(index)}
              helperText={error}
              error={isTouched && Boolean(error)}
              editMode={firstElement}
              closeOnBlur={!firstElement}
              editEmpty={false}
              editComponent={
                <TelephoneInput
                  name={`PHONE${index}`}
                  autoFocus={!firstElement}
                  value={USR$PHONENUMBER ?? ''}
                  onChange={(value) => handlePhoneChange(index, value)}
                  fixedCode
                  strictMode
                  error={isTouched && Boolean(error)}
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
    </div>, [formik.errors.PHONES, formik.touched.PHONES, formik.values.PHONES]);

  const emailsOptions = useMemo(() =>
    <div>
      {formik.values.EMAILS?.map(({ ID, EMAIL }, index) => {
        const isTouched = Array.isArray(formik.errors.EMAILS) && Boolean((formik.touched.EMAILS as unknown as IEmail[])?.[index]?.EMAIL);
        const error = Array.isArray(formik.errors.EMAILS) ? (formik.errors.EMAILS[index] as unknown as IEmail)?.EMAIL : '';
        const firstElement = formik.values.EMAILS?.length === 1 && formik.values.EMAILS[0].EMAIL === '';
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
              container={(value) => <a className={styles.link} href={`mailto:${value}`}>{value}</a>}
              width={'100%'}
              deleteable
              onDelete={() => handleDeleteEmail(index)}
              error={isTouched && Boolean(error)}
              helperText={error}
              editMode={firstElement}
              closeOnBlur={!firstElement}
              editEmpty={false}
              editComponent={
                <TextField
                  fullWidth
                  autoFocus={!firstElement}
                  name={`EMAIL${index}`}
                  value={EMAIL ?? ''}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  error={isTouched && Boolean(error)}
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
    </div>, [formik.errors.EMAILS, formik.touched.EMAILS, formik.values.EMAILS]);

  const messengersOptions = useMemo(() =>
    <div>
      {formik.values.MESSENGERS?.map(({ ID, CODE, USERNAME }, index) => {
        const isTouched = Array.isArray(formik.errors.MESSENGERS) && Boolean((formik.touched.MESSENGERS as unknown as IMessenger[])?.[index]?.USERNAME);
        const error = Array.isArray(formik.errors.MESSENGERS) ? (formik.errors.MESSENGERS[index] as unknown as IMessenger)?.USERNAME : '';
        const firstElement = formik.values.MESSENGERS?.length === 1 && formik.values.MESSENGERS[0].USERNAME === '';
        return (
          <Stack
            key={index}
            direction="row"
            alignItems="center"
            spacing={2}
          >
            {/* <SmsIcon fontSize="small" color="primary" /> */}
            <div className={styles['messenger-icon']}>
              <img src={socialMedia[CODE].icon} width={17} />
            </div>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              flex={1}
            >
              <EditableTypography
                value={USERNAME}
                container={(value) =>
                  <a
                    className={`${styles.link} ${!socialMedia[CODE].link ? styles.linkDisabled : ''}`}
                    onClick={handleStopPropagation}
                    href={parseToMessengerLink(CODE, USERNAME)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {value}
                  </a>}
                width={'100%'}
                deleteable
                onDelete={() => handleDeleteMessenger(index)}
                helperText={error}
                error={isTouched && Boolean(error)}
                editMode={firstElement}
                closeOnBlur={!firstElement}
                editEmpty={false}
                editComponent={
                  <SocialMediaInput
                    value={{
                      name: CODE,
                      text: USERNAME
                    }}
                    name={`MESSANGER${index}`}
                    autoFocus={!firstElement}
                    onChange={(value) => handleMessengerChange(index, value)}
                    placeholder="имя пользователя"
                    error={isTouched && Boolean(error)}
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
    </div>, [formik.errors.MESSENGERS, formik.touched.MESSENGERS, formik.values.MESSENGERS]);

  const handleAvatarChange = useCallback((newAvatar: string | undefined) => {
    formik.setFieldValue('PHOTO', newAvatar);
  }, [formik]);

  const handleNameInfoChange = useCallback((value: IContactName) => {
    formik.setFieldValue('nameInfo', value);
  }, [formik]);

  const contactEditForm = useMemo(() => {
    return (
      <Stack spacing={2} style={{ marginRight: '16px' }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          <EditableAvatar value={formik.values.PHOTO} onChange={handleAvatarChange}/>
          <ContactName
            value={formik.values.nameInfo}
            onChange={handleNameInfoChange}
            required
            fullWidth
            error={formik.touched.nameInfo && Boolean(formik.errors.nameInfo)}
          />
        </Stack>
        {phoneOptions}
        {emailsOptions}
        {messengersOptions}
        <Divider flexItem />
        <ContactSelect
          label="Ответственный"
          placeholder="Выберите ответственного"
          value={formik.values.RESPONDENT ?? null}
          onChange={(value) => formik.setFieldValue('RESPONDENT', value || undefined)}
          error={formik.touched.RESPONDENT && Boolean(formik.errors.RESPONDENT)}
          helperText={formik.touched.RESPONDENT ? formik.errors.RESPONDENT : undefined}
          slots={{
            startIcon: <ManageAccountsIcon />
          }}
        />
        <LabelsSelect labels={formik.values.LABELS} onChange={(newLabels) => formik.setFieldValue('LABELS', newLabels)}/>
        <CustomerSelect
          value={formik.values.COMPANY}
          onChange={handleCustomerChange}
          // required
          error={formik.touched.COMPANY && Boolean(formik.errors.COMPANY)}
          helperText={formik.touched.COMPANY && formik.errors.COMPANY}
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
          multiline
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
    );
  }, [emailsOptions, formik, handleAvatarChange, handleCustomerChange, handleNameInfoChange, messengersOptions, phoneOptions]);

  return (
    <EditDialog
      open={open}
      onClose={onClose}
      title={'Редактирование контакта'}
      confirmation={formik.dirty}
      onDeleteClick={handleDeleteClick}
      deleteButton={userPermissions?.contacts?.DELETE}
      fullwidth
    >
      <FormikProvider value={formik}>
        <Form
          id="contactEditForm"
          style={{ minWidth: matchDownMd ? 0 : undefined }}
          onSubmit={formik.handleSubmit}
        >
          <Stack
            direction="row"
            flex={1}
            spacing={2}
            height="100%"
          >
            {!matchDownMd && <>
              <div className={styles.editPanel}>
                <CustomizedScrollBox>
                  {contactEditForm}
                </CustomizedScrollBox>
              </div>
              <Divider orientation="vertical" flexItem />
            </>
            }
            <Stack style={{ width: matchDownMd ? '100%' : 'auto' }} flex={1}>
              <TabContext value={tabIndex}>
                <TabList
                  scrollButtons="auto"
                  variant="scrollable"
                  onChange={handleTabsChange}
                  className={styles.tabHeaderRoot}
                >
                  {matchDownMd && (
                    <Tab
                      label="Редактирование"
                      value="1"
                    />
                  )}
                  <Tab
                    label="История"
                    value="2"
                    disabled
                  />
                  <Tab
                    label="Сделки"
                    value="3"
                  />
                  <Tab
                    label="Задачи"
                    value="4"
                  />
                </TabList>
                <Divider style={{ margin: 0 }} />
                {matchDownMd && <TabPanel value="1" className={tabIndex === '1' ? styles.tabPanel : ''}>
                  <div style={{ width: '100%', marginRight: '-16px !important' }}>
                    <CustomizedScrollBox>
                      <div style={{ paddingBottom: '1px' }}>
                        {contactEditForm}
                      </div>
                    </CustomizedScrollBox>
                  </div>
                </TabPanel>}
                <TabPanel value="2" className={tabIndex === '2' ? styles.tabPanel : ''}>
                  <div className={styles.noData}><CustomNoData /></div>
                </TabPanel>
                <TabPanel value="3" className={tabIndex === '3' ? styles.tabPanel : ''}>
                  <ContactsDeals contactId={contact?.ID ?? -1} />
                </TabPanel>
                <TabPanel value="4" className={tabIndex === '4' ? styles.tabPanel : ''}>
                  <ContactsTasks contactId={contact?.ID ?? -1} />
                </TabPanel>
              </TabContext>
            </Stack>
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}

export default EditContact;
