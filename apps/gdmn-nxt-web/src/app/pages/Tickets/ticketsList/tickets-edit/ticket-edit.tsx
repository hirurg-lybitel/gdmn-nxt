import { Autocomplete, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, ListItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState, } from 'react';
import { ICRMTicketUser, ITicket, IUser, UserType } from '@gsbelarus/util-api-types';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import { RootState } from '@gdmn-nxt/store';
import { useSelector } from 'react-redux';
import { UserState } from 'apps/gdmn-nxt-web/src/app/features/user/userSlice';
import Dropzone from '@gdmn-nxt/components/dropzone/dropzone';
import styles from './tickets-edit.module.less';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import MarkdownTextfield from '@gdmn-nxt/components/Styled/markdown-text-field/markdown-text-field';
import { useGetUsersQuery } from 'apps/gdmn-nxt-web/src/app/features/systemUsers';
import { DateTimePicker } from '@mui/x-date-pickers-pro';
import { OptionsTooltip } from '@gdmn-nxt/components/Styled/options-tooltip/options-tooltip';

export interface ITicketEditProps {
  open: boolean;
  ticket?: ITicket;
  onSubmit: (ticket: ITicket, isDelete: boolean) => Promise<void>;
  onCancelClick: () => void;
};

const maxFileSize = 5000000; // 5MB
const maxFilesCount = 10;

