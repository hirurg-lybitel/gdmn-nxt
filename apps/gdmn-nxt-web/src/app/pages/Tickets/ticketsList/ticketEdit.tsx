import { Stack, TextField } from '@mui/material';
import { useCallback, useEffect, } from 'react';
import { ITicket } from '@gsbelarus/util-api-types';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import { RootState } from '@gdmn-nxt/store';
import { useSelector } from 'react-redux';
import { UserState } from 'apps/gdmn-nxt-web/src/app/features/user/userSlice';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';
import Dropzone from '@gdmn-nxt/components/dropzone/dropzone';
import { useGetAllTicketsStatesQuery } from '../../../features/tickets/ticketsApi';

export interface ITicketEditProps {
  open: boolean;
  ticket?: ITicket;
  onSubmit: (ticket: ITicket, isDelete: boolean) => void;
  onCancelClick: () => void;
};

const maxFileSize = 4 * 1024 * 1024; // 4MB
const maxFilesCount = 10;

export function TicketEdit(props: Readonly<ITicketEditProps>) {
  const { open, ticket } = props;
  const { onSubmit, onCancelClick } = props;
  const user = useSelector<RootState, UserState>(state => state.user);
  const { data: states } = useGetAllTicketsStatesQuery();
  const defaultState = states?.find(state => state.code === 1);

  const initValue: ITicket = {
    ID: ticket?.ID ?? -1,
    title: ticket?.title ?? '',
    companyKey: ticket?.companyKey ?? user.userProfile?.companyKey ?? -1,
    openAt: ticket?.openAt ? new Date(ticket?.openAt) : new Date(),
    state: {
      ID: ticket?.state?.ID ?? defaultState?.ID ?? -1,
      name: ticket?.state?.name ?? defaultState?.name ?? '',
      code: ticket?.state?.code ?? defaultState?.code ?? 0
    },
    sender: {
      id: ticket?.sender?.id ?? user.userProfile?.id ?? -1,
      fullName: ticket?.sender?.fullName ?? user.userProfile?.fullName ?? ''
    },
    message: '',
    files: []
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

  const attachmentsChange = useCallback(async (files: File[]) => {
    const promises = files.map(file => {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.readAsDataURL(file);
        reader.onerror = () => {
          reader.abort();
          reject(new DOMException('Problem parsing input file.'));
        };
        reader.onloadend = (e) => {
          const stringFile = reader.result?.toString() ?? '';
          resolve({
            fileName: file.name,
            content: stringFile
          });
        };
      });
    });

    const attachments = await Promise.all(promises);
    if (JSON.stringify(formik.values.files) === JSON.stringify(attachments)) {
      return;
    }
    formik.setFieldValue('files', attachments);
  }, [formik]);

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
            <Dropzone
              maxFileSize={maxFileSize}
              filesLimit={maxFilesCount}
              showPreviews
              onChange={attachmentsChange}
            />
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}

export default TicketEdit;
