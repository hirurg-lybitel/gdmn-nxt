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
      setError(response.message ?? '');
    }
  };

  const handleCodeInputSubmit = (res: string) => {
    handleSubmit();
  };

  return (
    <Stack spacing={2} textAlign="center">
      <Box textAlign="center">
        <Typography variant="h6">Двухфакторная аутентификация (2FA)</Typography>
      </Box>
      <Typography variant="body1">Откройте приложение двухфакторной проверки на своём мобильном устройстве, чтобы получить код подтверждения.</Typography>
      <VerifyCode
        ref={codeRef}
        onSubmit={handleCodeInputSubmit}
        autoFocus
      />
      <Stack spacing={1}>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? 'Проверяем...' : 'Продолжить'}
        </Button>
        <Button variant="outlined" onClick={onCancel}>Отмена</Button>
      </Stack>
      <Dialog
        open={!!error}
        onClose={() => setError('')}
        PaperProps={{
          style: {
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
