import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import styles from './task-types.module.less';
import { Button, CardContent, CardHeader, Divider, IconButton, TextField, Tooltip, TooltipProps, Typography, styled, tooltipClasses } from '@mui/material';
import StyledGrid from 'apps/gdmn-nxt-web/src/app/components/Styled/styled-grid/styled-grid';
import { GridActionsCellItem, GridCellParams, GridColDef, GridPreProcessEditCellProps, GridRenderCellParams, GridRenderEditCellParams, GridRowModes, GridRowParams, MuiEvent, useGridApiContext, useGridApiRef } from '@mui/x-data-grid-pro';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ChangeEvent, KeyboardEvent, useCallback, useMemo, useState, MouseEvent, SyntheticEvent, useReducer, useEffect } from 'react';
import { useAddTaskTypeMutation, useDeleteTaskTypeMutation, useGetTaskTypesQuery, useUpdateTaskTypeMutation } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanCatalogsApi';
import { ITaskType } from '@gsbelarus/util-api-types';
import ConfirmDialog from 'apps/gdmn-nxt-web/src/app/confirm-dialog/confirm-dialog';
import CardToolbar from 'apps/gdmn-nxt-web/src/app/components/Styled/card-toolbar/card-toolbar';
import AddIcon from '@mui/icons-material/Add';

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
    apiRef.current.setEditCellValue({ id, field, value });apiRef.current.forceUpdate();
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
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
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

    const [first, setFirst] = useState(true);

    useEffect(() => {
      if (first) {
        setFirst(false);
        return;
      };
      const row = { ...api.current.getRow(id) };
      if (row!.ID === 0) delete row['ID'];
      handleSubmit(row);
    }, [apiRef.current.getRowModels().get(id)]);

    const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
      forceUpdate();
      event.stopPropagation();
      api.current.startRowEditMode({ id });
    };

    const handleConfirmSave = (event: MouseEvent<HTMLButtonElement>) => {
      forceUpdate();
      event.stopPropagation();
      const row = api.current.getRow(id);
      if (row?.ID === 0) {
        handleSetTitleAndMethod('additing', handleSaveClick);
      } else {
        handleSetTitleAndMethod('editing', handleSaveClick);
      }
      setConfirmOpen(true);
    };

    const handleSaveClick = () => {
      setConfirmOpen(false);
      api.current.stopRowEditMode({ id });
      const row = { ...api.current.getRow(id) };
      forceUpdate();
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
      api.current.stopRowEditMode({ id, ignoreModifications: true });
      if (api.current.getRow(id)!.ID === 0) apiRef.current.updateRows([{ ID: id, _action: 'delete' }]);
      forceUpdate();
    };

    if (isInEditMode) {
      const rowModel = apiRef.current.getRowModels();
      return (
        <>
          <IconButton
            role="menuitem"
            color="primary"
            size="small"
            onClick={handleConfirmSave}
          >
            <SaveIcon fontSize="small" />
          </IconButton>
          <IconButton
            role="menuitem"
            color="primary"
            size="small"
            onClick={handleCancelClick}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </>);
    }

    return (
      <>
        <IconButton
          role="menuitem"
          color="primary"
          size="small"
          onClick={handleEditClick}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          role="menuitem"
          color="error"
          size="small"
          onClick={handleConfirmDelete}
        >
          <DeleteForeverIcon fontSize="small" />
        </IconButton>
      </>
    );
  }

  const validationShema: ValidationShema = {
    NAME: (value) => {
      if (value.length > 60) return 'Слишком длинное наименование';
      return '';
    }
  };

  const validationCell = (fieldName: string) => async (params: GridPreProcessEditCellProps) => {
    const errorMessage = validationShema[fieldName](params.props.value ?? '');
    return { ...params.props, error: errorMessage };
  };

  const renderEditCell = (params: GridRenderEditCellParams) => <CustomCellEditForm {...params} />;

  const columns: GridColDef[] = [
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
    apiRef.current.updateRows([{ ID: id }]);
    apiRef.current.setRowIndex(id, 0);
    apiRef.current.scrollToIndexes({
      rowIndex: 0,
    });
    apiRef.current.startRowEditMode({ id });
    forceUpdate();
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
        className={styles.card}
      >
        <CardHeader title={<Typography variant="pageHeader">Типы задач</Typography>} />
        <Divider />
        <CardToolbar>
          <Button
            className={styles.addButton}
            variant="contained"
            startIcon={<AddIcon />}
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
            apiRef={apiRef}
            rowHeight={50}
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
