import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import styles from './task-types.module.less';
import { Box, Button, CardContent, CardHeader, Divider, Stack, TextField, Typography } from '@mui/material';
import CardToolbar from 'apps/gdmn-nxt-web/src/app/components/Styled/card-toolbar/card-toolbar';
import StyledGrid from 'apps/gdmn-nxt-web/src/app/components/Styled/styled-grid/styled-grid';
import { DataGridPro, DataGridProProps, GRID_DETAIL_PANEL_TOGGLE_COL_DEF, GridActionsCellItem, GridColumns, GridRowId, GridRowModes, GridRowModesModel, GridRowParams, useGridApiContext } from '@mui/x-data-grid-pro';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { useAddTaskTypeMutation, useDeleteTaskTypeMutation, useGetTaskTypesQuery, useUpdateTaskTypeMutation } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanCatalogsApi';
import { ITaskType } from '@gsbelarus/util-api-types';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import TaskTypesUpsert from 'apps/gdmn-nxt-web/src/app/components/Kanban/task-types-upsert/task-types-upsert';

/* eslint-disable-next-line */
export interface TaskTypesProps {}

function DetailPanelContent({ row: rowProp }: { row: ITaskType }) {
  const apiRef = useGridApiContext();

  // id: GridRowId;
  // /**
  //  * The field to put focus.
  //  */
  // fieldToFocus?: string;
  // /**
  //  * If `true`, the value in `fieldToFocus` will be deleted before entering the edit mode.
  //  */
  // deleteValue?: boolean;
  // /**
  //  * The initial value for the given `fieldToFocus`.
  //  * If `deleteValue` is also true, this value is not used.
  //  */
  // initialValue?: string;


  // id: GridRowId;
  // /**
  //  * Whether or not to ignore the modifications made on this cell.
  //  * @default false
  //  */
  // ignoreModifications?: boolean;
  // /**
  //  * The field that has focus when the editing is stopped.
  //  * Used to calculate which cell to move the focus to after finishing editing.
  //  */
  // field?: string;
  // /**
  //  * To which cell to move focus after finishing editing.
  //  * Only works if the field is also specified, otherwise focus stay in the same cell.
  //  * @default "none"
  //  */
  // cellToFocusAfter?: 'none' | 'below' | 'right' | 'left';

  const updateRow = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // rowProp.NAME = e.target.value ;
    console.log('apiRef.current', apiRef.current.getRow(rowProp.ID));
    apiRef.current.startRowEditMode({
      id: rowProp.ID,
      fieldToFocus: 'NAME'
    });
    apiRef.current.updateRows([
      { ...rowProp, NAME: e.target.value },
    ]);
    apiRef.current.stopRowEditMode({
      id: rowProp.ID,
    });
  }, [apiRef, rowProp]);

  const initState = apiRef.current.state;

  // updateRow();


  // apiRef.current.restoreState(initState);

  console.log('row', rowProp);

  // const formik = useFormik<ITaskType>({
  //   enableReinitialize: true,
  //   validateOnBlur: false,
  //   initialValues: {
  //     ...rowProp
  //   },
  //   validationSchema: yup.object().shape({
  //     NAME: yup
  //       .string()
  //       .required('')
  //       .max(40, 'Слишком длинное наименование'),
  //   }),
  //   onSubmit: (value) => {
  //     // if (!confirmOpen) {
  //     //   setConfirmOpen(true);
  //     //   return;
  //     // };
  //     // setConfirmOpen(false);
  //   }
  // });

  return (
    <Stack direction="row" spacing={2}>
      {/* <FormikProvider value={formik}>
        <Form id="taskTypes" onSubmit={formik.handleSubmit}> */}
      <TextField
        style={{ flex: 0.5 }}
        // name="NAME"
        // value={formik.values.NAME}
        // onChange={formik.handleChange}
        value={rowProp.NAME}
        onChange={updateRow}
        label="Наименование"
      />
      <TextField
        value={rowProp.DESCRIPTION}
        name="DESCRIPTION"
        style={{ flex: 1 }}
        // onChange={() => apiRef.current.restoreState(initState)}
        label="Описание"
      />
      {/* </Form>
      </FormikProvider> */}
    </Stack>
  );
}

export function TaskTypes(props: TaskTypesProps) {
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState<GridRowId[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const { data: taskTypes = [], isFetching, isLoading } = useGetTaskTypesQuery();
  const [insertTaskType] = useAddTaskTypeMutation();
  const [updateTaskType, { isLoading: updateTaskTypeIsLoading }] = useUpdateTaskTypeMutation();
  const [deleteTaskType, { isLoading: deleteTaskTypeIsLoading }] = useDeleteTaskTypeMutation();
  const [upsertTaskType, setUpsertTaskType] = useState(false);
  const [taskType, setTaskType] = useState<ITaskType>();

  const columns: GridColumns = [
    { field: 'NAME', headerName: 'Наименование', flex: 0.5, },
    { field: 'DESCRIPTION', headerName: 'Описание', flex: 1, },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key={1}
          icon={<EditIcon />}
          onClick={handleEditSource(params.row)}
          label="Edit"
          color="primary"
          disabled={isFetching || deleteTaskTypeIsLoading || updateTaskTypeIsLoading}
        />
      ]
    }
  ];

  const handleAddSource = useCallback(() => {
    setTaskType(undefined);
    setUpsertTaskType(true);
  }, []);

  const handleEditSource = useCallback((taskType?: ITaskType) => () => {
    setTaskType(taskType);
    setUpsertTaskType(true);
  }, []);

  const handleSubmit = useCallback((taskType: ITaskType) => {
    if (taskType.ID > 0) {
      updateTaskType(taskType);
    } else {
      insertTaskType(taskType);
    };
    setUpsertTaskType(false);
  }, []);

  const handleDelete = useCallback((id: number) => {
    deleteTaskType(id);
    setUpsertTaskType(false);
  }, []);

  const handleCancel = useCallback(() => setUpsertTaskType(false), []);

  const memoUpsertTaskType = useMemo(() =>
    <TaskTypesUpsert
      open={upsertTaskType}
      taskType={taskType}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onDelete={handleDelete}
    />, [upsertTaskType, taskType]);

  return (
    <CustomizedCard
      borders
      className={styles.card}
    >
      <CardHeader title={<Typography variant="h3">Типы задач</Typography>} />
      <Divider />
      <CardToolbar>
        <Stack direction="row">
          <Box flex={1} />
          <Button
            variant="contained"
            disabled={isFetching}
            onClick={handleAddSource}
          >
            Добавить
          </Button>
        </Stack>
      </CardToolbar>
      <CardContent
        className={styles.cardContent}
      >
        <StyledGrid
          rows={taskTypes}
          columns={columns}
          loading={isLoading}
          rowHeight={80}
          hideHeaderSeparator
          hideFooter
        />
        {memoUpsertTaskType}
      </CardContent>
    </CustomizedCard>
  );
}

export default TaskTypes;
