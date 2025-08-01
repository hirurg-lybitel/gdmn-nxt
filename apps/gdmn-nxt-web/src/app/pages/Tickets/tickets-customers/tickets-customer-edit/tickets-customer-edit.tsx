import styles from './customer-edit.module.less';
import { Autocomplete, Skeleton, TextField, Typography } from '@mui/material';
import { ICustomer, IUser } from '@gsbelarus/util-api-types';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';
import { useGetAllTicketUserQuery } from 'apps/gdmn-nxt-web/src/app/features/tickets/ticketsApi';
import { useMemo, useState } from 'react';
import { useGetUsersQuery } from 'apps/gdmn-nxt-web/src/app/features/systemUsers';
import { Form, FormikProvider, useFormik } from 'formik';
import UserInfo from '../user-info/user-Info';

export interface CustomerEditProps {
  open: boolean;
  customer: ICustomer | null;
  onCancel: () => void;
  onSubmit: (values: ICustomer, isDelete: boolean) => void;
}

export function CustomerEdit({
  open,
  customer,
  onCancel,
  onSubmit
}: Readonly<CustomerEditProps>) {
  const { data, isLoading, isFetching } = useGetAllTicketUserQuery({ filter: { isAdmin: true, companyKey: customer?.ID } }, { skip: !customer });

  const user = useMemo(() => {
    return data?.users[0];
  }, [JSON.stringify(data?.users)]);

  const formik = useFormik<ICustomer>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: customer ?? {
      ID: -1,
      NAME: ''
    },
    onSubmit: (values) => {
      formik.resetForm();
      onSubmit(values, false);
    },
  });

  const { data: systemUsers, isLoading: systemUsersIsLoading, isFetching: systemUsersIsFetching } = useGetUsersQuery();

  return (
    <EditDialog
      open={open}
      onClose={onCancel}
      form={'ticketsCustomerEditForm'}
      title={'Редактирование клиента'}
    >
      <FormikProvider value={formik}>
        <Form
          id="ticketsCustomerEditForm"
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
            <UserInfo
              isLoading={isLoading || isFetching}
              userNotFound={!user}
              passwordChanged={!user?.oneTimePassword}
              userName={user?.userName}
              password={user?.password}
            />
          </div>
        </Form>
      </FormikProvider>
    </EditDialog >
  );
}

export default CustomerEdit;
