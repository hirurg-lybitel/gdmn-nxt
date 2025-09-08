import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import styles from './task-types.module.less';
import { CardContent, Divider, IconButton, TextField, Tooltip, TooltipProps, styled, tooltipClasses } from '@mui/material';
import StyledGrid from 'apps/gdmn-nxt-web/src/app/components/Styled/styled-grid/styled-grid';
import { GridCellParams, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId, GridRowModes, GridRowParams, MuiEvent, useGridApiContext, useGridApiRef } from '@mui/x-data-grid-pro';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ChangeEvent, KeyboardEvent, useCallback, useMemo, useState, MouseEvent, SyntheticEvent, useReducer, useEffect } from 'react';
import { useAddTaskTypeMutation, useDeleteTaskTypeMutation, useGetTaskTypesQuery, useUpdateTaskTypeMutation } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanCatalogsApi';
import { ITaskType } from '@gsbelarus/util-api-types';
import ConfirmDialog from 'apps/gdmn-nxt-web/src/app/confirm-dialog/confirm-dialog';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';

/* eslint-disable-next-line */
export interface TaskTypesProps { }


interface IErrors {
  [key: string]: string | undefined;
}
interface IErrorsObject {
  [key: GridRowId]: IErrors;
}
interface ValidationShema {
  [key: string]: (value: string) => string;
}

type ConfirmationMode = 'deleting' | 'cancel';

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

const validationShema: ValidationShema = {
  NAME: (value) => {
    if (value?.length > 60) return 'Слишком длинное наименование';
    if (!value) return 'Обязательное поле';
    return '';
  },
};

interface CustomCellEditFormProps extends GridRenderEditCellParams {
  errors: IErrorsObject,
  clearError: (name: string, id: GridRowId) => void;
}

const CustomCellEditForm = (props: CustomCellEditFormProps) => {
  const { colDef, value, id, field, errors, clearError } = props;

  const errorMessage = errors[`${id}`]?.[`${field}`];

  const apiRef = useGridApiContext();

  const handleCellOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    apiRef.current.setEditCellValue({ id, field, value }); apiRef.current.forceUpdate();
  }, [apiRef, field, id]);

  return (
    <StyledTooltip open={!!errorMessage} title={errorMessage} >
      <div className={styles.cellContainer}>
        <TextField
          onFocus={() => clearError(field, id)}
          placeholder={`Введите ${colDef.headerName?.toLowerCase()}`}
          value={value ?? ''}
          onChange={handleCellOnChange}
          fullWidth
          error={!!errorMessage}
        />
      </div>
    </StyledTooltip>
  );
};

interface ITitleAndMethod {
  title: string,
  text: string,
  mode: ConfirmationMode,
  method: () => void;
}

