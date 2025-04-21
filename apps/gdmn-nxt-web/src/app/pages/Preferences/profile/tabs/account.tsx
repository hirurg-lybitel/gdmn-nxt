import EditableAvatar from '@gdmn-nxt/components/editable-avatar/editable-avatar';
import useUserData from '@gdmn-nxt/helpers/hooks/useUserData';
import { Box, Button, Stack, TextField, useMediaQuery, useTheme } from '@mui/material';
import { useGetProfileSettingsQuery, useSetProfileSettingsMutation } from 'apps/gdmn-nxt-web/src/app/features/profileSettings';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import { IProfileSettings } from '@gsbelarus/util-api-types';
import useObjectsComparator from '@gdmn-nxt/helpers/hooks/useObjectsComparator';
import Confirmation from '@gdmn-nxt/helpers/confirmation';
import EmailInput from '@gdmn-nxt/components/email-input/email-input';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';

export default function AccountTab() {
  const userProfile = useUserData();
  const compareObjects = useObjectsComparator();
  const { data: settings, isLoading } = useGetProfileSettingsQuery(userProfile?.id ?? -1);
  const [setSettings, { isLoading: updateIsLoading }] = useSetProfileSettingsMutation();

  const formik = useFormik<IProfileSettings>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...settings
    },
    onSubmit: (values) => {
      setSettings({
        userId: userProfile?.id ?? -1,
        body: {
          ...settings,
          ...values
        }
      });
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
                  value={userProfile?.fullName || ''}
                  disabled
                  fullWidth
                  inputProps={{
                    style: {
                      textTransform: 'capitalize'
                    }
                  }}
                />
                <TextField
                  label="Должность"
                  value={settings?.RANK || ''}
                  disabled
                  fullWidth
                />
              </Stack>
              <EmailInput
                disabled={isLoading}
                name="EMAIL"
                onChange={formik.handleChange}
                value={formik.values.EMAIL ?? ''}
                helperText={getIn(formik.touched, 'EMAIL') && getIn(formik.errors, 'EMAIL')}
                error={getIn(formik.touched, 'EMAIL') && Boolean(getIn(formik.errors, 'EMAIL'))}
              />
            </Stack>
          </Stack>
          <Box flex={1}/>
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
