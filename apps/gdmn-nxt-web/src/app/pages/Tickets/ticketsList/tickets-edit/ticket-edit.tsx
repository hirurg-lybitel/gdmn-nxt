import { Box, Chip, Divider, Stack, Tab, TextField, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useState, } from 'react';
import { ITicket } from '@gsbelarus/util-api-types';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import { RootState } from '@gdmn-nxt/store';
import { useSelector } from 'react-redux';
import { UserState } from 'apps/gdmn-nxt-web/src/app/features/user/userSlice';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';
import Dropzone from '@gdmn-nxt/components/dropzone/dropzone';
import { useGetAllTicketsStatesQuery } from '../../../../features/tickets/ticketsApi';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import styles from './tickets-edit.module.less';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import ReactMarkdown from 'react-markdown';
import InfoIcon from '@mui/icons-material/Info';

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

  const [tabIndex, setTabIndex] = useState('1');

  const initValue: ITicket = {
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
    performer: {
      ID: -1,
      fullName: ''
    },
    needCall: ticket?.needCall ?? false,
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

  const handleTabsChange = useCallback((event: any, newindex: string) => {
    setTabIndex(newindex);
  }, []);

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <EditDialog
      open={open}
      onClose={handleOnClose}
      confirmation={formik.dirty}
      title={(ticket && ticket?.ID) ? `Редактирование тикета: ${ticket.title}` : 'Создание тикета'}
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
            <TabContext value={tabIndex}>
              <Box>
                <TabList onChange={handleTabsChange}>
                  <Tab label="Изменение" value="1" />
                  <Tab label="Просмотр" value="2" />
                </TabList>
                <Divider />
              </Box>
              <TabPanel
                value="1"
                className={styles.tabPanel}
              >
                <TextField
                  className={styles.inputTextField}
                  label="Описание"
                  type="text"
                  fullWidth
                  required
                  multiline
                  rows={1}
                  name="message"
                  onChange={formik.handleChange}
                  value={formik.values.message}
                  error={getIn(formik.touched, 'message') && Boolean(getIn(formik.errors, 'message'))}
                  helperText={getIn(formik.touched, 'message') && getIn(formik.errors, 'message')}
                />

              </TabPanel>
              <TabPanel
                value="2"
                className={styles.tabPanel}
              >
                <div className={styles.preview}>
                  <CustomizedScrollBox>
                    <ReactMarkdown components={{ p: 'div' }}>
                      {formik.values.message ?? ''}
                    </ReactMarkdown>
                  </CustomizedScrollBox>
                </div>
              </TabPanel>
              <Tooltip title={matchDownSm ? 'Поддерживаются стили Markdown' : ''}>
                <a
                  href="https://www.markdownguide.org/basic-syntax/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Chip
                    icon={<InfoIcon />}
                    label={matchDownSm ? '' : 'Поддерживаются стили Markdown'}
                    variant="outlined"
                    className={styles.info}
                    style={{ border: 'none', cursor: 'pointer' }}
                  />
                </a>
              </Tooltip>
            </TabContext>
            {/* <Dropzone
              maxFileSize={maxFileSize}
              filesLimit={maxFilesCount}
              showPreviews
              onChange={attachmentsChange}
            /> */}
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}

export default TicketEdit;
