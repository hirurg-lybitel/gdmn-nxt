import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import styles from './task-types.module.less';
import { Button, CardContent, CardHeader, Divider, TextField, Tooltip, TooltipProps, Typography, styled, tooltipClasses } from '@mui/material';
import StyledGrid from 'apps/gdmn-nxt-web/src/app/components/Styled/styled-grid/styled-grid';
import { GridActionsCellItem, GridCellParams, GridColumns, GridPreProcessEditCellProps, GridRenderCellParams, GridRenderEditCellParams, GridRowModes, GridRowParams, MuiEvent, useGridApiContext, useGridApiRef } from '@mui/x-data-grid-pro';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChangeEvent, KeyboardEvent, useCallback, useMemo, useState, MouseEvent, SyntheticEvent } from 'react';
import { useAddTaskTypeMutation, useDeleteTaskTypeMutation, useGetTaskTypesQuery, useUpdateTaskTypeMutation } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanCatalogsApi';
import { ITaskType } from '@gsbelarus/util-api-types';
import ConfirmDialog from 'apps/gdmn-nxt-web/src/app/confirm-dialog/confirm-dialog';
import CardToolbar from 'apps/gdmn-nxt-web/src/app/components/Styled/card-toolbar/card-toolbar';

/* eslint-disable-next-line */
export interface TaskTypesProps {}

interface ValidationShema {
  [key: string]: (value: string) => string;
}

type ConfirmationMode = 'additing' | 'deleting' | 'editing';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip
    {...props}
    classes={{ popper: className }}
    placement="bottom-start"
  />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    marginLeft: '24px',
    marginTop: '5px !important',
    fontSize: '0.75rem',
  },
}));

const CustomCellEditForm = (props: GridRenderEditCellParams) => {
  const { colDef, value, id, field, error } = props;

  const apiRef = useGridApiContext();

  const handleCellOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    apiRef.current.setEditCellValue({ id, field, value });
  }, [apiRef, field, id]);

  return (
    <StyledTooltip open={!!error} title={error} >
      <div className={styles.cellContainer}>
        <TextField
          placeholder={`Введите ${colDef.headerName?.toLowerCase()}`}
          value={value ?? ''}
          onChange={handleCellOnChange}
          fullWidth
          error={!!error}
        />
      </div>
    </StyledTooltip>
  );
};

