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

type Step = 'ENTER_TAXID' | 'CHECK_TAXID' | 'INVALID_TAXID' | 'INVALID_DB' | 'ENTER_PROFILE';

export function CreateCustomerAccount({ onCancel }: CreateCustomerAccountProps) {

  const [taxId, setTaxId] = useState<string>('');
  const [step, setStep] = useState<Step>('ENTER_TAXID');
  const { data, isFetching } = useGetContactByTaxIdQuery(step === 'CHECK_TAXID' ? { taxId } : skipToken);

  useEffect( () => {
    if (step === 'CHECK_TAXID' && !isFetching && data) {
      if (data.queries.contacts.length === 1) {
        setStep('ENTER_PROFILE');
      } else if (data.queries.contacts.length > 1) {
        setStep('INVALID_DB');
      } else {
        setStep('INVALID_TAXID');
      }
    }
  }, [step, isFetching]);

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
              disabled={isFetching}
              autoFocus
              onChange={ e => setTaxId( (!e.target.value || !isNaN(parseInt(e.target.value))) ? e.target.value : taxId) }
            />
            <Button
              variant="contained"
              disabled={isFetching || isNaN(parseInt(taxId))}
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
        : step === 'INVALID_DB' ?
          <>
            <Typography variant='h1'>
              {`В базе данных найдено несколько предприятий с УНП ${taxId}!`}
            </Typography>
            <Button
              variant="contained"
              onClick = { onCancel }
            >
              Вернуться в начало
            </Button>
          </>
        :
          <>
            <Typography variant='h1'>
              {`Предприятие ${data?.queries.contacts[0].name}`}
            </Typography>
            <Button
              variant="contained"
              onClick = { onCancel }
            >
              Вернуться в начало
            </Button>
          </>
      }
      <div>
        <h1>Welcome to CreateCustomerAccount!</h1>
        <div>
          {step}
        </div>
        <div>
          isFetching {isFetching ? 't' : 'f'}
        </div>
        <div>
          data: {JSON.stringify(data, undefined, 2)}
        </div>
      </div>
    </Stack>
  );
}

export default CreateCustomerAccount;
