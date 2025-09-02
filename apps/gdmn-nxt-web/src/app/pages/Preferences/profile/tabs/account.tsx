import EditableAvatar from '@gdmn-nxt/components/editable-avatar/editable-avatar';
import useUserData from '@gdmn-nxt/helpers/hooks/useUserData';
import { Box, Stack, TextField, useMediaQuery, useTheme } from '@mui/material';
import { useGetProfileSettingsQuery, useSetProfileSettingsMutation } from 'apps/gdmn-nxt-web/src/app/features/profileSettings';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import { IProfileSettings, UserType } from '@gsbelarus/util-api-types';
import useObjectsComparator from '@gdmn-nxt/helpers/hooks/useObjectsComparator';
import EmailInput from '@gdmn-nxt/components/email-input/email-input';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import { RootState } from '@gdmn-nxt/store';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { emailValidation } from '@gdmn-nxt/helpers/validators';
import TelephoneInput from '@gdmn-nxt/components/telephone-input';
import { ticketsUserApi } from 'apps/gdmn-nxt-web/src/app/features/tickets/ticketsUserApi';

export default function AccountTab() {
  const userProfile = useUserData();
  const compareObjects = useObjectsComparator();
  const { data: settings, isLoading } = useGetProfileSettingsQuery(userProfile?.id ?? -1);
  const [setSettings, { isLoading: updateIsLoading }] = useSetProfileSettingsMutation();

  const dispatch = useDispatch();

  const formik = useFormik<IProfileSettings>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...settings
    },
    validationSchema: yup.object().shape({
      FULLNAME: yup.string().required(),
      EMAIL: emailValidation()
    }),
    onSubmit: async (values) => {
      await setSettings({
        userId: userProfile?.id ?? -1,
        body: {
          ...settings,
          ...values
        }
      });
      if (settings?.PHONE !== values.PHONE) {
        dispatch(ticketsUserApi.util.invalidateTags(['users']));
      }
    },
  });

  const handleAvatarChange = (value = '') => {
    formik.setFieldValue('AVATAR', value);
  };

  const onConfirm = () => {
    formik.submitForm();
  };

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const ticketsUser = useSelector<RootState, boolean>(state => state.user.userProfile?.type === UserType.Tickets);

  return (
    <FormikProvider value={formik}>
      <Form id="accountTabForm" onSubmit={formik.handleSubmit}>
        <Stack height={'100%'}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <div>
              <EditableAvatar
                size={matchDownSm ? 100 : 120}
                value={formik.values.AVATAR ?? ''}
                onChange={handleAvatarChange}
                loading={isLoading || updateIsLoading}
              />
            </div>
            <Stack spacing={2} flex={1}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Имя"
                  value={formik.values.FULLNAME || ''}
                  disabled={!ticketsUser}
                  name="FULLNAME"
                  fullWidth
                  onChange={formik.handleChange}
                  inputProps={{
                    style: {
                      textTransform: 'capitalize'
                    }
                  }}
                  helperText={getIn(formik.touched, 'FULLNAME') && getIn(formik.errors, 'FULLNAME')}
                  error={getIn(formik.touched, 'FULLNAME') && Boolean(getIn(formik.errors, 'FULLNAME'))}
                />
                {!ticketsUser && <TextField
                  label="Должность"
                  value={settings?.RANK || ''}
                  disabled
                  fullWidth
                />}
              </Stack>
              {ticketsUser ? <Box sx={{ display: 'flex', gap: '16px', flexDirection: { lg: 'row', xs: 'column' } }}>
                <div style={{ flex: 1 }}>
                  <EmailInput
                    disabled={isLoading}
                    name="EMAIL"
                    fullWidth
                    onChange={formik.handleChange}
                    value={formik.values.EMAIL ?? ''}
                    helperText={getIn(formik.touched, 'EMAIL') && getIn(formik.errors, 'EMAIL')}
                    error={getIn(formik.touched, 'EMAIL') && Boolean(getIn(formik.errors, 'EMAIL'))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <TelephoneInput
                    name="PHONE"
                    label="Телефон"
                    value={formik.values.PHONE ?? ''}
                    onChange={(value: string) => {
                      formik.setFieldValue('PHONE', value);
                    }}
                    fullWidth
                    fixedCode
                    strictMode
                    required
                    helperText={getIn(formik.touched, 'PHONE') && getIn(formik.errors, 'PHONE')}
                    error={getIn(formik.touched, 'PHONE') && Boolean(getIn(formik.errors, 'PHONE'))}
                  />
                </div>
              </Box>
                :
                <EmailInput
                  disabled={isLoading}
                  name="EMAIL"
                  onChange={formik.handleChange}
                  value={formik.values.EMAIL ?? ''}
                  helperText={getIn(formik.touched, 'EMAIL') && getIn(formik.errors, 'EMAIL')}
                  error={getIn(formik.touched, 'EMAIL') && Boolean(getIn(formik.errors, 'EMAIL'))}
                />
              }
            </Stack>
          </Stack>
          <Box flex={1} />
          <ButtonWithConfirmation
            variant="contained"
            disabled={compareObjects(formik.values, settings ?? {}) || isLoading}
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
