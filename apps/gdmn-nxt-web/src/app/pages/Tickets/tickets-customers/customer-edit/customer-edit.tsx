import styles from './customer-edit.module.less';
import { Skeleton, TextField, Typography } from '@mui/material';
import { ICustomer } from '@gsbelarus/util-api-types';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';
import { useGetAllTicketUserQuery } from 'apps/gdmn-nxt-web/src/app/features/tickets/ticketsApi';
import { useMemo } from 'react';

export interface CustomerEditProps {
  open: boolean;
  customer: ICustomer | null;
  onCancel: () => void;
}

export function CustomerEdit({
  open,
  customer,
  onCancel,
}: Readonly<CustomerEditProps>) {
  const { data, isLoading, isFetching } = useGetAllTicketUserQuery({ filter: { isAdmin: true, companyKey: customer?.ID } }, { skip: !customer });

  const content = useMemo(() => {
    if (isLoading || isFetching) {
      return (
        <>
          <Skeleton
            variant="rectangular"
            height={40}
            width={'100%'}
            style={{ borderRadius: 'var(--border-radius)' }}
          />
          <Skeleton
            variant="rectangular"
            height={40}
            width={'100%'}
            style={{ borderRadius: 'var(--border-radius)' }}
          />
        </>
      );
    }
    if (data?.length === 0 || !data?.[0].password) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: '0.4', flex: 1, paddingBottom: '10px' }}>
          <Typography variant="h6">
            {data?.length === 0 ? 'Пользователь не найден' : 'Пользователь сменил пароль'}
          </Typography>
        </div>
      );
    }
    return (
      <>
        <TextField
          fullWidth
          label="Логин"
          type="text"
          disabled
          value={data?.[0]?.userName ?? ''}
        />
        <TextField
          fullWidth
          label="Одноразовый пароль"
          type="text"
          disabled
          value={data?.[0]?.password ?? ''}
        />
      </>
    );
  }, [data, isFetching, isLoading]);

  return (
    <EditDialog
      open={open}
      onClose={onCancel}
      form={'customerEditForm'}
      title={'Просмотр клиента'}
      selectDialog
    >
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
          {content}
        </div>
      </div>
    </EditDialog >
  );
}

export default CustomerEdit;
