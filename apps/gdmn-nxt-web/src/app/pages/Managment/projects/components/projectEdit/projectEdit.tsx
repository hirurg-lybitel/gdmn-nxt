import { Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, Tab, TextField, Theme, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './projectEdit.module.less';
import { IProjectType, ITimeTrackProject, ITimeTrackTask, Permissions } from '@gsbelarus/util-api-types';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { DetailPanelContent } from '../detailPanelContent/detailPanelContent';
import { ProjectEmployees } from './projectEmployees';
import ProjectStatistics from './projectStatistics/projectStatistics';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import { ProjectTypeSelect } from '@gdmn-nxt/components/selectors/projectType-select/projectType-select';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import { RootState } from '@gdmn-nxt/store';
import { useSelector } from 'react-redux';
import { UserState } from 'apps/gdmn-nxt-web/src/app/features/user/userSlice';
import ProjectNote from './projectNote/projectNote';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';

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
  const user = useSelector<RootState, UserState>(state => state.user);

  const initValue: ITimeTrackProject = {
    ID: project?.ID ?? -1,
    name: project?.name ?? '',
    isFavorite: project?.isFavorite ?? false,
    tasks: project?.tasks ?? [],
    employees: project?.employees ?? [],
    isPrivate: project?.isPrivate || false,
    isDone: project?.isDone ?? false,
    creator: project?.creator ?? {
      ID: user.userProfile?.contactkey ?? -1,
      NAME: user.userProfile?.fullName ?? ''
    }
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
        .max(60, 'Слишком длинное наименование'),
      projectType: yup.object().required('')
    }),
    onSubmit: (value) => {
      onSubmit(formik.values, false);
    }
  });

  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

  const defaultTab = matchDownMd ? '0' : '1';

  useEffect(() => {
    setTabIndex(defaultTab);
    if (!open) formik.resetForm();
  }, [open]);

  const handleOnClose = useCallback(() => onCancelClick(), [onCancelClick]);

  const [tabIndex, setTabIndex] = useState<string>(defaultTab);

  const [lastId, setLastId] = useState(1);

  const onTaskSubmit = useCallback((task: ITimeTrackTask, isDeleting: boolean) => {
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
  }, [formik, lastId]);

  const changeTaskFvorite = useCallback((data: { taskId: number, projectId: number; }, favorite: boolean) => {
    const newTasks = formik.values.tasks ? [...formik.values.tasks] : [];
    const index = newTasks.findIndex(item => item.ID === data.taskId);
    newTasks[index] = { ...newTasks[index], isFavorite: favorite };
    formik.setFieldValue('tasks', newTasks);
  }, [formik]);

  const handleDelete = useCallback(() => {
    onSubmit(formik.values, true);
  }, [formik.values, onSubmit]);

  const inUse = useMemo(() => project?.tasks?.findIndex(task => task.inUse) !== -1, [project?.tasks]);


  const editForm = useMemo(() => {
    return (
      <Stack
        spacing={2}
        paddingRight={'16px'}
      >
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
        <Tooltip title="Приватный проект будет отображаться только для привязанных к проекту сотрудников">
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.isPrivate}
                onChange={(e) => formik.setFieldValue('isPrivate', e.target.checked)}
              />
            }
            label="Приватный"
          />
        </Tooltip>
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
        <FormControlLabel
          control={
            <Checkbox
              checked={formik.values.isDone}
              onChange={(e) => formik.setFieldValue('isDone', e.target.checked)}
            />
          }
          label="Отключен"
        />
      </Stack>
    );
  }, [formik]);

  return (
    <EditDialog
      open={open}
      onClose={handleOnClose}
      confirmation={formik.dirty}
      title={project ? `Редактирование проекта: ${project.name}` : 'Создание проекта'}
      form="mainForm"
      fullwidth
      deleteButton={project && userPermissions?.['time-tracking/projects']?.DELETE}
      onDeleteClick={handleDelete}
      deleteButtoHint={`${inUse ? 'Нельзя удалить использующийся проект' : ''}`}
      deleteButtonDisabled={inUse}
      deleteConfirmTitle={'Удаление проекта'}
      showDeleteButtonHintAnyway
    >
      <FormikProvider value={formik}>
        <Form
          style={{ height: '100%', minWidth: 0 }}
          id="mainForm"
          onSubmit={formik.handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as any).id === 'search') {
              e.preventDefault();
            }
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            height="100%"
          >
            {!matchDownMd && <>
              <div className={styles.editPanel}>
                <CustomizedScrollBox labelOffset>
                  {editForm}
                </CustomizedScrollBox>
              </div>
              <Divider orientation="vertical" flexItem />
            </>}
            <Stack flex={1} minWidth={0}>
              <TabContext value={tabIndex}>
                <TabList
                  className={styles.tabHeaderRoot}
                  onChange={(e, index) => setTabIndex(index)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {matchDownMd && (
                    <Tab
                      className={styles.tabHeader}
                      label="Информация"
                      value="0"
                    />
                  )}
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
                {matchDownMd && <TabPanel value="0" className={tabIndex === '0' ? styles.tabPanel : ''}>
                  <div style={{ width: '100%', marginRight: '-16px !important' }}>
                    <CustomizedScrollBox labelOffset>
                      <div>
                        {editForm}
                      </div>
                    </CustomizedScrollBox>
                  </div>
                </TabPanel>}
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
                  <ProjectNote message={formik.values.note} onChange={(note) => formik.setFieldValue('note', note)} />
                </TabPanel>
              </TabContext>
            </Stack>
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}

export default ProjectEdit;
