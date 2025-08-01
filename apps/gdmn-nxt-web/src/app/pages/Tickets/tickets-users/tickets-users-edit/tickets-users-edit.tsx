import styles from './tickets-users-edit.module.less';
import { ITicketUser } from '@gsbelarus/util-api-types';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';
import { Form, FormikProvider, useFormik } from 'formik';
import { emailValidation, passwordValidation } from '@gdmn-nxt/helpers/validators';
import TelephoneInput, { validatePhoneNumber } from '@gdmn-nxt/components/telephone-input';
import * as yup from 'yup';
import { Chip, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { MouseEvent, useMemo, useState } from 'react';
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
  onSubmit: (values: ITicketUser, isDelete: boolean) => Promise<{ data: ITicketUserRequestResult; } | { error: FetchBaseQueryError | SerializedError; }>;
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
  const initValue: ITicketUser = useMemo(() => ({
    ID: -1,
    company: user?.company ?? {
      ID: -1,
      NAME: ''
    },
    fullName: '',
    password: generatePassword(10),
    userName: '',
    email: '',
    phone: '',
  }), [user?.company, open]);

  const formik = useFormik<ITicketUser>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...user,
      ...initValue
    },
    validationSchema: yup.object().shape({
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
      if ('data' in result) {
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

  return (
    <EditDialog
      open={open}
      onClose={handleCancel}
      form={'ticketsUserAddForm'}
      title={'Добавление ответственного'}
      confirmation={formik.dirty}
      submitButtonDisabled={isLoading}
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
            />
            <div>
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
            </div>
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog >
  );
}

export default TicketsUserEdit;
