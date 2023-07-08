import { IContactPerson, IPhone } from '@gsbelarus/util-api-types';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Stack,
  TextField,
  Box
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, useFormik } from 'formik';
import { forwardRef, ReactElement, Ref, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ConfirmDialog from '../../confirm-dialog/confirm-dialog';
import { RootState } from '../../store';
import * as yup from 'yup';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { useGetDepartmentsQuery } from '../../features/departments/departmentsApi';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import CustomizedDialog from '../../components/Styled/customized-dialog/customized-dialog';
import { AnyObject } from 'yup/lib/types';
import TextFieldMasked from '../../components/textField-masked/textField-masked';

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

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>,
) {
  return <Slide
    direction="left"
    ref={ref}
    {...props}
  />;
});


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
    WCOMPANYKEY: person?.WCOMPANYKEY || -1,
  };

  const [phoneCount, setPhoneCount] = useState(1);

  const phonesValidation = () => {
    const validationCount: {[U: string]: yup.StringSchema<string | undefined, AnyObject, string | undefined>} = {};
    for (let i = 0;i < phoneCount;i++) {
      const name = `PHONE${i + 1}`;
      validationCount[name] = yup.string().matches(/^(\+ ?)?([1-9]\d{0,2}[-\ ]?)?(\(?[1-9]\d{0,2}\)?)?[-\ ]?\d{3,3}[-\ ]?\d{2,2}[-\ ]?\d{2,2}$/, 'Некорректный номер')
        .max(40, 'Слишком длинный номер');
    }
    return validationCount;
  };

  interface IFrom extends IContactPerson {
    [U: string]: any
  }

  const formik = useFormik<IFrom>({
    enableReinitialize: true,
    initialValues: {
      ...person,
      ...initValue
    },
    validationSchema: yup.object().shape(Object.assign({
      NAME: yup.string()
        .required('Не указано имя')
        .max(80, 'Слишком длинное имя'),
      USR$LETTER_OF_AUTHORITY: yup.string().max(80, 'Слишком длинное значение')
    }, phonesValidation())),
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

  const asd = 'PHONE1';

  return (
    <CustomizedDialog
      open={open}
      hideBackdrop
    >
      <DialogTitle>
        {(person && person.ID > 0) ? `Редактирование: ${person.NAME}` : 'Добавление контакта'}
      </DialogTitle>
      <DialogContent
        dividers
        className={classes.dialogContent}
      >
        <PerfectScrollbar>
          <Stack
            direction="column"
            spacing={3}
            p="16px 24px"
          >
            <FormikProvider value={formik}>
              <Form id="mainForm" onSubmit={formik.handleSubmit}>
                <Stack direction="column" spacing={3}>
                  <TextField
                    label="Имя"
                    type="text"
                    required
                    autoFocus
                    name="NAME"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.NAME}
                    helperText={formik.errors.NAME}
                    error={Boolean(formik.errors.NAME)}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    name="EMAIL"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.EMAIL}
                  />
                  <TextFieldMasked
                    mask={'+375 (99) 999-99-99'}
                    label="Телефон 1"
                    type="tel"
                    name="PHONE1"
                    value={formik.values.PHONES?.length ? formik.values.PHONES[0].USR$PHONENUMBER : ''}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      setTimeout(() => {
                        formik.handleChange(e);
                      }, 1);
                    }}
                    onChange={(e) => {
                      formik.handleChange(e);
                      handlePhoneChange(0, e.target.value);
                    }}
                    helperText={String(formik.errors?.['PHONE1']) === 'undefined'
                    || formik.values.PHONES?.[0].USR$PHONENUMBER === ''
                      ? undefined
                      : String(formik.errors?.['PHONE1'])
                    }
                  />
                  {phones.slice(1)
                    .map((phone, index) => {
                      // console.log('phone', index, phone.USR$PHONENUMBER);
                      return (
                        <TextFieldMasked
                          mask={'+375 (99) 999-99-99'}
                          key={index}
                          label={`Телефон ${index + 2}`}
                          type="tel"
                          name={`PHONE${index + 2}`}
                          value={phone.USR$PHONENUMBER}
                          onBlur={(e) => {
                            formik.handleBlur(e);
                            setTimeout(() => {
                              formik.handleChange(e);
                            }, 1);
                          }}
                          onChange={(e) => {
                            formik.handleChange(e);
                            handlePhoneChange(index + 1, e.target.value);
                          }}
                          helperText={String(formik.errors?.[`PHONE${index + 2}`]) === 'undefined'
                          || phone.USR$PHONENUMBER === ''
                            ? undefined
                            : String(formik.errors?.[`PHONE${index + 2}`])
                          }
                        />);
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
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.RANK}
                  />
                  <TextField
                    label="Адрес"
                    type="text"
                    name="ADDRESS"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.ADDRESS}
                  />
                  <TextField
                    label="Доверенность"
                    type="text"
                    name="USR$LETTER_OF_AUTHORITY"
                    onBlur={formik.handleBlur}
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
                        onBlur={formik.handleBlur}
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
                    onBlur={formik.handleBlur}
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
          variant="text"
          color="primary"
        >
            Отменить
        </Button>
        <Button
          className={classes.button}
          // type={!formik.isValid ? 'submit' : 'button'}
          // form="mainForm"
          onClick={() => {
            setDeleting(false);
            setConfirmOpen(formik.isValid);
          }}
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
