import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import useObjectsComparator from '@gdmn-nxt/helpers/hooks/useObjectsComparator';
import { ContractType, ICustomer, ISystemSettings, IUserGroup } from '@gsbelarus/util-api-types';
import { Box, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useGetSystemSettingsQuery, useSetSystemSettingsMutation } from 'apps/gdmn-nxt-web/src/app/features/systemSettings';
import { Form, FormikProvider, useFormik } from 'formik';
import { useMemo } from 'react';
import { UserGroupSelect } from '@gdmn-nxt/components/selectors/userGroup-select/user-group-select';
import { PasswordTextField } from '@gdmn-nxt/components/Styled/password-text-field/password-Text-field';

export default function SystemTab() {
  const compareObjects = useObjectsComparator();
  const { data: settings, isFetching } = useGetSystemSettingsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [setSettings, { isLoading: updateIsLoading }] = useSetSystemSettingsMutation();

  const initValue: ISystemSettings = useMemo(() => ({
    ID: -1,
    CONTRACTTYPE: ContractType.GS,
  }), []);

  const formik = useFormik<ISystemSettings>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue,
      ...settings
    },
    onSubmit: (values) => {
      setSettings({
        ...settings,
        ...values
      });
    },
  });

  const onConfirm = () => {
    formik.submitForm();
  };

  const handleCustomerChange = (customer: ICustomer | null | undefined) => {
    formik.setFieldValue('OURCOMPANY', { ID: customer?.ID, NAME: customer?.NAME });
  };

  const handlePErformerGroupChange = (group: IUserGroup | IUserGroup[] | null) => {
    formik.setFieldValue('performersGroup', group);
  };

  return (
    <FormikProvider value={formik}>
      <Form id="systemTabForm" onSubmit={formik.handleSubmit}>
        <Stack
          height={'100%'}
          spacing={2}
        >
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
            <Stack spacing={1} flex={1}>
              <Typography variant="subtitle1">Общие</Typography>
              <Stack spacing={2}>
                <Stack sx={{ display: 'flex', gap: '16px', flexDirection: { xs: 'column', sm: 'row' } }}>
                  <FormControl size="small" sx={{ width: { xs: '100%', sm: 200 } }}>
                    <InputLabel id="select-label">Тип договоров</InputLabel>
                    <Select
                      labelId="select-label"
                      value={formik.values.CONTRACTTYPE?.toString() ?? ContractType.GS.toString()}
                      label="Тип договоров"
                      onChange={(e) => {
                        formik.setFieldValue('CONTRACTTYPE', Number(e.target.value));
                      }}
                    >
                      {Object
                        .keys(ContractType)
                        .filter(key => !isNaN(Number(key)))
                        .map(key => (
                          <MenuItem key={key} value={key}>{ContractType[Number(key)]}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <div style={{ flex: 1 }}>
                    <CustomerSelect
                      sx={{ minWidth: '100%', flex: 1 }}
                      name="OURCOMPANY"
                      label="Рабочая оранизация"
                      disableEdition
                      disableCreation
                      placeholder="Укажите вашу рабочую оранизацию"
                      value={formik.values.OURCOMPANY}
                      onChange={handleCustomerChange}
                      error={formik.touched.OURCOMPANY && Boolean(formik.errors.OURCOMPANY)}
                      helperText={formik.touched.OURCOMPANY && formik.errors.OURCOMPANY}
                    />
                  </div>
                </Stack>
                <UserGroupSelect
                  label={'Группа исполнителей тикетов'}
                  value={formik.values.performersGroup ?? null}
                  onChange={handlePErformerGroupChange}
                />
              </Stack>
            </Stack>
            <Stack spacing={1} flex={1}>
              <Typography variant="subtitle1">SMTP сервер</Typography>
              <Stack direction="column" spacing={2}>
                <Stack
                  spacing={2}
                  direction={{ xs: 'column', sm: 'row' }}
                >
                  <TextField
                    label="Хост"
                    fullWidth
                    name="smtpHost"
                    value={formik.values.smtpHost ?? ''}
                    onChange={formik.handleChange}
                  />
                  <TextField
                    sx={{ width: { xs: '100%', sm: '60%', lg: '80%', xl: '50%' } }}
                    type="number"
                    label="Порт"
                    fullWidth
                    name="smtpPort"
                    value={formik.values.smtpPort ?? ''}
                    onChange={formik.handleChange}
                  />
                </Stack>
                <Stack
                  spacing={2}
                  direction={{ xs: 'column', sm: 'row' }}
                >
                  <TextField
                    label="Пользователь"
                    fullWidth
                    name="smtpUser"
                    value={formik.values.smtpUser ?? ''}
                    onChange={formik.handleChange}
                  />
                  <PasswordTextField
                    sx={{ width: { xs: '100%', sm: '60%', lg: '80%', xl: '50%' } }}
                    label="Пароль"
                    fullWidth
                    autoComplete="off"
                    name="smtpPassword"
                    value={formik.values.smtpPassword ?? ''}
                    onChange={formik.handleChange}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Box flex={1} />
          <ButtonWithConfirmation
            variant="contained"
            disabled={compareObjects(formik.values, settings ?? {}) || isFetching}
            style={{ alignSelf: 'flex-start' }}
            onClick={onConfirm}
            title="Сохранение изменений"
            confirmation={false}
          >
            Сохранить
          </ButtonWithConfirmation>
        </Stack>
      </Form>
    </FormikProvider>
  );
}
