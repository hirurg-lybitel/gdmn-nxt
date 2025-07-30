import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { Autocomplete, Avatar, Box, Button, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Skeleton, TextField, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import { useNavigate, useParams } from 'react-router-dom';
import { useAddTicketMessageMutation, useGetAllTicketMessagesQuery, useGetAllTicketsStatesQuery, useGetAllTicketUserQuery, useGetTicketByIdQuery, useUpdateTicketMutation } from '../../../features/tickets/ticketsApi';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import UserTooltip from '@gdmn-nxt/components/userTooltip/user-tooltip';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { ICRMTicketUser, ITicketMessage, ITicketMessageFile, ITicketState, UserType } from '@gsbelarus/util-api-types';
import Confirmation from '@gdmn-nxt/helpers/confirmation';
import { makeStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from '@gdmn-nxt/helpers/hooks/useSnackbar';
import { useGetUsersQuery } from '../../../features/systemUsers';
import { useGetCustomersQuery, customerApi } from '../../../features/customer/customerApi_new';
import ReactMarkdown from 'react-markdown';
import { useImageDialog } from '@gdmn-nxt/helpers/hooks/useImageDialog';
import MarkdownTextfield from '@gdmn-nxt/components/Styled/markdown-text-field/markdown-text-field';

interface ITicketChatProps {

}

const maxFileSize = 4 * 1024 * 1024; // 4MB
const maxFilesCount = 10;

const FilesView = ({ files, onDelete, maxWidth = 400 }: { files: ITicketMessageFile[], onDelete?: (index: number) => void, maxWidth?: number; }) => {
  const theme = useTheme();

  const { imageDialog, openImage } = useImageDialog();

  type FileGroup = {
    type: 'image' | 'file';
    files: ITicketMessageFile[];
  };
  const sortedFiles = (() => {
    const result: FileGroup[] = [];
    let currentGroup: FileGroup | null = null;

    for (const file of files) {
      const fileType = file.content.startsWith('data:image') ? 'image' : 'file';

      if (!currentGroup || currentGroup.type !== fileType) {
        currentGroup = { type: fileType, files: [file] };
        result.push(currentGroup);
      } else {
        currentGroup.files.push(file);
      }
    }

    return result;
  })();
  return (
    <>
      {imageDialog}
      {sortedFiles.map(({ files, type }, index) => {
        if (type === 'image') {
          return (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '4px',
                maxWidth: `${maxWidth * files.length}px`
              }}
            >
              {files.map((file, index2) => {
                return (
                  <div key={index + index2} style={{ background: 'white', height: '200px', minWidth: '200px', flex: 1, maxWidth: `${maxWidth}px` }}>
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
                          {onDelete && <IconButton color="secondary" onClick={() => onDelete(index + index2)}>
                            <DeleteIcon />
                          </IconButton>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div >
          );
        }
        return files.map((file, index2) => {
          return (
            <div key={index + index2} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              {onDelete && <div>
                <IconButton color="error" onClick={() => onDelete(index + index2)}>
                  <DeleteIcon />
                </IconButton>
              </div>}
            </div>
          );
        });
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

  const handleSend = useCallback(() => {
    if ((message.trim() === '' && files.length === 0) || !id) return;
    addMessages({
      ticketKey: Number(id),
      body: message,
      state: stateChange,
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

  const handleRemoveFile = useCallback((index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  }, [files]);

  const memoFiles = useMemo(() => <FilesView files={files} onDelete={handleRemoveFile} />, [files, handleRemoveFile]);

  const { addSnackbar } = useSnackbar();

  const handleRequestCall = useCallback(async () => {
    const res = await updateTicket({ ...ticket, needCall: true });
    if ('data' in res) addSnackbar('Запрос на звонок был олтправлен.', { variant: 'success' });
  }, [addSnackbar, ticket, updateTicket]);

  const handleEndCall = useCallback(() => {
    updateTicket({ ...ticket, needCall: false });
  }, [ticket, updateTicket]);

  const classes = useStyles();

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
          <div style={{ padding: '16px', paddingTop: '8px', minWidth: '400px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div
              style={{
                overflowY: 'auto', maxHeight: '40%', height: 'fit-content',
                margin: '16px 0px', display: 'flex', flexDirection: 'column', gap: '8px',

              }}
            >
              {memoFiles}
            </div>
            <div style={{ flex: 1 }}>
              <MarkdownTextfield
                disabled={isLoading}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullHeight
              />
            </div>
          </div>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            style={{ height: '100%' }}
            disabled={files.length === maxFilesCount}
            onClick={uploadClick}
          >
            Добавить
          </Button>
          <div style={{ flex: 1 }} />
          <Button style={{ height: '100%' }} onClick={() => setFiles([])}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleSend}>
            Отправить
          </Button>
        </DialogActions>

      </Dialog >
    );
  }, [files.length, memoFiles, isLoading, message, handleSend]);

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
      }
    };
  });

  const back = useCallback(() => {
    const url = ticketsUser ? '/tickets/list' : '/employee/tickets/list';
    navigate(url);
  }, [navigate, ticketsUser]);

  const rightButton = useMemo(() => {
    if (closed) return;
    if (ticketsUser) {
      return (
        <Tooltip title={isLoading ? '' : ticket?.needCall ? 'Запрошен звонок' : 'Запросить звонок'}>
          <div>
            <IconButton
              onClick={handleRequestCall}
              disabled={isLoading || ticket?.needCall}
              color="primary"
            >
              <LocalPhoneIcon />
            </IconButton>
          </div>
        </Tooltip>
      );
    }
    return;
  }, [closed, handleRequestCall, isLoading, ticket?.needCall, ticketsUser]);

  const isAdmin = useSelector<RootState, boolean>(state => state.user.userProfile?.isAdmin ?? false);

  const { data: systemUsers, isLoading: systemUsersIsLoading, isFetching: systemUsersIsFetching } = useGetUsersQuery();
  const { data: customersResponse, isLoading: customersIsLoading, isFetching: customersIsFetching } = useGetCustomersQuery({ filter: { ticketSystem: true } }, { skip: ticketsUser });
  const { data: users, isFetching: usersIsFetching, isLoading: usersIsLoading } = useGetAllTicketUserQuery(undefined, { skip: ticketsUser && !isAdmin });

  const [tabIndex, setTabIndex] = useState('1');

  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const dispatch = useDispatch();

  const handleUpdateStatus = useCallback(async (value: ITicketState | null) => {
    if (!value) return;

    await updateTicket({ ...ticket, state: value, closeAt: value.code === 0 ? new Date() : undefined });
    dispatch(customerApi.util.invalidateTags(['Customers']));
  }, [dispatch, ticket, updateTicket]);

  return (
    <>
      {fileFialog}
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
            {(ticket?.needCall && !ticketsUser && !closed) && <div style={{ background: 'var(--color-card-bg)', width: '100%', padding: '5px', display: 'flex' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', }}>
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
            </div>}
            <div style={{ flex: 1, padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '16px', height: 'max-content' }}>
                {(isLoading ? fakeMessages : messages).map((data, index) => <UserMessage
                  isLoading={isLoading}
                  {...data}
                  key={index}
                />)}
              </div>
            </div>
            {!closed && <>
              <Divider />
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', flexDirection: 'column', paddingTop: 0 }}>
                <MarkdownTextfield
                  disabled={isLoading}
                  value={files.length > 0 ? '' : message}
                  onChange={(e) => setMessage(e.target.value)}
                  minRows={8}
                  maxRows={20}
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
                    disabled={!message || isLoading}
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
        <Autocomplete
          fullWidth
          readOnly={ticketsUser}
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
        <Autocomplete
          fullWidth
          readOnly={ticketsUser}
          size="small"
          disabled={statesIsFetching || statesIsLoading || ticketIsFetching || ticketIsFetching}
          loading={statesIsFetching || statesIsLoading || ticketIsFetching || ticketIsFetching}
          loadingText="Загрузка данных..."
          options={states ?? []}
          value={ticket?.state ?? null}
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
        {!ticketsUser && <Autocomplete
          fullWidth
          readOnly
          size="small"
          disabled={customersIsFetching || customersIsLoading || ticketIsFetching || ticketIsFetching}
          loading={customersIsFetching || customersIsLoading || ticketIsFetching || ticketIsFetching}
          loadingText="Загрузка данных..."
          options={customersResponse?.data ?? []}
          value={ticket?.company ?? null}
          getOptionLabel={(option) => option?.FULLNAME ?? option?.NAME}
          renderInput={(params) => (
            <TextField
              variant="standard"
              {...params}
              label={'Клиент'}
            />
          )}
        />}
        {(!ticketsUser || isAdmin) && <Autocomplete
          fullWidth
          readOnly
          size="small"
          disabled={usersIsLoading || usersIsFetching || ticketIsFetching || ticketIsFetching}
          loading={usersIsLoading || usersIsFetching || ticketIsFetching || ticketIsFetching}
          loadingText="Загрузка данных..."
          options={users?.users ?? []}
          value={users?.users?.find(user => user.ID === ticket?.sender.ID) ?? null}
          getOptionLabel={(option) => option.fullName}
          renderInput={(params) => (
            <TextField
              variant="standard"
              {...params}
              label={'Постановщик'}
            />
          )}
        />}
      </div>
    </>
  );
};

interface IUserMessage extends ITicketMessage {
  isLoading: boolean;
}

const UserMessage = ({ isLoading, user, body: message, files }: IUserMessage) => {
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

  const theme = useTheme();

  const memoFiles = useMemo(() => files && <FilesView files={files} />, [files]);

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
          background: 'var(--color-card-bg)', borderRadius: '14px',
          zIndex: 1, width: '100%', overflow: 'hidden',
          marginLeft: '10px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', background: 'var(--color-card-bg)', flexDirection: 'column', margin: '8px', borderRadius: '14px', overflow: 'hidden' }}>
          {memoFiles}
        </div>
        {message && <div style={{ padding: '5px 10px' }}>
          <div style={{ opacity: isLoading ? 0 : 1, wordBreak: 'break-word' }}>
            <ReactMarkdown>
              {message}
            </ReactMarkdown>
          </div>
        </div>}
      </div>
    </div>
  );
};