export function TaskTypes(props: TaskTypesProps) {
  const apiRef = useGridApiRef();
  const { data: taskTypes = [], isFetching, isLoading } = useGetTaskTypesQuery();
  const [insertTaskType] = useAddTaskTypeMutation();
  const [updateTaskType] = useUpdateTaskTypeMutation();
  const [deleteTaskType] = useDeleteTaskTypeMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [titleAndMethod, setTitleAndMethod] = useState<{
    title: string,
    mode: ConfirmationMode,
    method: () => void
      }>({
        title: '', mode: 'additing', method: () => {}
      });

  const handleSetTitleAndMethod = (mode: ConfirmationMode, method: () => void) => {
    const title = (() => {
      switch (mode) {
        case 'additing':
          return 'Сохранение нового типа задач';
        case 'editing':
          return 'Редактирование типа задач';
        case 'deleting':
          return 'Удаление типа задач';
        default:
          return 'Сохранение нового типа задач';
      }
    })();
    setTitleAndMethod({ title, mode, method });
  };

  const handleSubmit = useCallback((taskType: ITaskType) => {
    if (taskType.ID > 0) {
      updateTaskType(taskType);
    } else {
      insertTaskType(taskType);
    };
  }, []);

  function RowMenuCell(props: GridRenderCellParams) {
    const { id } = props;
    const api = useGridApiContext();
    const isInEditMode = api.current.getRowMode(id) === GridRowModes.Edit;

    const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      api.current.setRowMode(id, GridRowModes.Edit);
    };

    const handleConfirmSave = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const row = api.current.getRow(id);
      if (row?.isNew) {
        handleSetTitleAndMethod('additing', handleSaveClick);
      } else {
        handleSetTitleAndMethod('editing', handleSaveClick);
      }
      setConfirmOpen(true);
    };

    const handleSaveClick = () => {
      setConfirmOpen(false);

      const rowModel = apiRef.current.getEditRowsModel();
      const newRow: { [key: string]: any } = {};
      for (const [key, { value }] of Object.entries(rowModel[id])) {
        newRow[key] = value;
      }
      newRow['ID'] = id;

      api.current.updateRows([newRow]);
      api.current.setRowMode(id, GridRowModes.View);

      const row = api.current.getRow(id);
      if (row!.isNew) delete row['ID'];
      handleSubmit(row);
    };

    const handleConfirmDelete = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      handleSetTitleAndMethod('deleting', handleDeleteClick);
      setConfirmOpen(true);
    };

    const handleDeleteClick = () => {
      setConfirmOpen(false);
      deleteTaskType(Number(id));
    };

    const handleCancelClick = () => {
      api.current.setRowMode(id, GridRowModes.View);

      const row = api.current.getRow(id);
      if (row!.isNew) {
        api.current.updateRows([{ ID: id, _action: 'delete' }]);
      }
    };

    if (isInEditMode) {
      const rowModel = apiRef.current.getEditRowsModel();
      return (
        <>
          <GridActionsCellItem
            icon={<SaveIcon />}
            label="Save"
            onClick={handleConfirmSave}
            color="primary"
            disabled={!rowModel[id]['NAME']?.value || !!rowModel[id]['NAME']?.error}
          />
          <GridActionsCellItem
            icon={<CancelIcon />}
            label="Cancel"
            onClick={handleCancelClick}
          />
        </>);
    }

    return (
      <>
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={handleEditClick}
          color="primary"
        />
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleConfirmDelete}
          color="primary"
        />
      </>
    );
  }

  const validationShema: ValidationShema = {
    NAME: (value) => {
      if (value.length > 10) return 'Слишком длинное наименование';
      return '';
    }
  };

  const validationCell = (fieldName: string) => async (params: GridPreProcessEditCellProps) => {
    const errorMessage = validationShema[fieldName](params.props.value ?? '');
    return { ...params.props, error: errorMessage };
  };

  const renderEditCell = (params: GridRenderEditCellParams) => <CustomCellEditForm {...params} />;

  const columns: GridColumns = [
    {
      field: 'NAME',
      headerName: 'Наименование',
      editable: true,
      flex: 0.5,
      renderEditCell,
      preProcessEditCellProps: validationCell('NAME'),
    },
    {
      field: 'DESCRIPTION',
      editable: true,
      headerName: 'Описание',
      flex: 1,
      renderEditCell,
    },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      renderCell: RowMenuCell,
    }
  ];

  const handleRowEditStart = (
    params: GridRowParams,
    event: MuiEvent<SyntheticEvent>,
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (
    params: GridRowParams,
    event: MuiEvent,
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleCellKeyDown = (params: GridCellParams, event: MuiEvent<KeyboardEvent<HTMLElement>>) => {
    if (event.key === 'Enter') {
      event.defaultMuiPrevented = true;
    }
  };;

  const handleAddSource = () => {
    const id = 0;
    apiRef.current.updateRows([{ ID: id, isNew: true }]);
    apiRef.current.setRowIndex(id, 0);
    apiRef.current.scrollToIndexes({
      rowIndex: 0,
    });
    apiRef.current.setRowMode(id, GridRowModes.Edit);
  };

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      title={titleAndMethod.title}
      text="Вы уверены, что хотите продолжить?"
      dangerous={titleAndMethod.mode === 'deleting'}
      confirmClick={titleAndMethod.method}
      cancelClick={() => {
        setConfirmOpen(false);
      }}
    />
  , [confirmOpen, titleAndMethod]);


  return (
    <>
      {memoConfirmDialog}
      <CustomizedCard
        borders
        className={styles.card}
      >
        <CardHeader title={<Typography variant="h3">Типы задач</Typography>} />
        <Divider />
        <CardToolbar>
          <Button
            className={styles.addButton}
            variant="contained"
            disabled={isFetching}
            onClick={handleAddSource}
          >
            Добавить
          </Button>
        </CardToolbar>
        <CardContent
          className={styles.cardContent}
        >
          <StyledGrid
            editMode="row"
            rows={taskTypes}
            columns={columns}
            loading={isLoading}
            rowHeight={80}
            apiRef={apiRef}
            onRowEditStart={handleRowEditStart}
            onRowEditStop={handleRowEditStop}
            onCellKeyDown={handleCellKeyDown}
            hideHeaderSeparator
            hideFooter
          />
        </CardContent>
      </CustomizedCard>
    </>
  );
}

export default TaskTypes;
