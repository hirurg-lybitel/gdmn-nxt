import { Stack, TextField, useTheme } from '@mui/material';
import { useCallback, useEffect, } from 'react';
import { ITicket, Permissions } from '@gsbelarus/util-api-types';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import { RootState } from '@gdmn-nxt/store';
import { useSelector } from 'react-redux';
import { UserState } from 'apps/gdmn-nxt-web/src/app/features/user/userSlice';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';

export interface ITicketEditProps {
  open: boolean;
  ticket?: ITicket;
  onSubmit: (ticket: ITicket, isDelete: boolean) => void;
  onCancelClick: () => void;
};

export function TicketEdit(props: Readonly<ITicketEditProps>) {
  const { open, ticket } = props;
  const { onSubmit, onCancelClick } = props;
  const user = useSelector<RootState, UserState>(state => state.user);

  const initValue: ITicket = {
    id: ticket?.id ?? -1,
    title: ticket?.title ?? '',
    companyKey: ticket?.companyKey ?? user.userProfile?.companyKey ?? -1,
    openAt: ticket?.openAt ? new Date(ticket?.openAt) : new Date(),
    state: {
      name: ticket?.state?.name ?? '',
      code: ticket?.state?.code ?? 1
    },
    sender: {
      id: ticket?.sender?.id ?? user.userProfile?.id ?? -1,
      fullName: ticket?.sender?.fullName ?? user.userProfile?.fullName ?? ''
    },
    message: ''
  };

  const formik = useFormik<ITicket>({
    enableReinitialize: false,
    validateOnBlur: false,
    initialValues: {
      ...initValue,
      ...ticket
    },
    validationSchema: yup.object().shape({
      title: yup.string().required('')
        .max(120, 'Слишком длинное наименование'),
      state: yup.object().required(''),
      message: yup.string().required()
    }),
    onSubmit: (value) => {
      onSubmit({ ...formik.values, openAt: ticket?.openAt ? new Date(ticket?.openAt) : new Date() }, false);
    }
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const handleOnClose = useCallback(() => onCancelClick(), [onCancelClick]);

  const handleDelete = useCallback(() => {
    onSubmit(formik.values, true);
  }, [formik.values, onSubmit]);

  return (
    <EditDialog
      open={open}
      onClose={handleOnClose}
      confirmation={formik.dirty}
      title={ticket ? `Редактирование тикета: ${ticket.title}` : 'Создание тикета'}
      form="mainForm"
      onDeleteClick={handleDelete}
      deleteConfirmTitle={'Удаление тикета'}
      showDeleteButtonHintAnyway
    >
      <FormikProvider value={formik}>
        <Form
          style={{ height: '100%', minWidth: 0 }}
          id="mainForm"
          onSubmit={formik.handleSubmit}
        >
          <Stack
            direction="row"
            flexDirection={'column'}
            style={{ gap: '16px' }}
            height="100%"
          >
            <TextField
              style={{ width: '100%' }}
              label="Тема"
              type="text"
              required
              autoFocus
              name="title"
              onChange={formik.handleChange}
              value={formik.values.title}
              error={getIn(formik.touched, 'title') && Boolean(getIn(formik.errors, 'title'))}
              helperText={getIn(formik.touched, 'title') && getIn(formik.errors, 'title')}
            />
            <TextField
              style={{ width: '100%' }}
              label="Сообщение"
              type="message"
              required
              multiline
              rows={12}
              name="message"
              onChange={formik.handleChange}
              value={formik.values.message}
              error={getIn(formik.touched, 'message') && Boolean(getIn(formik.errors, 'message'))}
              helperText={getIn(formik.touched, 'message') && getIn(formik.errors, 'message')}
            />
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}

export default TicketEdit;
