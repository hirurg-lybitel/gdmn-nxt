import styles from './tickects-customer-add.module.less';
import {
  Autocomplete,
  TextField,
  Typography
} from '@mui/material';
import { ICustomer, ICustomerTickets } from '@gsbelarus/util-api-types';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import { generatePassword } from '@gsbelarus/util-useful';
import { useGetUsersQuery } from 'apps/gdmn-nxt-web/src/app/features/systemUsers';
import { emailValidation } from '@gdmn-nxt/helpers/validators';

export interface TicketsCustomerAddProps {
  open: boolean;
  onSubmit: (values: ICustomerTickets) => void;
  onCancel: () => void;
}

export function TicketsCustomerAdd({
  open,
  onCancel,
  onSubmit
}: Readonly<TicketsCustomerAddProps>) {
  const userPermissions = usePermissions();

  const formik = useFormik<ICustomerTickets>({
    validateOnBlur: false,
    initialValues: {
      email: '',
      admin: {
        name: '',
        fullName: '',
        password: '',
      }
    },
    validationSchema: yup.object().shape({
      customer: yup.object().required(),
      email: emailValidation().required(),
      admin: yup.object().shape({
        name: yup.string().required(),
        fullName: yup.string().required(),
        password: yup.string().required(),
      })
        .required(),
    }),
    onSubmit: (values) => {
      formik.resetForm();
      onSubmit(values);
    },
  });

  const handleCustomerChange = (customer?: ICustomer | null) => {
    if (!customer) return;
    formik.setFieldValue('customer', customer);
    formik.setFieldValue('email', customer.EMAIL ?? '');
    formik.setFieldValue('admin', {
      name: `Admin-${customer.ID}`,
      fullName: `Администратор ${customer.NAME}`,
      password: generatePassword(12)
    });
  };

  const handleCancel = () => {
    onCancel();
    formik.resetForm();
  };

  const { data: systemUsers, isLoading: systemUsersIsLoading, isFetching: systemUsersIsFetching } = useGetUsersQuery();

  return (
    <EditDialog
      open={open}
      onClose={handleCancel}
      form={'ticketsCustomerAddForm'}
      title={'Добавление клиента'}
      confirmation={formik.dirty}
      submitButtonDisabled={!userPermissions?.customers?.PUT}
    >
      <FormikProvider value={formik}>
        <Form
          id="ticketsCustomerAddForm"
          onSubmit={formik.handleSubmit}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Autocomplete
              fullWidth
              loading={systemUsersIsLoading || systemUsersIsFetching}
              loadingText="Загрузка данных..."
              options={systemUsers ?? []}
              value={formik.values.performer ?? null}
              getOptionLabel={(option) => option.FULLNAME ?? option.NAME}
              onChange={(e, value) => {
                formik.setFieldValue('performer', value ?? null);
              }}
              renderInput={(params) => (
                <div>
                  <TextField
                    {...params}
                    label={'Исполнитель'}
                  />
                </div>
              )}
            />
            <CustomerSelect
              required
              disableClear
              value={formik.values.customer ?? null}
              onChange={handleCustomerChange}
              ticketSystem={false}
            />
            {formik.values.customer && <>
              <TextField
                required
                label="Email"
                type="text"
                name="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                error={getIn(formik.touched, 'email') && getIn(formik.errors, 'email')}
                helperText={getIn(formik.touched, 'email') && getIn(formik.errors, 'email')}
              />
              <div
                style={{
                  display: 'flex', gap: '16px', border: '1px solid var(--color-borders)',
                  padding: '16px', position: 'relative', borderRadius: 'var(--border-radius)',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'absolute', top: '-14px', left: '10px', background: 'var(--color-paper-bg)', padding: '0px 5px' }}>
                  <Typography variant="caption">
                    Данные для входа
                  </Typography>
                </div>
                <TextField
                  fullWidth
                  label="Логин"
                  type="text"
                  disabled
                  value={formik.values.admin?.name}
                />
                <TextField
                  fullWidth
                  label="Одноразовый пароль"
                  type="text"
                  disabled
                  value={formik.values.admin?.password}
                />
              </div>
            </>}
          </div>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}

export default TicketsCustomerAdd;
