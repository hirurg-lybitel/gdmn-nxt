import { IUser, IUserGroup, IUserGroupLine } from '@gsbelarus/util-api-types';
import { Autocomplete, Box, Button, Checkbox, createFilterOptions, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Stack, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, useFormik } from 'formik';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useGetUsersQuery } from '../../../features/systemUsers';
import * as yup from 'yup';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import { useGetUserGroupLineQuery } from '../../../features/permissions';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const useStyles = makeStyles(() => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    minWidth: 430,
    maxWidth: '100%',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  button: {
    width: '120px',
  },
}));

export interface UserGroupLineEditProps {
  open: boolean;
  userGroupLine: IUserGroupLine;
  onSubmit: (users: IUserGroupLine[]) => void;
  onCancel: () => void;
}

export function UserGroupLineEdit(props: UserGroupLineEditProps) {
  const { open, userGroupLine } = props;
  const { onSubmit, onCancel } = props;
  const { data: users, isFetching: usersIsFetching } = useGetUsersQuery();
  const { data: existsUsers = [] } = useGetUserGroupLineQuery(userGroupLine.USERGROUP.ID);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const classes = useStyles();

  interface IUsersGroupLineForm {
    USERS: IUser[],
    REQUIRED_2FA: boolean
  }

  const initValue: IUsersGroupLineForm = {
    USERS: userGroupLine.USER ? [userGroupLine.USER] : [],
    REQUIRED_2FA: userGroupLine?.REQUIRED_2FA || false
  };

  const formik = useFormik<IUsersGroupLineForm>({
    enableReinitialize: true,
    initialValues: {
      ...initValue
    },
    validationSchema: yup.object().shape({
      USERS: yup.array().required('Не выбран пользователь'),
    }),
    onSubmit: (value) => {
      setConfirmOpen(true);
    }
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const handleConfirmOkClick = useCallback(() => {
    setConfirmOpen(false);
    const users = formik.values.USERS.map(user => ({ ID: userGroupLine.ID, USER: user, REQUIRED_2FA: formik.values.REQUIRED_2FA, USERGROUP: userGroupLine.USERGROUP }));
    if (users.length === 0) return;
    onSubmit(users);
  }, [formik.values, userGroupLine]);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    stringify: (option: any) => option.NAME + option.CONTACT.NAME
  });

  const handleClose = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <CustomizedDialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>
        {userGroupLine.USER ? `Редактирование: ${userGroupLine.USER.NAME}` : 'Добавление пользователя'}
      </DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
          <Form id="mainForm" onSubmit={formik.handleSubmit}>
            <Stack direction="column" spacing={2}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '100%' }}>
                  <Autocomplete
                    multiple
                    options={users?.filter(user => existsUsers.findIndex(eu => eu.USER?.ID === user.ID) < 0) ?? []}
                    getOptionLabel={option => option.NAME}
                    filterOptions={filterOptions}
                    disableCloseOnSelect
                    value={formik.values.USERS || undefined}
                    loading={usersIsFetching}
                    loadingText="Загрузка данных..."
                    onBlur={formik.handleBlur}
                    onChange={(event, value) => {
                      formik.setFieldValue(
                        'USERS', value
                      );
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option.ID}>
                        <Checkbox
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        <div>
                          {option.NAME}
                          <div>
                            {option.CONTACT.NAME}
                          </div>
                        </div>
                      </li>
                    )}
                    renderInput={(params) => (
                      <>
                        <TextField
                          {...params}
                          label="Пользователь"
                          name={'USERS'}
                          focused
                          placeholder="Выберите пользователя"
                          error={Boolean(formik.errors.USERS)}
                          helperText={formik.errors.USERS as ReactNode}
                        />
                      </>
                    )}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.REQUIRED_2FA}
                        name={'REQUIRED_2FA'}
                      />
                    }
                    onChange={(event, value) => {
                      formik.setFieldValue(
                        'REQUIRED_2FA', value
                      );
                    }}
                    label="Обязательная двухфакторная аутентификация"
                  />
                </div>
              </div>
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        <Box flex={1}/>
        <Button
          className={classes.button}
          onClick={onCancel}
          variant="outlined"
          color="primary"
        >
          Отменить
        </Button>
        <Button
          className={classes.button}
          type={'submit'}
          form="mainForm"
          variant="contained"
        >
          Сохранить
        </Button>
      </DialogActions>
      <ConfirmDialog
        open={confirmOpen}
        title="Сохранение"
        text="Вы уверены, что хотите продолжить?"
        confirmClick={handleConfirmOkClick}
        cancelClick={handleConfirmCancelClick}
      />
    </CustomizedDialog>
  );
}

export default UserGroupLineEdit;
