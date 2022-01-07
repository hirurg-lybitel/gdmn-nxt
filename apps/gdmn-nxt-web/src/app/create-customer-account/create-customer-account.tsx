import Button from '@mui/material/Button/Button';
import Stack from '@mui/material/Stack/Stack';
import TextField from '@mui/material/TextField/TextField';
import Typography from '@mui/material/Typography/Typography';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useEffect, useState } from 'react';
import { useGetContactByTaxIdQuery } from '../features/contact/contactApi';
import './create-customer-account.module.less';

/* eslint-disable-next-line */
export interface CreateCustomerAccountProps {
  onCancel: () => void;
};

type Step = 'ENTER_TAXID' | 'CHECK_TAXID' | 'INVALID_TAXID' | 'ENTER_PROFILE';

export function CreateCustomerAccount({ onCancel }: CreateCustomerAccountProps) {

  const [taxId, setTaxId] = useState<string>('');
  const [step, setStep] = useState<Step>('ENTER_TAXID');
  const { data, isLoading } = useGetContactByTaxIdQuery({ taxId }, { skip: step !== 'CHECK_TAXID' });

  useEffect( () => {
    if (step === 'CHECK_TAXID' && !isLoading && data) {
      if (data.queries.contacts.length) {
        setStep('ENTER_PROFILE');
      } else {
        setStep('INVALID_TAXID');
      }
    }
  }, [step, isLoading]);

  return (
    <Stack direction="column" spacing={2}>
      {
        step === 'ENTER_TAXID' || step === 'CHECK_TAXID' ?
          <>
            <Typography variant='h1'>
              Введите УНП предприятия:
            </Typography>
            <TextField
              label="УНП"
              value={taxId}
              disabled={isLoading}
              autoFocus
              onChange={ e => setTaxId(parseInt(e.target.value).toString()) }
            />
            <Button
              variant="contained"
              disabled={isLoading || isNaN(parseInt(taxId))}
              onClick = { () => setStep('CHECK_TAXID') }
            >
              Проверить
            </Button>
            <Button
              variant="contained"
              onClick = { onCancel }
            >
              Вернуться в начало
            </Button>
          </>
        : step === 'INVALID_TAXID' ?
          <>
            <Typography variant='h1'>
              {`Предприятие с УНП ${taxId} не найдено в базе данных!`}
            </Typography>
            <Button
              variant="contained"
              onClick = { () => setStep('ENTER_TAXID') }
            >
              Повторить ввод
            </Button>
            <Button
              variant="contained"
              onClick = { onCancel }
            >
              Вернуться в начало
            </Button>
          </>
        :
          undefined
      }
      <div>
        <h1>Welcome to CreateCustomerAccount!</h1>
        {
          JSON.stringify(data, undefined, 2)
        }
      </div>
    </Stack>
  );
}

export default CreateCustomerAccount;
