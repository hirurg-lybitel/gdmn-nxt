import { IconButton, InputAdornment, Skeleton, TextField, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { useSnackbar } from '@gdmn-nxt/helpers/hooks/useSnackbar';

interface IUserINfoProps {
  isLoading?: boolean;
  passwordChanged?: boolean;
  userNotFound?: boolean;
  userName?: string;
  password?: string;
}

export default function UserInfo({ isLoading = false, passwordChanged = false, userNotFound = false, password, userName }: IUserINfoProps) {
  const { addSnackbar } = useSnackbar();

  const handleCopy = useCallback((value?: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value)
      .then(() => addSnackbar('Скопировано!', { variant: 'success' }))
      .catch(err => console.error('Ошибка копирования:', err));
  }, [addSnackbar]);

  const content = useMemo(() => {
    if (isLoading) {
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
    if (passwordChanged || userNotFound) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: '0.4', flex: 1, paddingBottom: '10px' }}>
          <Typography variant="h6">
            {userNotFound ? 'Пользователь не найден' : 'Пользователь сменил пароль'}
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
          value={userName}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleCopy(userName)}
                  edge="end"
                  sx={{
                    opacity: 0.7,
                    '&:hover': { opacity: 1 }
                  }}
                >
                  <ContentCopyOutlinedIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          label="Одноразовый пароль"
          type="text"
          disabled
          value={password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleCopy(password)}
                  edge="end"
                  sx={{
                    opacity: 0.7,
                    '&:hover': { opacity: 1 }
                  }}
                >
                  <ContentCopyOutlinedIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </>
    );
  }, [handleCopy, isLoading, password, passwordChanged, userName, userNotFound]);


  return (
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
  );
}
