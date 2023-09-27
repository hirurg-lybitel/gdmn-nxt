import { checkEmailAddress } from '@gsbelarus/util-useful';
import { Card, CardActions, CardContent, CardHeader, Grid } from '@mui/material';
import Button from '@mui/material/Button/Button';
import Stack from '@mui/material/Stack/Stack';
import TextField from '@mui/material/TextField/TextField';
import Typography from '@mui/material/Typography/Typography';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useEffect, useMemo, useState } from 'react';
import { useAddAccountMutation, useGetAccountByEmailQuery } from '../features/account/accountApi';
import { useGetContactByTaxIdQuery } from '../features/contact/contactApi';
import './create-customer-account.module.less';

const isTaxId = (taxId: string | undefined) => {
  if (taxId) {
    const parsed = parseInt(taxId);

    if (!isNaN(parsed) && (parsed >= 100_000_000)) {
      return true;
    }
  }
  return false;
};

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

  console.log('CreateCustomerAccount');

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
      if (!isFetchingAccount && !isLoading && !duplAccount && contactData?.queries.contacts.length) {
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
    }
  }, [step, isFetchingAccount, accountData, contactData]);

  useEffect( () => {
    console.log('useEffect');
    if (step === 'SAVING_PROFILE') {
      if (isSuccess) {
        setStep('PROFILE_CREATED');
      } else if (isError) {
        console.log(error);
        setStep('PROFILE_ERROR');
      }
    }
  }, [step, isSuccess, isError, error]);

  const duplAccount = useMemo( () => accountData?.queries.accounts.length ?
    'Учетная запись с таким адресом электронной почты уже существует!' : undefined, [accountData] );

  const accountDataEntered = Boolean(lastName.trim() && firstName.trim() && phone.trim() && position.trim()
    && checkEmailAddress(email) && email === email2 && !duplAccount);

  const CancelButton = useMemo( () => ({ caption }: { caption?: string }) =>
    <Typography align="center">Вернуться в<Button onClick={ onCancel }>начало</Button></Typography>,
  [onCancel]);


  console.log(isFetchingAccount);
  console.log(accountDataEntered);

  return (
    <Card>
    {/* <Stack direction="column" spacing={2}> */}

      {
        step === 'ENTER_TAXID' || step === 'CHECKING_TAXID' ?
          <>
          <CardHeader title={<Typography variant="h6" align="center" noWrap>Введите УНП предприятия:</Typography>} />
          <CardContent>
            <Grid
                container
                direction="column"
                justifyContent="center"
                spacing={2}
              >
                <Grid  item xs={12}>
                  <TextField
                    fullWidth
                    label="УНП"
                    value={taxId}
                    disabled={isFetchingContact}
                    autoFocus
                    onChange={ e => setTaxId(e.target.value) }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={isFetchingContact || !isTaxId(taxId)}
                    onClick = { () => setStep('CHECKING_TAXID') }
                  >
                    Проверить
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <CancelButton />
                </Grid>
              </Grid>
            </CardContent>

          </>
        : step === 'INVALID_TAXID' ?
          <>
            <CardHeader title={<Typography variant="h6" align="center" >{`Предприятие с УНП ${taxId} не найдено в базе данных!`}</Typography>} />
            <CardContent>
              <Grid
                  container
                  direction="column"
                  justifyContent="center"
                  spacing={2}
                >
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick = { () => setStep('ENTER_TAXID') }
                    >
                      Повторить ввод
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <CancelButton />
                  </Grid>
                </Grid>
              </CardContent>
          </>
        : step === 'INVALID_DB' ?
          <>
            <CardHeader title={<Typography variant="h6" align="center" > {`В базе данных найдено несколько предприятий с УНП ${taxId}! Обратитесь к системному администратору.`}</Typography>} />
            <CancelButton />
          </>
        : step === 'PROFILE_CREATED' ?
          <>
            <CardHeader title={<Typography variant="h6" align="center" >
              Учетная запись успешно создана.
              После прохождения проверки, вы получите на электронную почту
              письмо с логином и паролем для входа в систему.
            </Typography>} />
            <CancelButton caption="Войти в систему" />
          </>
        : step === 'PROFILE_ERROR' ?
          <>
            <CardHeader title={<Typography variant="h6" align="center" >Произошла ошибка при создании учетной записи!</Typography>} />
            <CancelButton />
          </>
        :
          <>
            <CardHeader title={<Typography variant="h6" align="center" >{`Предприятие ${contactData?.queries.contacts[0].NAME}`}</Typography>} />
            <CardContent>
              <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    spacing={2}
                  >
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Фамилия"
                        value={lastName}
                        autoFocus
                        onChange={ e => setLastName(e.target.value) }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Имя"
                        value={firstName}
                        onChange={ e => setFirstName(e.target.value) }
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Должность"
                        value={position}
                        onChange={ e => setPosition(e.target.value) }
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Номер рабочего телефона"
                        value={phone}
                        onChange={ e => setPhone(e.target.value) }
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Электронная почта"
                        value={email}
                        error={!!duplAccount}
                        helperText={duplAccount}
                        onChange={ e => setEmail(e.target.value) }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Повторите ввод электронной почты"
                        value={email2}
                        onChange={ e => setEmail2(e.target.value) }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={isFetchingAccount || !accountDataEntered}
                        onClick = { () => setStep('SAVING_PROFILE') }
                      >
                        Создать учетную запись
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <CancelButton />
                    </Grid>

              </Grid>
            </CardContent>
          </>
      }
    </Card>
    // </Stack>
  );
}

export default CreateCustomerAccount;
