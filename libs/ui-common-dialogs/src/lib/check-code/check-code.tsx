import styles from './check-code.module.less';
import { Alert, Box, Button, Dialog, Stack, Typography } from '@mui/material';
import { IAuthResult } from '@gsbelarus/util-api-types';
import { useRef, useState } from 'react';
import VerifyCode, { VerifyCodeRef } from '../verify-code/verify-code';

export interface CheckCodeProps {
  onSubmit: (authCode: string) => Promise<IAuthResult>;
  onCancel: () => void;
}

export function CheckCode({ onSubmit, onCancel }: CheckCodeProps) {
  const codeRef = useRef<VerifyCodeRef>(null);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!codeRef.current) return;
    setLoading(true);
    const response = await onSubmit(
      codeRef.current.getValue()
    );
    setLoading(false);

    if (response.result === 'ERROR') {
      codeRef.current?.clear();
      setError(response.message ?? '');
    }
  };

  const handleCodeInputSubmit = (res: string) => {
    handleSubmit();
  };

  return (
    <Stack
      spacing={3}
      sx={{
        width: { xs: '100%', sm: 424 },
        padding: { xs: 2.5, sm: 4 },
        borderRadius: 2,
        boxShadow: (theme) => theme.shadows[3],
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[8]
        }
      }}
    >
      <Box textAlign="center">
        <Typography
          variant="h5"
          fontWeight={600}
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.75rem' }
          }}
        >
          Двухфакторная аутентификация
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          opacity: 0.9,
        }}
      >
        Откройте приложение двухфакторной проверки на своём мобильном устройстве, чтобы получить код подтверждения.
      </Typography>
      <VerifyCode
        ref={codeRef}
        onSubmit={handleCodeInputSubmit}
        autoFocus
      />
      <Stack spacing={1.5}>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
          sx={{
            py: 1.25,
            fontSize: '1rem',
            boxShadow: 'none',
          }}
        >
          {loading ? 'Проверяем...' : 'Продолжить'}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
        >
          Отмена
        </Button>
      </Stack>
      <Dialog
        open={!!error}
        onClose={() => setError('')}
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
          }
        }}
      >
        <Alert
          severity="error"
          sx={{ alignItems: 'center' }}
        >
          <Typography variant="subtitle1">{error}</Typography>
        </Alert>
      </Dialog>
    </Stack>
  );
}

export default CheckCode;
