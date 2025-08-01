import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { Autocomplete, Avatar, Box, Button, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Skeleton, TextField, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { ticketsApi, useAddTicketMessageMutation, useGetAllTicketMessagesQuery, useGetAllTicketsStatesQuery, useGetAllTicketUserQuery, useGetTicketByIdQuery, useUpdateTicketMutation } from '../../../features/tickets/ticketsApi';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import UserTooltip from '@gdmn-nxt/components/userTooltip/user-tooltip';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { ICRMTicketUser, ITicketMessage, ITicketMessageFile, ITicketState, IUserProfile, UserType } from '@gsbelarus/util-api-types';
import Confirmation from '@gdmn-nxt/helpers/confirmation';
import { makeStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from '@gdmn-nxt/helpers/hooks/useSnackbar';
import { useGetUsersQuery } from '../../../features/systemUsers';
import { useGetCustomersQuery, customerApi } from '../../../features/customer/customerApi_new';
import ReactMarkdown from 'react-markdown';
import { useImageDialog } from '@gdmn-nxt/helpers/hooks/useImageDialog';
import MarkdownTextfield from '@gdmn-nxt/components/Styled/markdown-text-field/markdown-text-field';
import { formatFullDateDate, timeAgo } from '@gsbelarus/util-useful';
import Dropzone from '@gdmn-nxt/components/dropzone/dropzone';
import PhoneDialog from './phoneDialog';
import { profileSettingsApi, useGetProfileSettingsQuery, useSetProfileSettingsMutation } from '../../../features/profileSettings';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';

interface ITicketChatProps {

}

const maxFileSize = 5000000;
const maxFilesCount = 10;

const FilesView = ({ files, onDelete, maxWidth = 400 }: { files: ITicketMessageFile[], onDelete?: (index: number) => void, maxWidth?: number; }) => {
  const theme = useTheme();

  const handleDelete = (index: number) => (e: MouseEvent) => {
    e.stopPropagation();
    onDelete && onDelete(index);
  };

  const { imageDialog, openImage } = useImageDialog();

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
          {imageFiles.map((file) => {
            return (
              <div key={file.index} style={{ background: 'white', height: '200px', minWidth: '200px', flex: 1, maxWidth: `${maxWidth}px` }}>
                <div
                  onClick={() => openImage(file.content)}
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

export default function TicketChat(props: ITicketChatProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: messages = [], isFetching: messagesIsFetching, isLoading: messagesIsLoading } = useGetAllTicketMessagesQuery({ id });
  const { data: states, isFetching: statesIsFetching, isLoading: statesIsLoading } = useGetAllTicketsStatesQuery();
  const { data: ticket, isFetching: ticketIsFetching, isLoading: ticketIsLoading } = useGetTicketByIdQuery(id ?? '');

  const closed = useMemo(() => !!ticket?.closeAt, [ticket?.closeAt]);

  const [addMessages] = useAddTicketMessageMutation();
  const [updateTicket] = useUpdateTicketMutation();

  const isLoading = messagesIsLoading || statesIsLoading || ticketIsLoading;

  const ticketsUser = useSelector<RootState, boolean>(state => state.user.userProfile?.type === UserType.Tickets);

  const stateChange = useMemo(() => states?.find(state => state.code === (ticketsUser ? -1 : 2)), [states, ticketsUser]);

  const [shiftHold, setShiftHold] = useState(false);

  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<ITicketMessageFile[]>([]);
  const dispatch = useDispatch();

  const handleSend = useCallback(() => {
    if ((message.trim() === '' && files.length === 0) || !id) return;
    addMessages({
      ticketKey: Number(id),
      body: message,
      state: stateChange,
      sendAt: new Date(),
      files: files
    });
    setMessage('');
    setFiles([]);
  }, [addMessages, files, id, message, stateChange]);

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

    setFiles([...files, attachment]);
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
    if (JSON.stringify(files) === JSON.stringify(attachments)) {
      return;
    }
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

  const fileFialog = useMemo(() => {
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
        <DialogTitle>
          <Typography variant="h6">
            Отправка файлов
          </Typography>
        </DialogTitle>
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
                filesLimit={maxFilesCount}
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

  const fakeMessages: ITicketMessage[] = Array.from({ length: 4 }, (_, index) => {
    return {
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
  const { data: customersResponse, isLoading: customersIsLoading, isFetching: customersIsFetching } = useGetCustomersQuery({ filter: { ticketSystem: true } }, { skip: ticketsUser });
  const { data: users, isFetching: usersIsFetching, isLoading: usersIsLoading } = useGetAllTicketUserQuery(undefined, { skip: ticketsUser && !isAdmin });

  const rightButton = useMemo(() => {
    if (closed || ticket?.sender.ID !== userProfile?.id) return;
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
  }, [closed, handleOpenPhoneDialog, handleRequestCall, isLoading, profileIsFetching, ticket?.needCall, ticket?.sender.ID, ticketsUser, updateProfileIsLoading, userProfile?.id, users?.users]);

  const handleUpdateStatus = useCallback(async (value: ITicketState | null) => {
    if (!value) return;

    await updateTicket({ ...ticket, state: value, closeAt: value.code === 0 ? new Date() : undefined });
    dispatch(customerApi.util.invalidateTags(['Customers']));
  }, [dispatch, ticket, updateTicket]);

  const memoPerformer = useMemo(() => {
    if (ticketsUser) {
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
    if (ticketsUser) {
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
        disabled={statesIsFetching || statesIsLoading || ticketIsFetching || ticketIsFetching}
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
      />
    );
  }, [handleUpdateStatus, states, statesIsFetching, statesIsLoading, ticket?.state.ID, ticket?.state.name, ticketIsFetching, ticketsUser]);

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

  return (
    <>
      {fileFialog}
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
            {(ticket?.needCall && !ticketsUser && !closed) && (
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
            <div style={{ flex: 1, padding: '16px', position: 'relative', overflow: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '16px', height: 'max-content', position: 'absolute', inset: '16px' }}>
                {(isLoading ? fakeMessages : messages).map((data, index) => <UserMessage
                  isLoading={isLoading}
                  {...data}
                  key={index}
                />)}
              </div>
            </div>
            {!closed && <>
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
                  minRows={expand ? 8 : undefined}
                  maxRows={expand ? 20 : undefined}
                  fileUpload
                  maxFileSize={maxFileSize}
                  filesLimit={maxFilesCount}
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
      <div style={{ width: '280px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: 0 }}>
        {memoPerformer}
        {memoStatus}
        {memoCustomer}
        {memoUser}
      </div>
    </>
  );
};

interface IUserMessage extends ITicketMessage {
  isLoading: boolean;
}

const UserMessage = ({ isLoading, user, body: message, sendAt, files }: IUserMessage) => {
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
        name={user.fullName}
        phone={user.phone}
        email={user.email}
        avatar={user.avatar}
      >
        <Avatar src={user.avatar} style={{ height: '30px', width: '30px', zIndex: 2 }} />
      </UserTooltip>
    );
  }, [isLoading, user.avatar, user.email, user.fullName, user.phone]);

  const memoFiles = useMemo(() => (files && files?.length > 0) && <FilesView files={files} />, [files]);

  return (
    <div
      style={{
        display: 'flex', position: 'relative', alignItems: 'start',
        justifyContent: 'flex-start',
      }}
    >
      {avatar}
      <div
        style={{
          background: 'var(--color-card-bg)', borderRadius: 'var(--border-radius)',
          zIndex: 1, width: '100%', overflow: 'hidden',
          marginLeft: '10px'
        }}
      >
        <div style={{ display: 'flex', padding: '5px 10px', gap: '16px' }}>
          <Typography variant="body2">{user.fullName}</Typography>
          <Typography variant={'caption'}>
            {(sendAt && !isLoading) && <Tooltip arrow title={formatFullDateDate(sendAt)}>
              <div>
                {timeAgo(sendAt)}
              </div>
            </Tooltip>}
          </Typography>
        </div>
        {!isLoading && <Divider />}
        {memoFiles && <div style={{ display: 'flex', gap: '8px', background: 'var(--color-card-bg)', flexDirection: 'column', margin: '8px', borderRadius: 'var(--border-radius)', overflow: 'hidden' }}>
          {memoFiles}
        </div>}
        {message && <div style={{ padding: '5px 10px' }}>
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
              {message}
            </ReactMarkdown>
          </Box>
        </div>}
      </div>
    </div >
  );
};
