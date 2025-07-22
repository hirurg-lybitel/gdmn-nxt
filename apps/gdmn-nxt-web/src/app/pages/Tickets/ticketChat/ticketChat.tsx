import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { Avatar, Button, CardContent, Chip, Dialog, Divider, IconButton, InputAdornment, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetTicketByIdQuery } from '../../../features/tickets/ticketsApi';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UserState } from '../../../features/user/userSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import UserTooltip from '@gdmn-nxt/components/userTooltip/user-tooltip';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

interface ITicketChatProps {

}

interface IFIle {
  file: File;
  size: number;
  name: string;
}

interface IUser {
  message: string,
  user: {
    type: 'empl' | 'user',
    name: string,
    phone: string,
    email: string,
    avatar: string;
  },
  files?: IFIle[];
}

const maxFileSize = 4 * 1024 * 1024; // 4MB
const maxFilesCount = 10;

const FilesView = ({ files, onDelete }: { files: IFIle[], onDelete?: (index: number) => void; }) => {
  const theme = useTheme();

  type FileGroup = {
    type: 'image' | 'file';
    files: IFIle[];
  };
  const sortedFiles = (() => {
    const result: FileGroup[] = [];
    let currentGroup: FileGroup | null = null;

    for (const file of files) {
      const fileType = file.file.type.startsWith('image/') ? 'image' : 'file';

      if (!currentGroup || currentGroup.type !== fileType) {
        currentGroup = { type: fileType, files: [file] };
        result.push(currentGroup);
      } else {
        currentGroup.files.push(file);
      }
    }

    return result;
  })();
  return sortedFiles.map(({ files, type }, index) => {
    const [columns, style] = (() => {
      const count = files.length;
      if (count === 1) return ['1fr', (reverseIndex: number) => ({ height: '250px' })];
      return ['1fr 1fr', (reverseIndex: number) => ((count % 2 !== 0 && reverseIndex === 1) ? { height: '250px', gridColumn: '1 / -1' } : { height: '150px' })];
    })();

    if (type === 'image') {
      return (
        <div
          key={index}
          style={{
            display: 'grid',
            gridTemplateColumns: columns,
            gap: '4px'
          }}
        >
          {files.map((file, index2) => {
            const url = URL.createObjectURL(file.file);
            return (
              <div key={index + index2} style={{ background: 'white', ...style(files.length - index2) }}>
                <div
                  style={{
                    backgroundImage: `url(${url})`, display: 'flex', justifyContent: 'flex-end', height: '100%', width: '100%',
                    backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'
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
              {file.name}
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
  });
};

export default function TicketChat(props: ITicketChatProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data } = useGetTicketByIdQuery(id ?? '');

  const [shiftHold, setShiftHold] = useState(false);
  const user = useSelector<RootState, UserState>(state => state.user);

  const [messages, setMessages] = useState<IUser[]>([
    {
      message: 'У меня проблема в gedemin',
      user: {
        type: 'user',
        name: user.userProfile?.fullName ?? '',
        phone: '+ 375 29 222 2222',
        email: user.userProfile?.email ?? '',
        avatar: 'https://www.svgrepo.com/show/192247/man-user.svg'
      }
    },
    {
      message: 'Здравствуйте, Пожалуйста, опишите подробнее вашу проблему',
      user: {
        type: 'empl',
        name: 'Сотрудник GS',
        phone: '+375 29 111 1111',
        email: 'GS.gmail.com',
        avatar: 'https://www.svgrepo.com/show/52560/telemarketer.svg'
      }
    }
  ]);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<IFIle[]>([]);

  const handleSend = useCallback(() => {
    if (message.trim() === '' && files.length === 0) return;
    setMessages([...messages, {
      message,
      user: {
        type: 'user',
        name: user.userProfile?.fullName ?? '',
        phone: '',
        email: user.userProfile?.email ?? '',
        avatar: 'https://www.svgrepo.com/show/192247/man-user.svg'
      },
      files
    }]);
    setMessage('');
    setFiles([]);
  }, [files, message, messages, user.userProfile?.email, user.userProfile?.fullName]);

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && !shiftHold) {
        setShiftHold(true);
      }
      if (e.key === 'Enter' && !shiftHold) {
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
    fileInputRef.current.value = '';
    if (!file || file.size > maxFileSize) return;

    const data = { file: file, size: file.size, name: file.name };
    setFiles([...files, data]);
  };

  const handleRemoveFile = useCallback((index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  }, [files]);

  const memoFiles = useMemo(() => <FilesView files={files} onDelete={handleRemoveFile} />, [files, handleRemoveFile]);

  const fileFialog = useMemo(() => {
    return (
      <Dialog open={files.length > 0}>
        <div style={{ padding: '16px', paddingTop: '8px', minWidth: '400px', maxHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6">
            Отправка файлов
          </Typography>
          <div
            style={{
              flexGrow: 1, overflowY: 'auto',
              margin: '16px 0px', display: 'flex', flexDirection: 'column', gap: '8px'
            }}
          >
            {memoFiles}
          </div>
          <div>
            <TextField
              variant="standard"
              label="Сообщение"
              fullWidth
              multiline
              maxRows={6}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '16px', paddingTop: '16px' }}>
            <Button
              style={{ height: '100%' }}
              disabled={files.length === maxFilesCount}
              onClick={uploadClick}
            >
              Добаить
            </Button>
            <div style={{ flex: 1 }} />
            <Button style={{ height: '100%' }} onClick={() => setFiles([])}>
              Отмена
            </Button>
            <Button variant="contained" onClick={handleSend}>
              Отправить
            </Button>
          </div>
        </div>
      </Dialog >
    );
  }, [files.length, memoFiles, handleSend]);

  return (
    <>
      {fileFialog}
      <CustomizedCard style={{ width: '100%' }}>
        <div style={{ display: 'flex', padding: '8px 10px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Tooltip title={'Назад'}>
              <IconButton color="primary" onClick={() => navigate(-1)}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Typography style={{ fontSize: '16px', fontWeight: '600' }}>
              {data?.title}
            </Typography>
            <Typography variant="caption">
              {data?.ID}
            </Typography>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flex: 1 }} >
            <Tooltip title={'Запросить звонок'}>
              <IconButton color="primary">
                <LocalPhoneIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <Divider />
        <CardContent style={{ padding: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <div style={{ flex: 1, padding: '16px', overflow: 'auto', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '16px', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '16px', height: 'max-content' }}>
                {messages.map((data, index) => <UserMessage {...data} key={index} />)}
              </div>
            </div>
            <Divider />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
              <div>
                <input
                  style={{ display: 'none' }}
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUpload}
                />
                <Tooltip title={'Прикрепить файл'}>
                  <IconButton color="primary" onClick={uploadClick}>
                    <AttachFileIcon />
                  </IconButton>
                </Tooltip>
              </div>
              <TextField
                value={files.length > 0 ? '' : message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
                maxRows={6}
                fullWidth
              />
              <Tooltip title={'Отправить'}>
                <IconButton
                  color="primary"
                  disabled={!message}
                  onClick={handleSend}
                >
                  <SendIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </CustomizedCard >
    </>
  );
};

interface IUserMessage extends IUser {
}

const UserMessage = ({ user, files, message }: IUserMessage) => {
  const senderMessage = user.type === 'user';

  const avatar = (
    <UserTooltip
      name={user.name}
      phone={user.phone}
      email={user.email}
      avatar={user.avatar}
    >
      <Avatar src={user.avatar} style={{ height: '30px', width: '30px', zIndex: 2 }} />
    </UserTooltip>
  );

  const theme = useTheme();

  const memoFiles = useMemo(() => files && <FilesView files={files} />, [files]);

  return (
    <div
      style={{
        display: 'flex', position: 'relative', alignItems: 'end',
        justifyContent: senderMessage ? 'flex-start' : 'flex-end'
      }}
    >
      {senderMessage && avatar}
      <div
        style={{
          background: 'var(--color-card-bg)', borderRadius: '14px',
          zIndex: 1, maxWidth: '45%', minWidth: '300px', overflow: 'hidden',
          ...(senderMessage ? { borderEndStartRadius: 0, marginLeft: '10px' } : { borderEndEndRadius: 0, marginRight: '10px' })
        }}
      >
        <div style={{ background: 'var(--color-card-bg)' }}>
          {memoFiles}
        </div>
        {message && <div style={{ padding: '5px 10px' }}>
          {message}
        </div>}
      </div>
      {!senderMessage && avatar}
      {message && <>
        <div
          style={{
            height: '20px', width: '20px', position: 'absolute',
            background: theme.palette.background.paper, zIndex: 1, borderRadius: '100%', bottom: '0px',
            ...(senderMessage ? { left: '20px' } : { right: '20px' })
          }}
        />
        <div
          style={{
            background: 'var(--color-card-bg)', position: 'absolute', height: '10px', bottom: '0', width: '30px',
            ...(senderMessage ? { left: '32px' } : { right: '32px' })
          }}
        />
      </>}
    </div>
  );
};
