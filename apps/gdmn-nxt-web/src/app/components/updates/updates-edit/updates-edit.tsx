import { IUpdateHistory } from '@gsbelarus/util-api-types';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import styles from './updates-edit.module.less';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Button, Chip, DialogActions, DialogContent, DialogTitle, Stack, Tab, TextField, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import CustomizedScrollBox from '../../Styled/customized-scroll-box/customized-scroll-box';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';

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
    onSubmit: (values) => {
      onSubmit(values);
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
    onDelete && onDelete(formik.values.ID);
  }, [formik.values.ID, onDelete]);

  const handleFocus = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const lengthOfInput = e.target.value.length;
    return e.target.setSelectionRange(lengthOfInput, lengthOfInput);
  }, []);

  const handleTabsChange = useCallback((event: any, newindex: string) => {
    setTabIndex(newindex);
  }, []);

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <EditDialog
      open={open}
      onClose={handleClose}
      confirmation={formik.dirty}
      title={update ? `Редактирование: ${update.VERSION}` : 'Добавление новой версии'}
      deleteButton={update && userPermission?.updates.DELETE}
      onDeleteClick={handleDeleteClick}
      form="updates"
    >
      <FormikProvider value={formik}>
        <Form
          style={{ minWidth: 0 }}
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
                  <Tab label="Изменение" value="1" />
                  <Tab label="Просмотр" value="2" />
                </TabList>
              </Box>
              <TabPanel
                value="1"
                className={styles.tabPanel}
              >
                <TextField
                  className={styles.inputTextField}
                  label="Описание"
                  type="text"
                  fullWidth
                  required
                  multiline
                  rows={1}
                  name="CHANGES"
                  onChange={formik.handleChange}
                  value={formik.values.CHANGES}
                  error={getIn(formik.touched, 'CHANGES') && Boolean(getIn(formik.errors, 'CHANGES'))}
                  helperText={getIn(formik.touched, 'CHANGES') && getIn(formik.errors, 'CHANGES')}
                />

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
              <Tooltip title={matchDownSm ? 'Поддерживаются стили Markdown' : ''}>
                <a
                  href="https://www.markdownguide.org/basic-syntax/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Chip
                    icon={<InfoIcon />}
                    label={matchDownSm ? '' : 'Поддерживаются стили Markdown'}
                    variant="outlined"
                    className={styles.info}
                    style={{ border: 'none', cursor: 'pointer' }}
                  />
                </a>
              </Tooltip>
            </TabContext>
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}

export default UpdatesEdit;
