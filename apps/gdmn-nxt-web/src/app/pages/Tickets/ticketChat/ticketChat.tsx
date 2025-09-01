import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { Autocomplete, Avatar, Box, Button, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Skeleton, TextField, Theme, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { ticketsApi, useAddTicketMessageMutation, useDeleteTicketMessageMutation, useGetAllTicketHistoryQuery, useGetAllTicketMessagesQuery, useGetAllTicketsStatesQuery, useGetAllTicketUserQuery, useGetTicketByIdQuery, useUpdateTicketMessageMutation, useUpdateTicketMutation } from '../../../features/tickets/ticketsApi';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import UserTooltip from '@gdmn-nxt/components/userTooltip/user-tooltip';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { ICRMTicketUser, ITicketHistory, ITicketMessage, ITicketMessageFile, ITicketState, IUserProfile, ticketStateCodes, UserType } from '@gsbelarus/util-api-types';
import Confirmation from '@gdmn-nxt/helpers/confirmation';
import { makeStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from '@gdmn-nxt/helpers/hooks/useSnackbar';
import { useGetUsersQuery } from '../../../features/systemUsers';
import { customerApi } from '../../../features/customer/customerApi_new';
import ReactMarkdown from 'react-markdown';
import { useImageDialog } from '@gdmn-nxt/helpers/hooks/useImageDialog';
import MarkdownTextfield from '@gdmn-nxt/components/Styled/markdown-text-field/markdown-text-field';
import { formatFullDateDate, timeAgo } from '@gsbelarus/util-useful';
import Dropzone from '@gdmn-nxt/components/dropzone/dropzone';
import PhoneDialog from './phoneDialog';
import { profileSettingsApi, useGetProfileSettingsQuery, useSetProfileSettingsMutation } from '../../../features/profileSettings';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import ItemButtonSave from '@gdmn-nxt/components/customButtons/item-button-save/item-button-save';
import ItemButtonCancel from '@gdmn-nxt/components/customButtons/item-button-cancel/item-button-cancel';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import useConfirmation from '@gdmn-nxt/helpers/hooks/useConfirmation';
import { useFormik } from 'formik';
import TicketHistory from './ticketHistory';
import { Timeline } from '@mui/lab';

interface ITicketChatProps {

}

const maxFileSize = 5000000;
const maxFilesCount = 10;

const FilesView = ({ files, onDelete, maxWidth = 400 }: { files: ITicketMessageFile[], onDelete?: (index: number) => void, maxWidth?: number; }) => {
  const theme = useTheme();

  const handleDelete = (index: number) => (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete && onDelete(index);
  };

  const { imageDialog, openMany } = useImageDialog();

  type IFile = ITicketMessageFile & {
    index: number;
  };

  const [imageFiles, binaryFiles] = (() => {
    const images: IFile[] = [];
    const binary: IFile[] = [];
    files.forEach((file, index) => {
      if (file.content.startsWith('data:image')) {
        images.push({ ...file, index });
      } else {
        binary.push({ ...file, index });
      }
    });
    return [images, binary];
  })();

  const images = useMemo(() => imageFiles.map(file => file.content), [imageFiles]);

  return (
    <>
      {imageDialog}
      {imageFiles.length > 0 && <div style={{ width: '100%', background: 'rgb(0 0 0 / 10%)', overflow: 'hidden', borderRadius: 'var(--border-radius)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '4px',
            maxWidth: `${maxWidth * imageFiles.length}px`
          }}
        >
          {imageFiles.map((file, index) => {
            return (
              <div key={file.index} style={{ background: 'white', height: '200px', minWidth: '200px', flex: 1, maxWidth: `${maxWidth}px` }}>
                <div
                  onClick={() => openMany(images, index)}
                  style={{
                    backgroundImage: `url(${file.content})`, display: 'flex', justifyContent: 'flex-end',
                    backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                    height: '100%', width: '100%', cursor: 'pointer'
                  }}
                >
                  <div >
                    <div style={{ background: 'rgb(0 0 0 / 40%)' }}>
                      {onDelete && <IconButton color="secondary" onClick={handleDelete(file.index)}>
                        <DeleteIcon />
                      </IconButton>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>}
      {binaryFiles.map((file) => {
        return (
          <a
            key={file.index}
            href={file.content}
            download={file.fileName}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '20px 7px 7px 20px',
                '&:hover': {
                  background: 'rgb(0 0 0 / 10%)'
                },
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  background: theme.palette.primary.main, borderRadius: '100%', height: '40px',
                  width: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}
              >
                <InsertDriveFileIcon />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography>
                  {file.fileName}
                </Typography>
                <Typography variant="caption">
                  {(file.size / 1024 / 1024).toFixed(1)} МБ
                </Typography>
              </div>
              <div style={{ flex: 1 }} />
              {onDelete && <div style={{ paddingRight: '5px' }}>
                <IconButton color="error" onClick={handleDelete(file.index)}>
                  <DeleteIcon />
                </IconButton>
              </div>}
            </Box>
          </a>
        );
      })}
    </>);
};

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: 'inherit',
    textDecoration: 'none',
    textWrap: 'nowrap',
    '&:hover': {
      color: theme.palette.primary.main,
      textDecoration: 'underline'
    }
  },
}));

type messagesAndHistory = {
  content: ITicketMessage;
  type: string;
  date: Date;
} | {
  content: ITicketHistory;
  type: string;
  date: Date;
};

export default function TicketChat(props: ITicketChatProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: messages = [], isFetching: messagesIsFetching, isLoading: messagesIsLoading } = useGetAllTicketMessagesQuery({ id });
  const { data: states, isFetching: statesIsFetching, isLoading: statesIsLoading } = useGetAllTicketsStatesQuery();
  const { data: ticket, isFetching: ticketIsFetching, isLoading: ticketIsLoading } = useGetTicketByIdQuery(id ?? '');
  const { data: ticketHistory = [], isFetching: historyIsFetching, isLoading: historyIsLoading } = useGetAllTicketHistoryQuery({ id });

  const messagesAndHistory: messagesAndHistory[] = useMemo(() => {
    return [...messages, ...ticketHistory].map((item) => {
      if ('sendAt' in item) {
        return {
          content: item,
          type: 'message',
          date: item.sendAt
        };
      }
      return {
        content: item,
        type: 'history',
        date: item.changeAt
      };
    }).sort((a, b) => {
      const nameA = new Date(a.date);
      const nameB = new Date(b.date);
      return new Date(nameA) < new Date(nameB) ? -1 : 1;
    });
  }, [messages, ticketHistory]);

  const confirmed = useMemo(() => ticket?.state.code === ticketStateCodes.confirmed, [ticket?.state.code]);

  const [addMessages] = useAddTicketMessageMutation();
  const [updateTicket] = useUpdateTicketMutation();

  const isLoading = messagesIsLoading || statesIsLoading || ticketIsLoading || historyIsLoading;

  const ticketsUser = useSelector<RootState, boolean>(state => state.user.userProfile?.type === UserType.Tickets);

  const stateChange = useMemo(() => {
    if (!ticket?.state.code) return;
    if (ticket.state.code === ticketStateCodes.needInfo && ticketsUser) {
      return states?.find(state => state.code === ticketStateCodes.inProgress);
    }
    if (ticket?.state.code < ticketStateCodes.inProgress && !!ticketsUser) {
      return states?.find(state => state.code === ticketStateCodes.inProgress);
    }
    return;
  }, [states, ticket?.state.code, ticketsUser]);

  const [shiftHold, setShiftHold] = useState(false);

  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<ITicketMessageFile[]>([]);
  const dispatch = useDispatch();

  const handleSend = useCallback(() => {
    if ((message.trim() === '' && files.length === 0) || !id) return;
    const sendMessage = async () => {
      await addMessages({
        ticketKey: Number(id),
        body: message,
        state: stateChange,
        sendAt: new Date(),
        files: files
      });
      dispatch(ticketsApi.util.invalidateTags(['tickets']));
    };
    sendMessage();
    setMessage('');
    setFiles([]);
  }, [addMessages, dispatch, files, id, message, stateChange]);

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && !shiftHold) {
        setShiftHold(true);
      }
      if (e.key === 'Enter' && shiftHold) {
        handleSend();
        e.preventDefault();
      }
    };

    const keyup = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftHold(false);
      }
    };

    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
    };
  }, [handleSend, shiftHold]);

  const fileInputRef = useRef<any>(null);

  const uploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || file.size > maxFileSize) return;

    fileInputRef.current.value = '';

    const reader = new FileReader();
    const attachment: ITicketMessageFile = await new Promise((resolve, reject) => {
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

    setFiles([attachment]);
  };

  const { addSnackbar } = useSnackbar();

  const handleRequestCall = useCallback(async () => {
    const res = await updateTicket({ ...ticket, needCall: true });
    if ('data' in res) addSnackbar('Запрос на звонок был олтправлен.', { variant: 'success' });
  }, [addSnackbar, ticket, updateTicket]);

  const handleEndCall = useCallback(() => {
    updateTicket({ ...ticket, needCall: false });
  }, [ticket, updateTicket]);

  const classes = useStyles();

  const attachmentsChange = useCallback(async (newFiles: File[]) => {
    const promises = newFiles.map(file => {
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
    setFiles(attachments as ITicketMessageFile[]);
  }, []);

  const initialAttachments = useMemo(() => {
    return files.reduce((res, { fileName, content }) => {
      if (!content) {
        return res;
      }

      const arr = content.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1];

      const binarystr = window.atob(arr[1]);
      let n = binarystr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = binarystr.charCodeAt(n);
      };

      const file = new File([u8arr], fileName, { type: mime });
      return [...res, file];
    }, [] as File[]);
  }, [files]);

  const fileDialog = useMemo(() => {
    return (
      <Dialog
        fullWidth
        maxWidth={false}
        open={files.length > 0}
        sx={{
          '& .MuiPaper-root': {
            height: '100%'
          }
        }}
      >
        <DialogTitle>Отправка файлов</DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <div
              style={{
                overflowY: 'auto', maxHeight: '250px', height: 'fit-content',
                margin: '16px 0px', display: 'flex', flexDirection: 'column', gap: '8px'
              }}
            >
              <Dropzone
                maxFileSize={maxFileSize}
                maxTotalFilesSize={maxFileSize}
                showPreviews
                heightFitContent
                disableSnackBar
                initialFiles={initialAttachments}
                onChange={attachmentsChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <MarkdownTextfield
                disabled={isLoading}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullHeight
                rows={1}
              />
            </div>
          </div>
        </DialogContent>
        <Divider />
        <DialogActions style={{ padding: '12px 24px' }}>
          <div style={{ flex: 1 }} />
          <Button sx={{ width: '120px', textDecoration: 'none' }} onClick={() => setFiles([])}>
            Отмена
          </Button>
          <Button
            sx={{ width: '120px', textDecoration: 'none' }}
            variant="contained"
            onClick={handleSend}
          >
            Отправить
          </Button>
        </DialogActions>
      </Dialog >
    );
  }, [files.length, initialAttachments, attachmentsChange, isLoading, message, handleSend]);

  const fakeMessages: messagesAndHistory[] = Array.from({ length: 4 }, (_, index) => {
    return {
      content: {
        ID: -1,
        body: 'Загрузка данных',
        ticketKey: -1,
        user: {
          ID: -1,
          type: index % 2 === 0 ? 'user' : 'empl',
          fullName: '',
        },
        state: {
          ID: -1,
          name: '',
          code: 0
        },
        sendAt: new Date()
      },
      type: 'message',
      date: new Date()
    };
  });

  const back = useCallback(() => {
    const url = ticketsUser ? '/tickets/list' : '/employee/tickets/list';
    navigate(url);
  }, [navigate, ticketsUser]);

  const userProfile = useSelector<RootState, IUserProfile | undefined>(state => state.user.userProfile);
  const { data: settings, isFetching: profileIsFetching } = useGetProfileSettingsQuery(userProfile?.id ?? -1);
  const [setSettings, { isLoading: updateProfileIsLoading }] = useSetProfileSettingsMutation();

  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);

  const [confirmDialog] = useConfirmation();

  const confirmTicket = useCallback(() => {
    confirmDialog.setOpen(false);
    updateTicket({ ...ticket, state: states?.find(state => state.code === ticketStateCodes.confirmed) });
  }, [confirmDialog, states, ticket, updateTicket]);

  const cancelConfrimTicket = useCallback(() => {
    confirmDialog.setOpen(false);
    updateTicket({ ...ticket, state: states?.find(state => state.code === ticketStateCodes.inProgress) });
  }, [confirmDialog, states, ticket, updateTicket]);

  const handleOpenPhoneDialog = useCallback(() => {
    setPhoneDialogOpen(true);
  }, []);

  const handleClosePhoneDialog = useCallback(() => {
    setPhoneDialogOpen(false);
  }, []);

  const handleSavePhone = useCallback(async (value: string) => {
    setPhoneDialogOpen(false);
    if (!settings || !userProfile?.id) return;
    await setSettings({ userId: userProfile?.id, body: { ...settings, PHONE: value } });
    dispatch(ticketsApi.util.invalidateTags(['users']));
    dispatch(profileSettingsApi.util.invalidateTags(['settings']));
  }, [dispatch, setSettings, settings, userProfile?.id]);

  const memoPhoneDialog = useMemo(() => (
    <PhoneDialog
      open={phoneDialogOpen}
      onClose={handleClosePhoneDialog}
      onSubmit={handleSavePhone}
    />
  ), [handleClosePhoneDialog, handleSavePhone, phoneDialogOpen]);

  const isAdmin = useSelector<RootState, boolean>(state => state.user.userProfile?.isAdmin ?? false);

  const { data: systemUsers, isLoading: systemUsersIsLoading, isFetching: systemUsersIsFetching } = useGetUsersQuery();
  const { data: users, isFetching: usersIsFetching, isLoading: usersIsLoading } = useGetAllTicketUserQuery(undefined, { skip: ticketsUser && !isAdmin });

  const rightButton = useMemo(() => {
    if (confirmed || ticket?.sender.ID !== userProfile?.id) return;
    if (ticketsUser) {
      const currentUser = users?.users.find((user) => user.ID === userProfile?.id);
      return (
        <Tooltip title={isLoading ? '' : ticket?.needCall ? 'Запрошен звонок' : ''}>
          <div>
            <Button
              variant="contained"
              onClick={currentUser?.phone ? handleRequestCall : handleOpenPhoneDialog}
              disabled={isLoading || ticket?.needCall || !currentUser || updateProfileIsLoading || profileIsFetching}
              color="primary"
            >
              Запросить звонок
            </Button>
          </div>
        </Tooltip>
      );
    }
    return;
  }, [confirmed, handleOpenPhoneDialog, handleRequestCall, isLoading, profileIsFetching, ticket?.needCall, ticket?.sender.ID, ticketsUser, updateProfileIsLoading, userProfile?.id, users?.users]);

  const handleUpdateStatus = useCallback(async (value: ITicketState | null) => {
    if (!value) return;

    await updateTicket({ ...ticket, state: value, closeAt: value.code === 0 ? new Date() : undefined });
    dispatch(customerApi.util.invalidateTags(['Customers']));
  }, [dispatch, ticket, updateTicket]);

  const memoPerformer = useMemo(() => {
    if (ticketsUser || confirmed) {
      return (
        <TextField
          variant="standard"
          value={ticket?.performer?.fullName ?? ''}
          label={'Исполнитель'}
          InputProps={{
            readOnly: true,
          }}
        />
      );
    }
    return (
      <Autocomplete
        fullWidth
        size="small"
        readOnly={confirmed}
        disabled={systemUsersIsLoading || systemUsersIsFetching || ticketIsFetching || ticketIsFetching}
        loading={systemUsersIsLoading || systemUsersIsFetching || ticketIsFetching || ticketIsFetching}
        loadingText="Загрузка данных..."
        options={systemUsers ?? []}
        value={systemUsers?.find(user => user.ID === ticket?.performer?.ID) ?? null}
        getOptionLabel={(option) => option?.CONTACT?.NAME ?? option.NAME}
        onChange={(e, value) => {
          updateTicket({ ...ticket, performer: value ? { ...value, fullName: '' } as ICRMTicketUser : undefined });
        }}
        renderInput={(params) => (
          <TextField
            variant="standard"
            {...params}
            label={'Исполнитель'}
          />
        )}
      />
    );
  }, [systemUsers, systemUsersIsFetching, systemUsersIsLoading, ticket, ticketIsFetching, ticketsUser, updateTicket]);

  const memoStatus = useMemo(() => {
    const changeables = [
      ticketStateCodes.done,
      ticketStateCodes.inProgress,
      ticketStateCodes.needInfo
    ];
    if (ticketsUser || confirmed) {
      return (
        <TextField
          variant="standard"
          value={ticket?.state.name ?? ''}
          label={'Статус'}
          InputProps={{
            readOnly: true,
          }}
        />
      );
    }
    return (
      <Autocomplete
        fullWidth
        size="small"
        disabled={statesIsFetching || statesIsLoading || ticketIsFetching || ticketIsFetching || !ticket?.performer?.ID}
        loading={statesIsFetching || statesIsLoading || ticketIsFetching || ticketIsFetching}
        loadingText="Загрузка данных..."
        options={states ?? []}
        value={states?.find((state) => state.ID === ticket?.state.ID) ?? null}
        getOptionLabel={(option) => option.name}
        onChange={(e, value) => handleUpdateStatus(value)}
        sx={{
          '& .MuiAutocomplete-clearIndicator': {
            display: 'none'
          },
        }}
        renderInput={(params) => (
          <TextField
            variant="standard"
            {...params}
            label={'Статус'}
          />
        )}
        renderOption={(props, option) => {
          if (!changeables.includes(option.code)) return;
          return (
            <li {...props} key={option.ID}>
              {option.name}
            </li>
          );
        }}
      />
    );
  }, [handleUpdateStatus, states, statesIsFetching, statesIsLoading, ticket?.performer?.ID, ticket?.state.ID, ticket?.state.name, ticketIsFetching, ticketsUser]);

  const memoCustomer = useMemo(() => {
    if (ticketsUser) return;
    return (
      <TextField
        variant="standard"
        disabled={ticketIsFetching || ticketIsFetching}
        value={ticket?.company.FULLNAME ?? ticket?.company.NAME ?? ''}
        label={'Клиент'}
        InputProps={{
          readOnly: true,
        }}
      />
    );
  }, [ticket?.company.FULLNAME, ticket?.company.NAME, ticketIsFetching, ticketsUser]);

  const memoUser = useMemo(() => {
    if (ticketsUser && !isAdmin) return;
    return (
      <TextField
        disabled={ticketIsFetching || ticketIsFetching}
        variant="standard"
        value={ticket?.sender.fullName ?? ''}
        label={'Постановщик'}
        InputProps={{
          readOnly: true,
        }}
      />
    );
  }, [isAdmin, ticket?.sender.fullName, ticketIsFetching, ticketsUser]);

  const [enableTransition, setEnableTransition] = useState(true);
  const [expand, setExpand] = useState(true);

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      {fileDialog}
      {confirmDialog.dialog}
      {memoPhoneDialog}
      <CustomizedCard style={{ width: '100%' }}>
        <div style={{ display: 'flex', padding: '8px 10px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Tooltip title={'Назад'}>
              <IconButton color="primary" onClick={back}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '41px' }}>
            <Typography style={{ fontSize: '16px', fontWeight: '600' }}>
              {isLoading ? <Skeleton width={200} height={21} /> : ticket?.title}
            </Typography>
            <Typography variant="caption">
              {isLoading ? <Skeleton width={80} /> : ticket?.ID}
            </Typography>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flex: 1 }} >
            {rightButton}
          </div>
        </div>
        <Divider />
        <CardContent style={{ padding: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {(ticket?.needCall && !ticketsUser && !confirmed) && (
              <div
                style={{
                  background: 'var(--color-card-bg)', width: '100%',
                  padding: '5px', display: 'flex', borderBottom: '1px solid var(--color-paper-bg)'
                }}
              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <span>Представитель клиента запросил звонок{ticket?.sender.phone ? ', вы можете позвонить ему по номеру:' : ''}</span>
                  <a className={classes.link} href={`tel:${ticket?.sender.phone}`}>{ticket?.sender.phone}</a>
                </div>
                <Confirmation
                  key="delete"
                  title="Звонок завершен"
                  text={'Пометить что звонок был завершен?'}
                  dangerous
                  onConfirm={handleEndCall}
                >
                  <IconButton>
                    <CloseIcon color="action" fontSize="small" />
                  </IconButton>
                </Confirmation>
              </div>
            )}
            {
              (ticket?.state.code === ticketStateCodes.done && ticketsUser && !ticketIsLoading &&
                !ticketIsFetching && !statesIsFetching && !statesIsLoading) && (
                <div
                  style={{
                    background: 'var(--color-card-bg)', width: '100%',
                    padding: '5px 16px', display: 'flex', borderBottom: '1px solid var(--color-paper-bg)'
                  }}
                >
                  <div
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: matchDownSm ? '8px' : '16px', flexDirection: matchDownSm ? 'column' : 'row'
                    }}
                  >
                    <span>Удовлетворены ли вы ответом специалиста технической поддержки?</span>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <Button onClick={cancelConfrimTicket} variant={'outlined'}>Нет</Button>
                      <Button onClick={confirmTicket} variant={'contained'}>Да</Button>
                    </div>
                  </div>
                </div>
              )}
            <div style={{ flex: 1, padding: '16px', position: 'relative', overflow: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '16px', height: 'max-content', position: 'absolute', inset: '16px' }}>
                {(isLoading ? fakeMessages : messagesAndHistory).map((item, index) => {
                  if (item.type === 'message') {
                    return <UserMessage
                      indent={index !== 0 && messagesAndHistory[index - 1]?.type !== 'history'}
                      isLoading={isLoading}
                      message={item.content as ITicketMessage}
                      key={index}
                    />;
                  }
                  return <TicketHistory
                    key={index}
                    ticketId={ticket?.ID}
                    history={item.content as ITicketHistory}
                  />;
                })}
              </div>
            </div>
            {!confirmed && <>
              <Divider style={{ borderTop: '2px solid var(--color-paper-bg)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', flexDirection: 'column', paddingTop: 0, position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-30px', right: '8px', zIndex: 4 }}>
                  <IconButton onClick={() => setExpand(!expand)}>
                    {expand ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
                  </IconButton>
                </div>
                <MarkdownTextfield
                  onFocus={() => setEnableTransition(false)}
                  onBlur={() => setEnableTransition(true)}
                  placeholder="Сообщение"
                  disabled={isLoading}
                  value={files.length > 0 ? '' : message}
                  onChange={(e) => setMessage(e.target.value)}
                  onLoadFiles={attachmentsChange}
                  rows={expand ? undefined : 1}
                  sx={{
                    '& .MuiInputBase-input': {
                      transition: enableTransition ? '0.3s' : undefined
                    }
                  }}
                  smallHintBreakpoint="lg"
                  minRows={expand ? 8 : undefined}
                  maxRows={expand ? 20 : undefined}
                  fileUpload
                  maxFileSize={maxFileSize}
                  maxTotalFilesSize={maxFileSize}
                />

                <div style={{ display: 'flex', width: '100%' }}>
                  <div>
                    <input
                      style={{ display: 'none' }}
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUpload}
                    />
                    <Tooltip title={'Прикрепить файл'}>
                      <IconButton
                        color="primary"
                        onClick={uploadClick}
                      >
                        <AttachFileIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <div style={{ flex: 1 }} />
                  <Button
                    style={{ width: '120px', textTransform: 'none' }}
                    color="primary"
                    variant="contained"
                    disabled={!message || isLoading || files.length > 0}
                    onClick={handleSend}
                  >
                    Отправить
                  </Button>
                </div>
              </div>
            </>
            }
          </div>
        </CardContent>
      </CustomizedCard >
      <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '16px' }}>
        {memoPerformer}
        {memoStatus}
        {memoCustomer}
        {memoUser}
      </div>
    </>
  );
};