export function TaskTypes(props: TaskTypesProps) {
  const apiRef = useGridApiRef();
  const { data: taskTypes = [], isFetching, isLoading, refetch } = useGetTaskTypesQuery();
  const [insertTaskType, { isLoading: insertIsLoading }] = useAddTaskTypeMutation();
  const [updateTaskType, { isLoading: updateIsLoading }] = useUpdateTaskTypeMutation();
  const [deleteTaskType, { isLoading: deleteIsLoading }] = useDeleteTaskTypeMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [titleAndMethod, setTitleAndMethod] = useState<ITitleAndMethod>({ title: '', text: '', mode: 'cancel', method: () => { } });
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleSetTitleAndMethod = (mode: ConfirmationMode, method: () => void) => {
    const title = (() => {
      switch (mode) {
        case 'cancel':
          return 'Внимание';
        case 'deleting':
          return 'Удаление типа задач';
        default:
          return 'Сохранение нового типа задач';
      }
    })();
    const text = (() => {
      switch (mode) {
        case 'cancel':
          return 'Изменения будут утеряны. Продолжить?';
        case 'deleting':
          return 'Вы уверены, что хотите продолжить?';
        default:
          return 'Вы уверены, что хотите продолжить?';
      }
    })();
    setTitleAndMethod({ title, text, mode, method });
  };

  const handleSubmit = useCallback((taskType: ITaskType) => {
    if (taskType.ID > 0) {
      updateTaskType(taskType);
    } else {
      insertTaskType(taskType);
    };
  }, []);

  const [errors, setErrors] = useState<IErrorsObject>({});

  const clearErrorByName = (name: string, id: GridRowId) => {
    const newErrors = { ...errors };
    if (!newErrors[`${id}`]) return;
    newErrors[`${id}`][`${name}`] = '';
    setErrors(newErrors);
  };

  function RowMenuCell(props: GridRenderCellParams) {
    const { id } = props;
    const api = useGridApiContext();
    const isInEditMode = api.current.getRowMode(id) === GridRowModes.Edit;

    const [first, setFirst] = useState(true);

    const cancelAdding = () => {
      const addIsEdit = api.current.getRowMode(0) === GridRowModes.Edit;
      if (id !== 0 && addIsEdit) {
        apiRef.current.stopRowEditMode({ id: 0, ignoreModifications: true });
      }
    };

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

    const handleSave = (event: MouseEvent<HTMLButtonElement>) => {
      const values = api.current.getRowWithUpdatedValues(id, '');
      const errorList: IErrors = {};
      let haveError = false;
      Object.keys(values).map(value => {
        const errorMessage = validationShema[`${value}`]?.(values[`${value}`]);
        if (errorMessage) haveError = true;
        errorList[`${value}`] = errorMessage;
      });
      const newErrors = { ...errors };
      newErrors[`${id}`] = errorList;
      setErrors(newErrors);
      if (haveError) return;
      cancelAdding();
      setConfirmOpen(false);
      api.current.stopRowEditMode({ id });
      forceUpdate();
    };

    const handleConfirmDelete = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      handleSetTitleAndMethod('deleting', handleDeleteClick);
      setConfirmOpen(true);
    };

    const handleDeleteClick = () => {
      setConfirmOpen(false);
      cancelAdding();
      deleteTaskType(Number(id));
    };

    const handleConfirmCancelClick = () => {
      function removeEmpty(obj: any) {
        return Object.fromEntries(Object.entries(obj).filter(([_, v]) => (v !== null && v !== '' && v !== undefined)));
      }
      if (JSON.stringify(removeEmpty(api.current.getRow(id))) !== JSON.stringify(removeEmpty(api.current.getRowWithUpdatedValues(id, '')))) {
        handleSetTitleAndMethod('cancel', handleCancelClick);
        setConfirmOpen(true);
      } else {
        handleCancelClick();
      }

      forceUpdate();
    };

    const handleCancelClick = () => {
      setConfirmOpen(false);
      const newErrors = { ...errors };
      newErrors[`${id}`] = {};
      setErrors(newErrors);
      api.current.stopRowEditMode({ id, ignoreModifications: true });
      if (api.current.getRow(id)?.ID === 0) apiRef.current.updateRows([{ ID: id, _action: 'delete' }]);
      forceUpdate();
    };

    if (isInEditMode) {
      return (
        <>
          <IconButton
            role="menuitem"
            color="primary"
            size="small"
            onClick={handleSave}
          >
            <SaveIcon fontSize="small" />
          </IconButton>
          <IconButton
            role="menuitem"
            color="primary"
            size="small"
            onClick={handleConfirmCancelClick}
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

  const renderEditCell = (params: GridRenderEditCellParams) => (
    <CustomCellEditForm
      {...params}
      errors={errors}
      clearError={clearErrorByName}
    />);

  const columns: GridColDef[] = [
    {
      field: 'NAME',
      headerName: 'Наименование',
      editable: true,
      flex: 0.5,
      minWidth: 200,
      renderEditCell,
    },
    {
      field: 'DESCRIPTION',
      editable: true,
      headerName: 'Описание',
      flex: 1,
      minWidth: 400,
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
    if (apiRef.current.getRow(0)) return;
    const id = 0;
    apiRef.current.updateRows([{ ID: id }]);
    apiRef.current.setRowIndex(id, 0);
    apiRef.current.scrollToIndexes({
      rowIndex: 0,
    });
    apiRef.current.startRowEditMode({ id });
    forceUpdate();
  };

  const memoConfirmDialog = useMemo(() => (
    <ConfirmDialog
      open={confirmOpen}
      title={titleAndMethod.title}
      text={titleAndMethod.text}
      dangerous={titleAndMethod.mode === 'deleting'}
      confirmClick={titleAndMethod.method}
      cancelClick={() => setConfirmOpen(false)}
    />
  ), [confirmOpen, titleAndMethod]);


  return (
    <>
      {memoConfirmDialog}
      <CustomizedCard
        className={styles.card}
      >
        <CustomCardHeader
          title={'Типы задач'}
          addButton
          onAddClick={handleAddSource}
          addButtonHint="Создать тип задач"
          refetch
          onRefetch={refetch}
          isFetching={isFetching || insertIsLoading || updateIsLoading || deleteIsLoading}
          isLoading={isLoading}
        />
        <Divider />
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
