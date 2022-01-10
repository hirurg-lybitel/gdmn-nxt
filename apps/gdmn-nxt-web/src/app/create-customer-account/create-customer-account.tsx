import { checkEmailAddress } from '@gsbelarus/util-useful';
import Button from '@mui/material/Button/Button';
import Stack from '@mui/material/Stack/Stack';
import TextField from '@mui/material/TextField/TextField';
import Typography from '@mui/material/Typography/Typography';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useEffect, useState } from 'react';
import { useAddAccountMutation, useGetAccountByEmailQuery } from '../features/account/accountApi';
import { useGetContactByTaxIdQuery } from '../features/contact/contactApi';
import './create-customer-account.module.less';

/* eslint-disable-next-line */
export interface CreateCustomerAccountProps {
  onCancel: () => void;
};

type Step = 'ENTER_TAXID'
  | 'CHECKING_TAXID'
  | 'INVALID_TAXID'
  | 'INVALID_DB'
  | 'ENTER_PROFILE'
  | 'SAVING_PROFILE'
  | 'PROFILE_CREATED'
  | 'PROFILE_ERROR';

export function CreateCustomerAccount({ onCancel }: CreateCustomerAccountProps) {

  const [taxId, setTaxId] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [email2, setEmail2] = useState<string>('');
  const [step, setStep] = useState<Step>('ENTER_TAXID');
  const { data: contactData, isFetching: isFetchingContact } = useGetContactByTaxIdQuery(step === 'CHECKING_TAXID' ? { taxId } : skipToken);
  const { data: accountData, isFetching: isFetchingAccount } = useGetAccountByEmailQuery(checkEmailAddress(email) ? { email } : skipToken);
  const [addAccount, { error, isSuccess, isError, isLoading }] = useAddAccountMutation();

  useEffect( () => {
    if (step === 'CHECKING_TAXID') {
      if (!isFetchingContact && contactData) {
        if (contactData.queries.contacts.length === 1) {
          setStep('ENTER_PROFILE');
        } else if (contactData.queries.contacts.length > 1) {
          setStep('INVALID_DB');
        } else {
          setStep('INVALID_TAXID');
        }
      }
    }
  }, [step, contactData, isFetchingContact]);

  useEffect( () => {
    if (step === 'SAVING_PROFILE') {
      if (isFetchingAccount
        || isLoading
        || (accountData && accountData.queries.accounts.length)  // we already have an account with such email in the db
        || !(contactData?.queries.contacts.length)
      ) {
        return;
      }

      addAccount({
        USR$FIRSTNAME: firstName,
        USR$LASTNAME: lastName,
        USR$POSITION: position,
        USR$PHONE: phone,
        USR$EMAIL: email,
        USR$COMPANYKEY: contactData?.queries.contacts[0].ID,
        USR$EXPIREON: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
      });
    }
  }, [step, isFetchingAccount, accountData, contactData]);

  useEffect( () => {
    if (isSuccess) {
      setStep('PROFILE_CREATED');
    } else if (isError) {
      setStep('PROFILE_ERROR');
    }
  }, [isSuccess, isError]);

  return (
    <Stack direction="column" spacing={2}>
      {
        step === 'ENTER_TAXID' || step === 'CHECKING_TAXID' ?
          <>
            <Typography variant='h1'>
              Введите УНП предприятия:
            </Typography>
            <TextField
              label="УНП"
              value={taxId}
              disabled={isFetchingContact}
              autoFocus
              onChange={ e => setTaxId( (!e.target.value || !isNaN(parseInt(e.target.value))) ? e.target.value : taxId) }
            />
            <Button
              variant="contained"
              disabled={isFetchingContact || isNaN(parseInt(taxId))}
              onClick = { () => setStep('CHECKING_TAXID') }
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
        : step === 'PROFILE_CREATED' ?
          <>
            <Typography variant='body1'>
              Учетная запись успешно создана. В течение нескольких минут вы получите на электронную почту письмо с паролем.
            </Typography>
            <Button
              variant="contained"
              onClick = { onCancel }
            >
              Войти в систему
            </Button>
          </>
        : step === 'PROFILE_ERROR' ?
          <>
            <Typography variant='body1'>
              {`Произошла ошибка при создании учетной записи: ${error}`}
            </Typography>
            <Button
              variant="contained"
              onClick = { onCancel }
            >
              Войти в систему
            </Button>
          </>
        :
          <>
            <Typography variant='h1'>
              {`Предприятие ${contactData?.queries.contacts[0].NAME}`}
            </Typography>
            <TextField
              label="Фамилия"
              value={lastName}
              autoFocus
              onChange={ e => setLastName(e.target.value) }
            />
            <TextField
              label="Имя"
              value={firstName}
              onChange={ e => setFirstName(e.target.value) }
            />
            <TextField
              label="Должность"
              value={position}
              onChange={ e => setPosition(e.target.value) }
            />
            <TextField
              label="Номер рабочего телефона"
              value={phone}
              onChange={ e => setPhone(e.target.value) }
            />
            <TextField
              label="Электронная почта"
              value={email}
              error={ !!accountData?.queries.accounts.length }
              helperText={ accountData?.queries.accounts.length ? 'Учетная запись с таким адресом электронной почты уже существует!' : undefined }
              onChange={ e => setEmail(e.target.value) }
            />
            <TextField
              label="Повторите ввод электронной почты"
              value={email2}
              onChange={ e => setEmail2(e.target.value) }
            />
            <Button
              variant="contained"
              disabled={
                isFetchingAccount || !lastName || !firstName || !phone || !position ||
                !checkEmailAddress(email) || email !== email2 ||
                !!accountData?.queries.accounts.length
              }
              onClick = { () => setStep('SAVING_PROFILE') }
            >
              Создать учетную запись
            </Button>
            <Button
              variant="contained"
              onClick = { onCancel }
            >
              Вернуться в начало
            </Button>
          </>
      }
    </Stack>
  );
}

export default CreateCustomerAccount;