interface IUserMessage {
  isLoading: boolean;
  message: ITicketMessage;
  indent: boolean;
}

const UserMessage = ({ isLoading: isLoadingProp, message, indent }: IUserMessage) => {
  const [updateMessage, { isLoading: updateIsLoading }] = useUpdateTicketMessageMutation();
  const [deleteMessage, { isLoading: deleteIsLoading }] = useDeleteTicketMessageMutation();

  const isLoading = isLoadingProp;

  const avatar = useMemo(() => {
    if (isLoading) {
      return (
        <Skeleton
          height={30}
          width={30}
          variant="circular"
          style={{ zIndex: 2 }}
        />
      );
    }
    return (
      <UserTooltip
        name={message.user.fullName}
        phone={message.user.phone}
        email={message.user.email}
        avatar={message.user.avatar}
      >
        <Avatar src={message.user.avatar} style={{ height: '30px', width: '30px', zIndex: 2 }} />
      </UserTooltip>
    );
  }, [isLoading, message.user.avatar, message.user.email, message.user.fullName, message.user.phone]);

  const [confirmDialog] = useConfirmation();

  const [editMode, setEditMode] = useState(false);

  const formik = useFormik<ITicketMessage>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...message
    },
    onSubmit: (values, { resetForm }) => {
      resetForm();
      onClose();
      updateMessage(values);
    },
  });

  const handleEditClick = () => {
    setEditMode(true);
  };

  const onClose = () => {
    setEditMode(false);
    formik.resetForm();
  };

  const handleCancelClick = () => {
    if (formik.dirty) {
      confirmDialog.setOpen(true);
      confirmDialog.setOptions({
        title: 'Внимание',
        text: 'Изменения будут утеряны. Продолжить?',
        dangerous: true,
        confirmClick: () => {
          confirmDialog.setOpen(false);
          onClose();
        },
      });
      return;
    }

    onClose();
  };

  const memoFiles = useMemo(() => {
    if (!formik.values.files || formik.values.files?.length <= 0) return;
    return <FilesView
      files={formik.values.files}
      onDelete={editMode ? (deleteFileIndex) => {
        console.log(deleteFileIndex);
        const newFiles = formik.values.files?.filter((file, index) => index !== deleteFileIndex);
        formik.setFieldValue('files', newFiles);
      } : undefined}
    />;
  }, [editMode, formik]);

  const onDelete = (messageId: number) => {
    deleteMessage(messageId);
  };

  const handleChangeMessage = (e: any) => {
    formik.setFieldValue('body', e.target.value);
  };

  const userId = useSelector<RootState, number | undefined>(state => state.user.userProfile?.id);

  return (
    <div
      style={{
        display: 'flex', position: 'relative', alignItems: 'start',
        justifyContent: 'flex-start', marginTop: indent ? '10px' : 0
      }}
    >
      {confirmDialog.dialog}
      {avatar}
      <div
        style={{
          background: 'var(--color-card-bg)', borderRadius: 'var(--border-radius)',
          zIndex: 1, width: '100%', overflow: 'hidden',
          marginLeft: '10px'
        }}
      >
        <div style={{ display: 'flex', padding: '5px 10px', gap: '16px', alignItems: 'center' }}>
          <></>
          <Typography variant="body2">{isLoading ? '' : message.user.fullName}</Typography>
          <Typography variant={'caption'}>
            {(message.sendAt && !isLoading) && <Tooltip arrow title={formatFullDateDate(message.sendAt)}>
              <div>
                {timeAgo(message.sendAt)}
              </div>
            </Tooltip>}
          </Typography>
          <div style={{ flex: 1 }} />
          {(message.user.ID === userId && !isLoading) && <MenuBurger
            disabled={updateIsLoading || deleteIsLoading}
            items={({ closeMenu }) => [
              editMode ? (
                <ItemButtonSave
                  key="save"
                  size={'small'}
                  label="Сохранить"
                  onClick={(e) => {
                    formik.handleSubmit();
                    closeMenu();
                  }}
                />)
                : <></>,
              editMode
                ? (
                  <ItemButtonCancel
                    key="cancel"
                    label={'Отменить'}
                    onClick={(e) => {
                      handleCancelClick();
                      closeMenu();
                    }}
                  />)
                : <></>,
              !editMode
                ? (
                  <ItemButtonEdit
                    key="edit"
                    size={'small'}
                    label="Редактировать"
                    onClick={(e) => {
                      handleEditClick();
                      closeMenu();
                    }}
                  />)
                : <></>,
              <Confirmation
                key="delete"
                title="Удалить сообщение?"
                text={'Его невозможно будет восстановить'}
                dangerous
                onConfirm={() => {
                  closeMenu();
                  onDelete(message.ID);
                }}
                onClose={closeMenu}
              >
                <ItemButtonDelete
                  label="Удалить"
                  confirmation={false}
                />
              </Confirmation>,
            ]}
          />}
        </div>
        {!isLoading && <Divider />}
        {(!isLoading && memoFiles) && (
          <div
            style={{
              display: 'flex', gap: '8px', background: 'var(--color-card-bg)', flexDirection: 'column', margin: '8px',
              borderRadius: 'var(--border-radius)', overflow: 'hidden'
            }}
          >
            {memoFiles}
          </div>
        )}
        {editMode ? (
          <MarkdownTextfield
            value={formik.values.body}
            onChange={handleChangeMessage}
            minRows={3}
          />
        ) : message && <div style={{ padding: '5px 10px' }}>
          <Box
            sx={{
              opacity: isLoading ? 0 : 1, wordBreak: 'break-word',
              '& > :first-of-type': {
                marginTop: 0
              },
              '& > :last-of-type': {
                marginBottom: 0
              }
            }}
          >
            <ReactMarkdown>
              {message.body}
            </ReactMarkdown>
          </Box>
        </div>}
      </div>
    </div >
  );
};
