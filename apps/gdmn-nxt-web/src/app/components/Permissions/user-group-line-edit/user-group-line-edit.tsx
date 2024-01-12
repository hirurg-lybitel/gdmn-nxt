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

  const [forms, setForms] = useState<number[]>([1]);

  const addForm = () => {
    const newForms = [...forms];
    newForms.push(forms[forms.length - 1] + 1);
    setForms(newForms);
  };

  const deleteForm = (id: number) => () => {
    if (forms.length === 1) return;
    const newForms = [...forms].filter((value) => value !== id);
    setForms(newForms);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);

  const classes = useStyles();

  interface IUsersGroupLineForm {
    [name: string]: IUser | boolean | undefined
  }

  const initValue: IUsersGroupLineForm = {
    USER1: userGroupLine?.USER,
    REQUIRED_2FA1: userGroupLine?.REQUIRED_2FA ?? false
  };

  const formik = useFormik<IUsersGroupLineForm>({
    enableReinitialize: true,
    initialValues: {
      ...initValue
    },
    validationSchema: yup.object().shape({
      USER1: yup.object().required('Не выбран пользователь'),
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
    const users: IUserGroupLine[] = [];
    for (let i = 0;i < forms.length;i++) {
      users.push({
        ID: userGroupLine.ID,
        USER: formik.values[`USER${forms[i]}`] as IUser,
        REQUIRED_2FA: !!formik.values[`REQUIRED_2FA${forms[i]}`],
        USERGROUP: userGroupLine.USERGROUP
      });
    }
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
              {forms.map((fieldId) => <>
                <div key={fieldId} style={{ display: 'flex' }}>
                  <div style={{ width: '100%' }}>
                    <Autocomplete
                      options={users?.filter(user => existsUsers.findIndex(eu => eu.USER?.ID === user.ID) < 0) ?? []}
                      getOptionLabel={option => option.NAME}
                      filterOptions={filterOptions}
                      value={users?.find(el => el.ID === (formik.values[`USER${fieldId}`] as IUser)?.ID) || null}
                      loading={usersIsFetching}
                      loadingText="Загрузка данных..."
                      onBlur={formik.handleBlur}
                      onChange={(event, value) => {
                        formik.setFieldValue(
                          `USER${fieldId}`, value ? value : undefined
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
                          name={`USER${fieldId}`}
                          required
                          focused
                          placeholder="Выберите пользователя"
                          error={Boolean(formik.errors[`USER${fieldId}`])}
                          helperText={formik.errors[`USER${fieldId}`] as ReactNode}
                        />
                      )}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!formik.values[`REQUIRED_2FA${fieldId}`]}
                          name={`REQUIRED_2FA${fieldId}`}
                        />
                      }
                      onChange={(event, value) => {
                        formik.setFieldValue(
                          `REQUIRED_2FA${fieldId}`, value
                        );
                      }}
                      label="Обязательная двухфакторная аутентификация"
                    />
                  </div>
                  {fieldId !== 1 && <div style={{ display: 'flex', justifyContent: 'center', paddingLeft: '10px', paddingTop: '5px' }}>
                    <div>
                      <IconButton
                        size="small"
                        color="inherit"
                        onClick={deleteForm(fieldId)}
                      >
                        <CloseIcon fontSize="medium" />
                      </IconButton>
                    </div>
                  </div>
                  }
                </div>
              </>)}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={addForm} variant="contained">Добавить</Button>
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
