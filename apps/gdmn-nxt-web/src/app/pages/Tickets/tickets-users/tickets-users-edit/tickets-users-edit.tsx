import styles from './tickets-users-edit.module.less';
import { ITicketUser } from '@gsbelarus/util-api-types';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';
import { Form, FormikProvider, useFormik } from 'formik';
import { emailValidation, passwordValidation } from '@gdmn-nxt/helpers/validators';
import TelephoneInput, { validatePhoneNumber } from '@gdmn-nxt/components/telephone-input';
import * as yup from 'yup';
import { Checkbox, Chip, FormControlLabel, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useMemo } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { generatePassword } from '@gsbelarus/util-useful';
import { ITicketUserRequestResult } from 'apps/gdmn-nxt-web/src/app/features/tickets/ticketsApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { SerializedError } from '@reduxjs/toolkit';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { useSnackbar } from '@gdmn-nxt/helpers/hooks/useSnackbar';

export interface CustomerEditProps {
  open: boolean;
  user: ITicketUser | null;
  onSubmit: (values: ITicketUser, isDelete: boolean) => Promise<{ data: ITicketUserRequestResult; } | { error: FetchBaseQueryError | SerializedError; } | undefined>;
  onCancel: () => void;
  isLoading: boolean;
}

export function TicketsUserEdit({
  open,
  user,
  onSubmit,
  onCancel,
  isLoading
}: Readonly<CustomerEditProps>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const password = useMemo(() => user?.password ?? generatePassword(10), [user?.password, open]);

  const initValue: ITicketUser = useMemo(() => ({
    ID: user?.ID ?? -1,
    company: user?.company ?? {
      ID: -1,
      NAME: ''
    },
    fullName: user?.fullName ?? '',
    password: password,
    userName: user?.userName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    isAdmin: user?.isAdmin ?? false
  }), [user?.ID, user?.company, user?.fullName, user?.userName, user?.email, user?.phone, user?.isAdmin, password]);

  const isEditUser = initValue?.ID !== -1;

  const formik = useFormik<ITicketUser>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...user,
      ...initValue
    },
    validationSchema: yup.object().shape(isEditUser ? {} : {
      userName: yup
        .string()
        .required('')
        .max(20, 'Слишком длинный логин'),
      fullName: yup
        .string()
        .required('')
        .max(80, 'Слишком длинное имя'),
      password: passwordValidation(),
      email: emailValidation().required(''),
      phone: yup
        .string()
        .test('',
          ({ value }) => validatePhoneNumber(value) ?? '',
          (value = '') => !validatePhoneNumber(value))
    }),
    onSubmit: async (values) => {
      const result = await onSubmit(values, false);
      if (result && 'data' in result) {
        formik.resetForm();
      }
    },
  });

  const handleCancel = () => {
    onCancel();
    formik.resetForm();
  };

  const handlePhoneChange = (value: string) => {
    formik.setFieldValue('phone', value);
  };

  const { addSnackbar } = useSnackbar();

  const handleCopy = (value?: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value)
      .then(() => addSnackbar('Скопировано!', { variant: 'success' }))
      .catch(err => console.error('Ошибка копирования:', err));
  };

  const handleDelete = () => {
    onSubmit(formik.values, true);
  };

  return (
    <EditDialog
      open={open}
      onClose={handleCancel}
      form={'ticketsUserAddForm'}
      title={`${isEditUser ? 'Редактирование' : 'Добавление'} ответственного`}
      confirmation={formik.dirty}
      submitButtonDisabled={isLoading}
      deleteButton={isEditUser}
      onDeleteClick={handleDelete}
    >
      <FormikProvider value={formik}>
        <Form
          id="ticketsUserAddForm"
          onSubmit={formik.handleSubmit}
        >
          <Stack spacing={2}>
            <TextField
              required
              fullWidth
              label="ФИО"
              type="text"
              name="fullName"
              onChange={formik.handleChange}
              value={formik.values.fullName}
              error={!!formik.errors.fullName}
              helperText={formik.errors.fullName}
              disabled={isEditUser}
            />
            <TextField
              required
              fullWidth
              label="Email"
              type="text"
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              error={!!formik.errors.email}
              helperText={formik.errors.email}
              disabled={isEditUser}
            />
            <TelephoneInput
              fullWidth
              strictMode
              fixedCode
              label="Телефон"
              name="phone"
              onChange={handlePhoneChange}
              value={formik.values.phone}
              error={!!formik.errors.phone}
              helperText={formik.errors.phone}
              disabled={isEditUser}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.isAdmin}
                  onChange={(e) => formik.setFieldValue('isAdmin', e.target.checked)}
                />
              }
              label="Администратор"
            />
            {!isEditUser && <div>
              <div
                style={{
                  display: 'flex', gap: '16px', border: '1px solid var(--color-borders)',
                  padding: '16px', position: 'relative', borderRadius: 'var(--border-radius)',
                  flexDirection: 'column', minHeight: '130px'
                }}
              >
                <div style={{ position: 'absolute', top: '-14px', left: '10px', background: 'var(--color-paper-bg)', padding: '0px 5px' }}>
                  <Typography variant="caption">
                    Данные для входа
                  </Typography>
                </div>
                <TextField
                  required
                  fullWidth
                  label="Логин"
                  type="text"
                  name="userName"
                  onChange={formik.handleChange}
                  value={formik.values.userName}
                  error={!!formik.errors.userName}
                  helperText={formik.errors.userName}
                />
                <TextField
                  required
                  fullWidth
                  disabled
                  label="Пароль"
                  name="password"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  error={!!formik.errors.password}
                  helperText={formik.errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleCopy(formik.values.password)}
                          edge="end"
                          sx={{
                            opacity: 0.7,
                            '&:hover': { opacity: 1 }
                          }}
                        >
                          <ContentCopyOutlinedIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <Chip
                icon={<InfoIcon />}
                color={'warning'}
                label={'После создания изменение и просмотр данных будет недоступен'}
                variant="outlined"
                className={styles.info}
                sx={{ border: 'none', '& span': { textWrap: 'wrap' }, height: 'fit-content', marginTop: '8px' }}
              />
            </div>}
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog >
  );
}

export default TicketsUserEdit;
