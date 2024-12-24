import { Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, Tab, TextField, Theme } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import styles from './projectEdit.module.less';
import { IContactWithID, ITimeTrackProject, ITimeTrackTask } from '@gsbelarus/util-api-types';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import { EmployeesSelect } from '@gdmn-nxt/components/selectors/employees-select/employees-select';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { DetailPanelContent } from './detailPanelContent/detailPanelContent';
import { ProjectEmployees } from './projectEmployees';
const useStyles = makeStyles((theme: Theme) => ({
  button: {
    width: '120px',
  },
}));

export interface ProjectEditProps {
  open: boolean;
  project?: ITimeTrackProject;
  onSubmit: (project: ITimeTrackProject) => void;
  onCancelClick: () => void;
};

export function ProjectEdit(props: ProjectEditProps) {
  const classes = useStyles();
  const { open, project } = props;
  const { onSubmit, onCancelClick } = props;

  const initValue: ITimeTrackProject = {
    ID: project?.ID || -1,
    name: project?.name || '',
    isFavorite: project?.isFavorite || false,
    customer: project?.customer,
    tasks: project?.tasks || [],
    employees: []
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

  const [lastId, setLastId] = useState(1);

  const onTaskSubmit = (task: ITimeTrackTask, isDeleting: boolean) => {
    const newTasks = formik.values.tasks ? [...formik.values.tasks] : [];
    if (isDeleting) {
      formik.setFieldValue('tasks', newTasks.filter(item => item.ID !== task.ID));
      return;
    }
    if (task.ID > 0) {
      const index = newTasks.findIndex(item => item.ID === task.ID);
      newTasks[index] = task;
      formik.setFieldValue('tasks', newTasks);
      return;
    }
    formik.setFieldValue('tasks', [...newTasks, ...[{ ...task, ID: lastId }]]);
    setLastId(lastId + 1);
  };

  const changeTaskFvorite = (data: {taskId: number, projectId: number}, favorite: boolean) => {
    const newTasks = formik.values.tasks ? [...formik.values.tasks] : [];
    const index = newTasks.findIndex(item => item.ID === data.taskId);
    newTasks[index] = { ...newTasks[index], isFavorite: favorite };
    formik.setFieldValue('tasks', newTasks);
  };

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
                    <Tab
                      className={styles.tabHeader}
                      label="Заметки"
                      value="4"
                    />
                  </TabList>
                  <Divider />
                  <TabPanel value="1" className={tabIndex === '1' ? styles.tabPanel : ''} >
                    <div style={{ width: '100%', height: '100%' }}>
                      <DetailPanelContent
                        project={formik.values}
                        separateGrid
                        onSubmit={onTaskSubmit}
                        changeFavorite={changeTaskFvorite}
                      />
                    </div>
                  </TabPanel>
                  <TabPanel value="2" className={tabIndex === '2' ? styles.tabPanel : ''} >
                    <ProjectEmployees employees={formik.values.employees || []} onChange={(empls) => formik.setFieldValue('employees', empls)} />
                  </TabPanel>
                  <TabPanel value="3" className={tabIndex === '3' ? styles.tabPanel : ''} >
                    <div>tab3</div>
                  </TabPanel>
                  <TabPanel value="4" className={tabIndex === '4' ? styles.tabPanel : ''} >
                    <div>tab4</div>
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

export default ProjectEdit;
