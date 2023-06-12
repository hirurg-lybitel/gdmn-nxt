import { IUpdateHistory } from '@gsbelarus/util-api-types';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import styles from './updates-edit.module.less';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { Box, Button, Chip, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Tab, TextField, Theme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import CustomizedScrollBox from '../../Styled/customized-scroll-box/customized-scroll-box';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import usePermissions from '../../helpers/hooks/usePermissions';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    height: 'calc(100% - 30px)',
    '& div': {
      height: '100%'
    },
  }
}));

export interface UpdatesEditProps {
  open: boolean;
  update?: IUpdateHistory;
  onSubmit: (update: IUpdateHistory) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
}

export function UpdatesEdit(props: UpdatesEditProps) {
  const { open, update } = props;
  const { onSubmit, onCancel, onDelete } = props;

  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState('1');

  const userPermission = usePermissions();

  const currentDate = useMemo(() => new Date(), []);

  const initValue: IUpdateHistory = {
    ID: update?.ID ?? -1,
    VERSION: update?.VERSION ?? '',
    CHANGES: update?.CHANGES ?? '',
    ONDATE: update?.ONDATE ?? currentDate
  };

  const formik = useFormik<IUpdateHistory>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...update,
      ...initValue
    },
    validationSchema: yup.object().shape({
      VERSION: yup
        .string()
        .required('')
        .test('', 'Не соответсвует формату <major.minor.patch>', (value = '') => {
          const regEx = new RegExp(/^\d+(\.\d+){2}$/);
          return regEx.test(value);
        })
    }),
    onSubmit: (value) => {
      setDeleting(false);
      if (!confirmOpen) {
        setConfirmOpen(true);
        return;
      };
      setConfirmOpen(false);
    }
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);


  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleClose = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleDeleteClick = useCallback(() => {
    setDeleting(true);
    setConfirmOpen(true);
  }, []);

  const handleConfirmOkClick = useCallback((deleting: boolean) => () => {
    setConfirmOpen(false);
    deleting
      ? onDelete && onDelete(formik.values.ID)
      : onSubmit(formik.values);
  }, [formik.values]);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const handleFocus = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const lengthOfInput = e.target.value.length;
    return e.target.setSelectionRange(lengthOfInput, lengthOfInput);
  }, []);

  const handleTabsChange = useCallback((event: any, newindex: string) => {
    setTabIndex(newindex);
  }, []);

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      title={deleting ? 'Удаление данных о версии' : 'Сохранение'}
      text="Вы уверены, что хотите продолжить?"
      dangerous={deleting}
      confirmClick={handleConfirmOkClick(deleting)}
      cancelClick={handleConfirmCancelClick}
    />
  , [confirmOpen, deleting]);

  const classes = useStyles();

  return (
    <CustomizedDialog
      open={open}
      onClose={handleClose}
      width={500}
    >
      <DialogTitle>
        {update ? `Редактирование: ${update.VERSION}` : 'Добавление новой версии'}
      </DialogTitle>
      <DialogContent className={styles.dialogContent} dividers >
        <FormikProvider value={formik}>
          <Form
            id="updates"
            onSubmit={formik.handleSubmit}
            className={styles.formContent}
          >
            <Stack spacing={2} flex={1}>
              <TextField
                label="Номер версии"
                type="text"
                fullWidth
                required
                autoFocus
                onFocus={handleFocus}
                name="VERSION"
                onChange={formik.handleChange}
                value={formik.values.VERSION}
                error={getIn(formik.touched, 'VERSION') && Boolean(getIn(formik.errors, 'VERSION'))}
                helperText={getIn(formik.touched, 'VERSION') && getIn(formik.errors, 'VERSION')}
              />
              <TabContext value={tabIndex}>
                <Box>
                  <TabList onChange={handleTabsChange}>
                    <Tab label="Изменить" value="1" />
                    <Tab label="Просмотреть" value="2" />
                  </TabList>
                </Box>
                <TabPanel
                  value="1"
                  className={styles.tabPanel}
                >
                  <TextField
                    className={classes.input}
                    label="Описание"
                    type="text"
                    fullWidth
                    required
                    multiline
                    inputProps={{
                      style: {
                        height: '100%',
                      },
                    }}
                    name="CHANGES"
                    onChange={formik.handleChange}
                    value={formik.values.CHANGES}
                    error={getIn(formik.touched, 'CHANGES') && Boolean(getIn(formik.errors, 'CHANGES'))}
                    helperText={getIn(formik.touched, 'CHANGES') && getIn(formik.errors, 'CHANGES')}
                  />
                  <a
                    href="https://www.markdownguide.org/basic-syntax/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Chip
                      icon={<InfoIcon />}
                      label="Поддерживаются стили Markdown "
                      variant="outlined"
                      className={styles.link}
                    />
                  </a>
                </TabPanel>
                <TabPanel
                  value="2"
                  className={styles.tabPanel}
                >
                  <div className={styles.preview}>
                    <CustomizedScrollBox>
                      <ReactMarkdown components={{ p: 'div' }}>
                        {formik.values.CHANGES}
                      </ReactMarkdown>
                    </CustomizedScrollBox>

                  </div>
                </TabPanel>
              </TabContext>
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        {
          update &&
          <PermissionsGate actionAllowed={userPermission?.updates.DELETE}>
            <IconButton onClick={handleDeleteClick} size="small">
              <DeleteIcon />
            </IconButton>
          </PermissionsGate>
        }
        <Box flex={1}/>
        <Button
          onClick={handleCancel}
          variant="text"
          color="primary"
        >
          Отменить
        </Button>
        <Button
          type="submit"
          form="updates"
          variant="contained"
        >
          Сохранить
        </Button>
      </DialogActions>
      {memoConfirmDialog}
    </CustomizedDialog>
  );
}

export default UpdatesEdit;
