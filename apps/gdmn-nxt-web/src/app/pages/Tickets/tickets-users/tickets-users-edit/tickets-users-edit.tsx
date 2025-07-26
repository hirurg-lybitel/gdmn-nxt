import styles from './tickets-users-edit.module.less';
import { ITicketUser } from '@gsbelarus/util-api-types';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';
import { Form, FormikProvider, useFormik } from 'formik';
import { emailValidation, passwordValidation } from '@gdmn-nxt/helpers/validators';
import TelephoneInput, { validatePhoneNumber } from '@gdmn-nxt/components/telephone-input';
import * as yup from 'yup';
import { Chip, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import VisibilityOnIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';
import { generatePassword } from '@gsbelarus/util-useful';

export interface CustomerEditProps {
  open: boolean;
  user: ITicketUser | null;
  onSubmit: (values: ITicketUser, isDelete: boolean) => void;
  onCancel: () => void;
}

export function TicketsUserEdit({
  open,
  user,
  onSubmit,
  onCancel
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
        .max(80, 'Слишком длинный логин'),
      fullName: yup
        .string()
        .required('')
        .max(80, 'Слишком длинный логин'),
      password: passwordValidation(),
      email: emailValidation().required(''),
      phone: yup
        .string()
        .test('',
          ({ value }) => validatePhoneNumber(value) ?? '',
          (value = '') => !validatePhoneNumber(value))
    }),
    onSubmit: (values) => {
      onSubmit(values, false);
      formik.resetForm();
    },
  });

  const handleCancel = () => {
    onCancel();
    formik.resetForm();
  };

  const [showPassword, setShowPassword] = useState(true);

  const handlePhoneChange = (value: string) => {
    formik.setFieldValue('phone', value);
  };

  return (
    <EditDialog
      open={open}
      onClose={handleCancel}
      form={'ticketsUserAddForm'}
      title={'Добавление ответсвенного'}
      confirmation={formik.dirty}
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
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  // InputProps={{
                  //   endAdornment: (
                  //     <InputAdornment position="end">
                  //       <IconButton
                  //         onClick={() => setShowPassword(!showPassword)}
                  //         edge="end"
                  //         sx={{
                  //           opacity: 0.7,
                  //           '&:hover': { opacity: 1 }
                  //         }}
                  //       >
                  //         {showPassword ? <VisibilityOnIcon /> : <VisibilityOffIcon />}
                  //       </IconButton>
                  //     </InputAdornment>
                  //   ),
                  // }}
                  error={!!formik.errors.password}
                  helperText={formik.errors.password}
                />
              </div>
              <Chip
                icon={<InfoIcon />}
                label={'После создания, изменение и просмотр данных буду недоступны'}
                variant="outlined"
                className={styles.info}
                style={{ border: 'none', cursor: 'pointer' }}
              />
            </div>
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog >
  );
}

export default TicketsUserEdit;
