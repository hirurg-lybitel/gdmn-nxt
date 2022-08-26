import { IUser } from '@gsbelarus/util-api-types';
import { Autocomplete, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Slide, Stack, TextField } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, useFormik } from 'formik';
import { forwardRef, ReactElement, Ref, useEffect, useState } from 'react';
import * as yup from 'yup';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { useGetUsersQuery } from '../../../features/systemUsers';
import filterOptions from '../../filter-options';
import styles from './user-edit.module.less';

const useStyles = makeStyles(() => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    // width: '20vw',
    minWidth: 430,
    maxWidth: '100%',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
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
  return <Slide direction="left" ref={ref} {...props} />;
});

export interface UserEditProps {
  open: boolean;
  user?: IUser;
  onSubmit: (user: IUser) => void;
  onCancel: () => void;
  onClose: (e: any, r: string) => void;
}

export function UserEdit(props: UserEditProps) {
  const { open, user } = props;
  const { onSubmit, onCancel, onClose } = props;

  const { data: users, isFetching: usersIsFetching } = useGetUsersQuery();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const classes = useStyles();

  const initValue: IUser = {
    ID: user?.ID || -1,
    NAME: user?.NAME || '',
    FULLNAME: user?.FULLNAME || '',
    CONTACT: user?.CONTACT || { ID: -1, NAME: '' },
    DISABLED: user?.DISABLED || false,
  };

  const formik = useFormik<IUser>({
    enableReinitialize: true,
    initialValues: {
      ...user,
      ...initValue
    },
    validationSchema: yup.object().shape({
      NAME: yup.string().required('').max(40, 'Слишком длинное наименование'),
    }),
    onSubmit: (value) => {
      setConfirmOpen(false);
      onSubmit(value);
    }
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);


  return (
    <Dialog
      open={open}
      classes={{ paper: classes.dialog }}
      TransitionComponent={Transition}
      onClose={onClose}
    >
      <DialogTitle>
        {user ? `Редактирование: ${user.NAME}` : 'Добавление'}
      </DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
          <Form id="mainForm" onSubmit={formik.handleSubmit}>
            <Stack direction="column" spacing={3}>
              {/* <TextField
                label="Наименование"
                type="text"
                required
                autoFocus
                name="NAME"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.NAME}
                helperText={formik.errors.NAME}
              /> */}
              <Autocomplete
                options={users || []}
                getOptionLabel={option => option.NAME}
                filterOptions={filterOptions(50, 'NAME')}
                value={users?.find(el => el.ID === formik.values.CONTACT?.ID) || null}
                loading={usersIsFetching}
                loadingText="Загрузка данных..."
                onChange={(event, value) => {
                  formik.setFieldValue(
                    'DEAL',
                    { ...formik.values, CONTACT: value ? value : null }
                  );
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.ID}>
                    <div>
                      {option.NAME}
                      <div>
                        {option.CONTACT.NAME}
                      </div>
                    </div>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Пользователь"
                    required
                    placeholder="Выберите пользователя"
                  />
                )}
              />
              {/* <FormControlLabel
                control={
                  <Checkbox
                    name="DISABLED"
                    checked={formik.values.DISABLED}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.DISABLED}
                  />
                }
                label="Отключен"
              /> */}
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        <Box flex={1}/>
        <Button
          className={classes.button}
          onClick={onCancel}
          variant="text"
          color="primary"
        >
            Отменить
        </Button>
        <Button
          className={classes.button}
          type={!formik.isValid ? 'submit' : 'button'}
          form="mainForm"
          onClick={() => {
            setConfirmOpen(formik.isValid);
          }}
          variant="contained"
        >
            Сохранить
        </Button>
      </DialogActions>
      <ConfirmDialog
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title="Сохранение"
        text="Вы уверены, что хотите продолжить?"
        onConfirm={formik.handleSubmit}
      />
    </Dialog>
  );
}

export default UserEdit;