export function TicketEdit(props: Readonly<ITicketEditProps>) {
  const { open, ticket } = props;
  const { onSubmit, onCancelClick } = props;
  const user = useSelector<RootState, UserState>(state => state.user);

  const initValue: ITicket = useMemo(() => {
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    const defaultDeadline = new Date(now.getTime() + 2 * day);

    return {
      ID: ticket?.ID ?? -1,
      title: ticket?.title ?? '',
      company: ticket?.company ?? { ID: -1, NAME: '' },
      openAt: ticket?.openAt ? new Date(ticket?.openAt) : new Date(),
      state: {
        ID: ticket?.state?.ID ?? -1,
        name: ticket?.state?.name ?? '',
        code: ticket?.state?.code ?? 0
      },
      sender: {
        ID: ticket?.sender?.ID ?? user.userProfile?.id ?? -1,
        fullName: ticket?.sender?.fullName ?? user.userProfile?.fullName ?? ''
      },
      performers: ticket?.company.performer?.ID ? [{
        ID: ticket?.company.performer?.ID,
        fullName: ticket?.company.performer?.FULLNAME ?? ''
      }] : [],
      needCall: ticket?.needCall ?? false,
      message: '',
      files: [],
      labels: [],
      deadline: ticket?.deadline ?? defaultDeadline
    };
  }, [ticket?.ID, ticket?.company, ticket?.deadline, ticket?.needCall, ticket?.openAt, ticket?.sender?.ID, ticket?.sender?.fullName, ticket?.state?.ID, ticket?.state?.code, ticket?.state?.name, ticket?.title, user.userProfile?.fullName, user.userProfile?.id]);

  const formik = useFormik<ITicket>({
    enableReinitialize: true,
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
            size: file.size,
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

  const { data: systemUsersData, isLoading: systemUsersIsLoading, isFetching: systemUsersIsFetching } = useGetUsersQuery();

  const ticketsUser = useSelector<RootState, boolean>(state => state.user.userProfile?.type === UserType.Tickets);

  const systemUsers: ICRMTicketUser[] = useMemo(() => {
    if (!systemUsersData) return [];
    return systemUsersData.map((user) => ({
      ID: user.ID,
      fullName: user.CONTACT?.NAME ?? '',
      email: user.EMAIL,
      phone: user.PHONE,
      avatar: user.AVATAR,
      type: UserType.Gedemin
    }), []);
  }, [systemUsersData]);

  return (
    <Dialog
      maxWidth={false}
      fullWidth
      sx={(theme) => ({
        '& .MuiPaper-root': {
          height: '100%',
          [theme.breakpoints.down('sm')]: {
            margin: '0px !important',
            width: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: 'initial'
          },
        }
      })}
      open={open}
      onClose={handleOnClose}
    >
      <DialogTitle>Создание {ticketsUser ? 'заявки' : 'тикета'}</DialogTitle>
      <DialogContent style={{ paddingTop: '5px', marginTop: '-5px' }} >
        <FormikProvider value={formik}>
          <Form
            style={{ height: '100%', minWidth: 0 }}
            id="ticketAddForm"
            onSubmit={formik.handleSubmit}
          >
            <Stack
              direction="row"
              flexDirection={'column'}
              style={{ gap: '16px' }}
              height="100%"
            >
              <Stack sx={(theme) => ({ display: 'flex', flexDirection: ticketsUser ? { sx: 'column', md: 'row' } : { sx: 'column', lg: 'row' }, gap: '16px' })}>
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
                <Stack sx={{ display: 'flex', flexDirection: ticketsUser ? { sx: 'column', md: 'row' } : { sx: 'column', sm: 'row' }, gap: '16px', minWidth: ticketsUser ? '0px' : { xs: '100%', md: '550px' } }}>
                  {!ticketsUser && <div style={{ width: '100%', position: 'relative', height: '40px' }}>
                    <Stack sx={(theme) => ({ position: 'absolute', left: 0, right: 0, top: 0, background: theme.palette.background.paper, zIndex: 1 })}>
                      <Autocomplete
                        fullWidth
                        sx={{ width: '100%' }}
                        size="small"
                        disabled={systemUsersIsLoading || systemUsersIsFetching}
                        loadingText="Загрузка данных..."
                        options={systemUsers ?? []}
                        multiple
                        disableCloseOnSelect
                        value={formik.values.performers}
                        getOptionLabel={(option) => option.fullName}
                        onChange={(e, value) => {
                          formik.setFieldValue('performers', value);
                        }}
                        renderTags={() => [<div key={0}>
                          {(formik.values.performers && formik.values.performers.length > 0) && (
                            <OptionsTooltip
                              arrow
                              title={
                                <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                                  {formik.values.performers.map((performer, index) => {
                                    return (
                                      <Typography variant={'body1'} key={performer.ID}>
                                        {index + 1}. {performer?.fullName}
                                      </Typography>
                                    );
                                  })}
                                </div>
                              }
                            >
                              <Chip
                                style={{ cursor: 'pointer' }}
                                size="small"
                                label={formik.values.performers.length}
                              />
                            </OptionsTooltip>
                          )}
                        </div>]}
                        renderOption={(props, option, { selected }) => (
                          <ListItem
                            {...props}
                            key={option.ID}
                            disablePadding
                            sx={{
                              display: 'flex',
                              gap: '8px',
                              py: '2px !important',
                              '&:hover .action': {
                                display: 'inline-flex !important',
                                opacity: '1 !important',
                                visibility: 'visible !important',
                              }
                            }}
                          >
                            <div style={{ width: '100%', display: 'flex', alignItems: 'center', minWidth: 0 }}>
                              <Checkbox
                                style={{ marginRight: 8 }}
                                checked={selected}
                              />
                              {option?.fullName}
                            </div>
                          </ListItem>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder={'Исполнители'}
                            label={'Исполнители'}
                          />
                        )}
                      />
                    </Stack>
                  </div>
                  }
                  <DateTimePicker
                    label="Срок выполнения"
                    minDate={new Date()}
                    sx={{ minWidth: '200px' }}
                    value={formik.values.deadline}
                    onChange={(value) => formik.setFieldValue('deadline', value)}
                  />
                </Stack>
              </Stack>
              <MarkdownTextfield
                name="message"
                placeholder="Сообщение"
                sx={{ minHeight: '200px' }}
                required
                value={formik.values.message}
                onChange={formik.handleChange}
                error={getIn(formik.touched, 'message') && Boolean(getIn(formik.errors, 'message'))}
                helperText={getIn(formik.touched, 'message') && getIn(formik.errors, 'message')}
                fullHeight
                rows={1}
              />
              <div style={{ maxHeight: '250px' }}>
                <Dropzone
                  disableSnackBar
                  heightFitContent
                  maxFileSize={maxFileSize}
                  maxTotalFilesSize={maxFileSize}
                  showPreviews
                  onChange={attachmentsChange}
                />
              </div>
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <Divider />
      <DialogActions style={{ padding: '12px 24px' }}>
        <div >
          <ButtonWithConfirmation
            className={styles.button}
            variant="outlined"
            onClick={handleOnClose}
            title={'Внимание'}
            text={'Изменения будут утеряны. Продолжить?'}
            confirmation={formik.dirty}
          >
            Отменить
          </ButtonWithConfirmation>
        </div>
        <div >
          <Button
            className={styles.button}
            type="submit"
            form={'ticketAddForm'}
            variant="contained"
          >
            Сохранить
          </Button>
        </div>
      </DialogActions>
    </Dialog >
  );
}

export default TicketEdit;
