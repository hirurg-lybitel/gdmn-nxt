import TelephoneInput, { validatePhoneNumber } from '@gdmn-nxt/components/telephone-input';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import * as yup from 'yup';
import { Form, FormikProvider, getIn, useFormik } from 'formik';

interface IPhoneDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

export default function PhoneDialog({ open, onClose, onSubmit }: Readonly<IPhoneDialogProps>) {
  const initValue = {
    phone: ''
  };

  const formik = useFormik<{ phone: string; }>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue
    },
    validationSchema: yup.object().shape({
      phone: yup.string().required()
        .test('',
          ({ value }) => validatePhoneNumber(value) ?? '',
          (value = '') => !validatePhoneNumber(value))
    }),
    onSubmit: (values) => {
      onSubmit(values.phone);
    }
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog
      closeAfterTransition={false}
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          width: '400px'
        }
      }}
    >
      <DialogTitle
        sx={{
          paddingTop: '12px',
          paddingBottom: '12px',
          backgroundColor: 'var(--color-card-bg)'
        }}
      >
        Укажите ваш номер телефона
        <Box
          sx={{
            position: 'absolute',
            top: '10px',
            right: '10px'
          }}
        >
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
          <Form
            id="phoneForm"
            onSubmit={formik.handleSubmit}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Typography variant="body2">
                Для запроса звонка необходимо указать ваш номер телефона
              </Typography>
              <TelephoneInput
                name="phone"
                label="Телефон"
                value={formik.values.phone ?? ''}
                onChange={(value: string) => {
                  formik.setFieldValue('phone', value);
                }}
                fullWidth
                fixedCode
                strictMode
                required
                helperText={getIn(formik.touched, 'phone') && getIn(formik.errors, 'phone')}
                error={getIn(formik.touched, 'phone') && Boolean(getIn(formik.errors, 'phone'))}
              />
            </div>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions
        sx={{
          gap: '8px',
          padding: '12px',
        }}
      >
        <Button
          sx={{ minWidth: '100px' }}
          onClick={handleClose}
          variant="outlined"
          color="primary"
        >
          Отменить
        </Button>
        <Button
          sx={{ minWidth: '100px' }}
          type="submit"
          form="phoneForm"
          variant="contained"
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
