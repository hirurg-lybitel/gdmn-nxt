import { IContactPerson, IPhone } from '@gsbelarus/util-api-types';
import {
  Autocomplete,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Box
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, useFormik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '../../confirm-dialog/confirm-dialog';
import * as yup from 'yup';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { useGetDepartmentsQuery } from '../../features/departments/departmentsApi';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import CustomizedDialog from '../../components/Styled/customized-dialog/customized-dialog';
import TelephoneInput, { validatePhoneNumber } from '@gdmn-nxt/components/telephone-input';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: 0
  },
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    width: '30vw',
    minWidth: 500,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  dialogAction: {
    paddingRight: '3%',
    paddingLeft: '3%',
  },
  helperText: {
    '& p': {
      color: '#ec5555',
    },
  },
  button: {
    width: '120px',
  },
}));


export interface PersonEditProps {
  open: boolean;
  person: IContactPerson | undefined;
  onSubmit: (arg1: IContactPerson, arg2: boolean) => void;
  onSaveClick?: () => void;
  onCancelClick: () => void;
};

export function PersonEdit(props: PersonEditProps) {
  const { open, person } = props;
  const { onCancelClick, onSubmit } = props;

  const classes = useStyles();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: departments, isFetching: departmentsIsFetching } = useGetDepartmentsQuery();

  const initValue: IContactPerson = {
    ID: person?.ID || -1,
    NAME: person?.NAME || '',
    EMAIL: person?.EMAIL || '',
    RANK: person?.RANK || '',
    USR$BG_OTDEL: person?.USR$BG_OTDEL,
    PHONES: person?.PHONES || [{ ID: -1, USR$PHONENUMBER: '' }],
    NOTE: person?.NOTE || '',
    USR$LETTER_OF_AUTHORITY: person?.USR$LETTER_OF_AUTHORITY || '',
    ADDRESS: person?.ADDRESS || '',
    COMPANY: person?.COMPANY,
  };

  const [phoneCount, setPhoneCount] = useState(1);

  const phonesValidation = yup
    .object()
    .shape({
      USR$PHONENUMBER: yup
        .string()
        .test('',
          ({ value }) => validatePhoneNumber(value) ?? '',
          (value = '') => !validatePhoneNumber(value))
    });

  const formik = useFormik<IContactPerson>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...person,
      ...initValue
    },
    validationSchema: yup.object().shape({
      Email: yup.string()
        .matches(/^[a-zа-я0-9\_\-\'\+]+([.]?[a-zа-я0-9\_\-\'\+])*@[a-zа-я0-9]+([.]?[a-zа-я0-9])*\.[a-zа-я]{2,}$/i,
          ({ value }) => {
            const invalidChar = value.match(/[^a-zа-я\_\-\'\+ @.]/i);
            if (invalidChar) {
              return `Адрес не может содержать символ "${invalidChar}"`;
            }
            return 'Некорректный адрес';
          })
        .max(40, 'Слишком длинный email'),
      NAME: yup.string()
        .required('Не указано имя')
        .max(80, 'Слишком длинное имя'),
      USR$LETTER_OF_AUTHORITY: yup.string().max(80, 'Слишком длинное значение'),
      PHONES: yup.array().of(phonesValidation)
    }),
    onSubmit: (values) => {
      if (!confirmOpen) {
        setDeleting(false);
        setConfirmOpen(true);
        return;
      };
      setConfirmOpen(false);
    },
    onReset: (values) => {
      setPhones([]);
    }
  });

  const [phones, setPhones] = useState<IPhone[]>(formik.values.PHONES || []);

  useEffect(() => {
    setPhones(initValue.PHONES || []);
  }, [open]);

  const handleDeleteClick = () => {
    setDeleting(true);
    setConfirmOpen(true);
  };

  const handleCancelClick = () => {
    setDeleting(false);
    formik.resetForm();
    onCancelClick();
  };

  const handleAddPhone = () => {
    let newPhones: any[] = [];
    if (formik.values.PHONES?.length) {
      newPhones = [...formik.values.PHONES];
    };
    newPhones.push({ ID: -1, USR$PHONENUMBER: '' });

    formik.setFieldValue('PHONES', newPhones);
    setPhoneCount(phoneCount + 1);
    setPhones(newPhones);
  };

  const handlePhoneChange = (index: number, value: string) => {
    let newPhones: any[] = [];
    if (formik.values.PHONES?.length && (formik.values.PHONES?.length > index)) {
      newPhones = [...formik.values.PHONES];
      newPhones[index] = { ...newPhones[index], USR$PHONENUMBER: value };
    };

    formik.setFieldValue('PHONES', newPhones);
    setPhones(newPhones);
  };

  const handleConfirmOkClick = useCallback(() => {
    setConfirmOpen(false);

    const newPhones = formik.values.PHONES?.filter(phone => (phone.USR$PHONENUMBER));
    if (newPhones?.length) formik.values.PHONES = [...newPhones];

    onSubmit(formik.values, deleting);
  }, [formik.values, deleting]);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const onClose = useCallback(() => onCancelClick(), [onCancelClick]);

  return (
    <CustomizedDialog
      open={open}
      hideBackdrop
      onClose={onClose}
    >
      <DialogTitle>
        {(person && person.ID > 0) ? `Редактирование: ${person.NAME}` : 'Добавление сотрудника'}
      </DialogTitle>
      <DialogContent
        dividers
        className={classes.dialogContent}
      >
        <PerfectScrollbar>
          <Stack
            direction="column"
            spacing={2}
            p="16px 24px"
          >
            <FormikProvider value={formik}>
              <Form id="personForm" onSubmit={formik.handleSubmit}>
                <Stack direction="column" spacing={2}>
                  <TextField
                    label="Имя"
                    type="text"
                    autoFocus
                    name="NAME"
                    onChange={formik.handleChange}
                    value={formik.values.NAME}
                    helperText={formik.touched.NAME && formik.errors.NAME}
                    error={formik.touched.NAME && Boolean(formik.errors.NAME)}
                  />
                  <TextField
                    label="Email"
                    type="text"
                    name="EMAIL"
                    onChange={formik.handleChange}
                    value={formik.values.EMAIL}
                  />
                  <TelephoneInput
                    name="PHONES[0]"
                    label="Телефон 1"
                    value={formik.values.PHONES?.length ? formik.values.PHONES[0].USR$PHONENUMBER : ''}
                    onChange={(value) => handlePhoneChange(0, value)}
                    // fullWidth
                    fixedCode
                    strictMode
                    helperText={(() => {
                      const isTouched = Array.isArray(formik.errors.PHONES) && Boolean((formik.touched.PHONES as unknown as IPhone[])?.[0]?.USR$PHONENUMBER);
                      const error = Array.isArray(formik.errors.PHONES) && (formik.errors.PHONES[0] as unknown as IPhone)?.USR$PHONENUMBER;
                      return isTouched ? error : '';
                    })()}
                    error={(() => {
                      const isTouched = Array.isArray(formik.errors.PHONES) && Boolean((formik.touched.PHONES as unknown as IPhone[])?.[0]?.USR$PHONENUMBER);
                      const error = Array.isArray(formik.errors.PHONES) && (formik.errors.PHONES[0] as unknown as IPhone)?.USR$PHONENUMBER;
                      return isTouched && Boolean(error);
                    })()}
                  />
                  {phones.slice(1)
                    .map((phone, index, { length }) => {
                      const isTouched = Array.isArray(formik.errors.PHONES) && Boolean((formik.touched.PHONES as unknown as IPhone[])?.[index + 1]?.USR$PHONENUMBER);
                      const error = Array.isArray(formik.errors.PHONES) && (formik.errors.PHONES[index + 1] as unknown as IPhone)?.USR$PHONENUMBER;

                      return (
                        <TelephoneInput
                          key={index.toString()}
                          name={`PHONE${index + 2}`}
                          label={`Телефон ${index + 2}`}
                          value={phone.USR$PHONENUMBER ?? ''}
                          onChange={(value) => handlePhoneChange(index + 1, value)}
                          fixedCode
                          strictMode
                          error={isTouched && Boolean(error)}
                          helperText={isTouched && error}
                        />
                      );
                    })}
                  <div>
                    <Button
                      onClick={handleAddPhone}
                      startIcon={<AddCircleRoundedIcon />}
                    >
                      Добавить телефон
                    </Button>
                  </div>
                  <TextField
                    label="Должность"
                    type="text"
                    name="RANK"
                    onChange={formik.handleChange}
                    value={formik.values.RANK}
                  />
                  <TextField
                    label="Адрес"
                    type="text"
                    name="ADDRESS"
                    onChange={formik.handleChange}
                    value={formik.values.ADDRESS}
                  />
                  <TextField
                    label="Доверенность"
                    type="text"
                    name="USR$LETTER_OF_AUTHORITY"
                    onChange={formik.handleChange}
                    value={formik.values.USR$LETTER_OF_AUTHORITY}
                  />
                  <Autocomplete
                    options={departments || []}
                    value={departments?.find(el => el.ID === formik.values.USR$BG_OTDEL?.ID) || null}
                    onChange={(e, value) => {
                      formik.setFieldValue(
                        'USR$BG_OTDEL',
                        value ? { ID: value.ID, NAME: value.NAME } : undefined
                      );
                    }}
                    getOptionLabel={option => option.NAME}
                    renderOption={(props, option) => (
                      <li {...props} key={option.ID}>
                        {option.NAME}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Отдел"
                        type="text"
                        name="USR$BG_OTDEL"
                        onChange={formik.handleChange}
                        value={formik.values.USR$BG_OTDEL}
                        helperText={formik.errors.USR$BG_OTDEL}
                        placeholder="Выберите отдел"
                      />
                    )}
                    loading={departmentsIsFetching}
                    loadingText="Загрузка данных..."
                  />
                  <TextField
                    label="Комментарий"
                    type="text"
                    name="NOTE"
                    onChange={formik.handleChange}
                    value={formik.values.NOTE}
                  />
                </Stack>
              </Form>
            </FormikProvider>
          </Stack>
        </PerfectScrollbar>
      </DialogContent>
      <DialogActions className={classes.dialogAction}>
        <IconButton onClick={handleDeleteClick}>
          <DeleteIcon />
        </IconButton>
        <Box flex={1} />
        <Button
          className={classes.button}
          onClick={handleCancelClick}
          variant="outlined"
          color="primary"
        >
            Отменить
        </Button>
        <Button
          className={classes.button}
          form="personForm"
          type={'submit'}
          variant="contained"
        >
            Сохранить
        </Button>
      </DialogActions>
      <ConfirmDialog
        open={confirmOpen}
        title={deleting ? 'Удаление клиента' : 'Сохранение'}
        text="Вы уверены, что хотите продолжить?"
        dangerous={deleting}
        confirmClick={handleConfirmOkClick}
        cancelClick={handleConfirmCancelClick}
      />
    </CustomizedDialog>
  );
}

export default PersonEdit;
