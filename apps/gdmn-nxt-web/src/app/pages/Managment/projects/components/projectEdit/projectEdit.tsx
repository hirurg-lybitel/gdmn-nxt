import { Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, Tab, TextField, Theme } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import styles from './projectEdit.module.less';
import { IContactWithID, ITimeTrackProject } from '@gsbelarus/util-api-types';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import { EmployeesSelect } from '@gdmn-nxt/components/selectors/employees-select/employees-select';
import { TabContext, TabList, TabPanel } from '@mui/lab';
const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    width: '30vw',
    minWidth: 330,
    maxWidth: '100%',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  button: {
    width: '120px',
  },
  piker: {
    position: 'absolute',
    zIndex: '1400 !important',
    right: '10px',
    moveTop: '10px',
    top: 'top - 50px',
    '& .sketch-picker ': {
      backgroundColor: `${theme.mainContent.backgroundColor} !important`,
      color: `${theme.textColor} !important`
    },
    '& .sketch-picker label': {
      color: `${theme.textColor} !important`
    },
    '& .saturation-white div': {
      pointerEvent: 'none !important',
      cursor: 'pointer !important'
    }
  }
}));

export interface LabelListItemEditProps {
  open: boolean;
  project?: ITimeTrackProject;
  onSubmit: (project: ITimeTrackProject) => void;
  onCancelClick: () => void;
};

export function LabelListItemEdit(props: LabelListItemEditProps) {
  const classes = useStyles();
  const { open, project } = props;
  const { onSubmit, onCancelClick } = props;

  const initValue: ITimeTrackProject = {
    ID: project?.ID || -1,
    name: project?.name || '',
    isFavorite: project?.isFavorite || false,
    customer: project?.customer,
    tasks: project?.tasks || []
  };

  const formik = useFormik<ITimeTrackProject>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue
    },
    validationSchema: yup.object().shape({
      name: yup.string().required('')
        .max(30, 'Слишком длинное наименование'),
    }),
    onSubmit: (value) => {
      onSubmit(formik.values);
    }
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const onCancel = () => {
    onCancelClick();
  };

  const handleOnClose = useCallback(() => onCancelClick(), [onCancelClick]);

  const [tabIndex, setTabIndex] = useState<string>('1');
  const [privateProject, setPrivateProject] = useState(false);
  const [employees, setEmploys] = useState<IContactWithID[]>([]);

  return (
    <CustomizedDialog
      open={open}
      onClose={handleOnClose}
      confirmation={formik.dirty}
      minWidth={400}
      width="calc(100% - var(--menu-width))"
    >
      <DialogTitle>
        {project ? `Редактирование: ${project.name}` : 'Создание проекта'}
      </DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
          <Form
            style={{ height: '100%' }}
            id="mainForm"
            onSubmit={formik.handleSubmit}
          >
            <Stack
              direction="row"
              spacing={2}
              height="100%"
            >
              <Stack className={styles.editPanel} spacing={2}>
                <TextField
                  style={{ width: '100%' }}
                  label="Наименование"
                  type="text"
                  required
                  autoFocus
                  name="name"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  error={getIn(formik.touched, 'name') && Boolean(getIn(formik.errors, 'name'))}
                  helperText={getIn(formik.touched, 'name') && getIn(formik.errors, 'name')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={privateProject}
                      onChange={(e) => setPrivateProject(e.target.checked)}
                    />
                  }
                  label="Приватный"
                />
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack flex={1}>
                <TabContext value={tabIndex}>
                  <TabList
                    centered
                    className={styles.tabHeaderRoot}
                    onChange={(e, index) => setTabIndex(index)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab
                      className={styles.tabHeader}
                      label="Задачи"
                      value="1"
                    />
                    <Tab
                      className={styles.tabHeader}
                      label="Сотрудники"
                      value="2"
                    />
                    <Tab
                      className={styles.tabHeader}
                      label="Статистика"
                      value="3"
                    />
                  </TabList>
                  <Divider />
                  <TabPanel value="1" className={tabIndex === '1' ? styles.tabPanel : ''} >
                    <div>tab1</div>
                  </TabPanel>
                  <TabPanel value="2" className={tabIndex === '2' ? styles.tabPanel : ''} >
                    <div>tab2</div>
                  </TabPanel>
                  <TabPanel value="3" className={tabIndex === '3' ? styles.tabPanel : ''} >
                    <div>tab3</div>
                  </TabPanel>
                </TabContext>
              </Stack>
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        <Box flex={1}/>
        <ButtonWithConfirmation
          className={classes.button}
          onClick={onCancel}
          variant="outlined"
          color="primary"
          title="Внимание"
          text={'Изменения будут утеряны. Продолжить?'}
          confirmation={formik.dirty}
        >
            Отменить
        </ButtonWithConfirmation>
        <Button
          className={classes.button}
          variant="contained"
          form="mainForm"
          type="submit"
        >
            Сохранить
        </Button>
      </DialogActions>
    </CustomizedDialog>
  );
}

export default LabelListItemEdit;
