import { Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, Tab, TextField, Theme } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './projectEdit.module.less';
import { IContactWithID, IProjectNote, IProjectType, ITimeTrackProject, ITimeTrackTask, Permissions } from '@gsbelarus/util-api-types';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import { EmployeesSelect } from '@gdmn-nxt/components/selectors/employees-select/employees-select';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { DetailPanelContent } from '../detailPanelContent/detailPanelContent';
import { ProjectEmployees } from './projectEmployees';
import ProjectNotes from './projectNotes/projectNotes';
import ProjectStatistics from './projectStatistics/projectStatistics';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import { ProjectTypeSelect } from '@gdmn-nxt/components/selectors/projectType-select/projectType-select';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import { RootState } from '@gdmn-nxt/store';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    width: '120px',
  },
}));

export interface ProjectEditProps {
  open: boolean;
  project?: ITimeTrackProject;
  onSubmit: (project: ITimeTrackProject, isDelete: boolean) => void;
  onCancelClick: () => void;
};

export function ProjectEdit(props: ProjectEditProps) {
  const classes = useStyles();
  const { open, project } = props;
  const { onSubmit, onCancelClick } = props;
  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const initValue: ITimeTrackProject = {
    ID: project?.ID || -1,
    name: project?.name || '',
    isFavorite: project?.isFavorite || false,
    tasks: project?.tasks || [],
    employees: project?.employees || [],
    notes: project?.notes || [],
    isPrivate: project?.isPrivate || false,
    isDone: project?.isDone || false,
  };

  const formik = useFormik<ITimeTrackProject>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue,
      ...project
    },
    validationSchema: yup.object().shape({
      name: yup.string().required('')
        .max(30, 'Слишком длинное наименование'),
      projectType: yup.object().required('')
    }),
    onSubmit: (value) => {
      onSubmit(formik.values, false);
    }
  });

  useEffect(() => {
    setTabIndex('1');
    if (!open) formik.resetForm();
  }, [open]);

  const handleOnClose = useCallback(() => onCancelClick(), [onCancelClick]);

  const [tabIndex, setTabIndex] = useState<string>('1');

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

  const handleDelete = () => {
    onSubmit(formik.values, true);
  };

  const inUse = useMemo(() => project?.tasks?.findIndex(task => task.inUse) !== -1, [project?.tasks]);

  return (
    <CustomizedDialog
      open={open}
      onClose={handleOnClose}
      confirmation={formik.dirty}
      minWidth={400}
      width="calc(100% - var(--menu-width))"
    >
      <DialogTitle>
        {project ? `Редактирование проекта: ${project.name}` : 'Создание проекта'}
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
                      checked={formik.values.isPrivate}
                      onChange={(e) => formik.setFieldValue('isPrivate', e.target.checked)}
                    />
                  }
                  label="Приватный"
                />
                <ProjectTypeSelect
                  withCreate
                  withEdit
                  required
                  value={formik.values.projectType || null}
                  onChange={(value) => formik.setFieldValue('projectType', value as IProjectType)}
                />
                <CustomerSelect
                  required
                  value={formik.values.customer}
                  onChange={(value) => formik.setFieldValue('customer', value)}
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
                      disabled={!formik.values.ID || formik.values.ID === -1}
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
                    <ProjectEmployees employees={formik.values.employees} onChange={(empls) => formik.setFieldValue('employees', empls)} />
                  </TabPanel>
                  <TabPanel value="3" className={tabIndex === '3' ? styles.tabPanel : ''} >
                    <ProjectStatistics projectId={formik.values.ID !== -1 ? formik.values.ID : undefined} />
                  </TabPanel>
                  <TabPanel value="4" className={tabIndex === '4' ? styles.tabPanel : ''} >
                    <ProjectNotes notes={formik.values.notes} onChange={(notes) => formik.setFieldValue('notes', notes)}/>
                  </TabPanel>
                </TabContext>
              </Stack>
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        <PermissionsGate actionAllowed={userPermissions?.['time-tracking/projects']?.DELETE}>
          <ItemButtonDelete
            disabled={inUse}
            title={'Удаление проекта'}
            button
            onClick={handleDelete}
          />
        </PermissionsGate>
        <Box flex={1}/>
        <ButtonWithConfirmation
          className={classes.button}
          onClick={handleOnClose}
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
