import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { ITimeTrackProject, ITimeTrackTask } from '@gsbelarus/util-api-types';
import { Button, IconButton, Stack, TextField } from '@mui/material';
import { GridCellParams, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId, GridRowModes, GridRowParams, GridTreeNodeWithRender, MuiEvent, useGridApiContext, useGridApiRef } from '@mui/x-data-grid-pro';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { ChangeEvent, KeyboardEvent, MouseEvent, SyntheticEvent, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import { useAddFavoriteTaskMutation, useAddTimeTrackTaskMutation, useDeleteFavoriteTaskMutation, useDeleteTimeTrackTaskMutation, useUpdateTimeTrackTaskMutation } from 'apps/gdmn-nxt-web/src/app/features/time-tracking';
import { ErrorTooltip } from '@gdmn-nxt/components/Styled/error-tooltip/error-tooltip';
import ConfirmDialog from 'apps/gdmn-nxt-web/src/app/confirm-dialog/confirm-dialog';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';

interface IErrors {
  [key: string]: string | undefined
}
interface IErrorsObject {
  [key: GridRowId]: IErrors
}
interface ValidationShema {
  [key: string]: (value: string) => string;
}

type ConfirmationMode = 'deleting' | 'cancel';

const validationShema: ValidationShema = {
  name: (value) => {
    if (value?.length > 60) return 'Слишком длинное наименование';
    if (!value) return 'Обязательное поле';
    return '';
  },
};

interface CustomCellEditFormProps extends GridRenderEditCellParams {
  errors: IErrorsObject,
  clearError: (name: string, id: GridRowId) => void
}

const CustomCellEditForm = (props: CustomCellEditFormProps) => {
  const { colDef, value, id, field, error, errors, clearError } = props;

  const errorMessage = errors[`${id}`]?.[`${field}`];

  const apiRef = useGridApiContext();

  const handleCellOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    apiRef.current.setEditCellValue({ id, field, value });
  }, [apiRef, field, id]);

  return (
    <ErrorTooltip open={!!errorMessage} title={errorMessage} >
      <div style={{ paddingLeft: '10px', paddingRight: '0px', flex: 1 }}>
        <TextField
          size="small"
          onFocus={() => clearError(field, id)}
          placeholder={`Введите ${colDef.headerName?.toLowerCase()}`}
          value={value ?? ''}
          onChange={handleCellOnChange}
          fullWidth
          error={!!errorMessage}
        />
      </div>
    </ErrorTooltip>
  );
};

interface IDetailPanelContent {
  project: ITimeTrackProject,
  separateGrid?: boolean,
  onSubmit: (task: ITimeTrackTask, isDeleting: boolean) => void,
  changeFavorite: (data: {taskId: number, projectId: number}, favorite: boolean) => void
}

export function DetailPanelContent({ project, separateGrid, onSubmit, changeFavorite }: IDetailPanelContent) {
  const tasks = project.tasks || [];

  const apiRef = useGridApiRef();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [titleAndMethod, setTitleAndMethod] = useState<{
    title: string,
    text: string,
    mode: ConfirmationMode,
    method: () => void
      }>({
        title: '', text: '', mode: 'cancel', method: () => {}
      });
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

  const stopAdding = useCallback(() => {
    if (apiRef.current.getRowMode(0) === GridRowModes.Edit) {
      apiRef.current.stopRowEditMode({ id: 0, ignoreModifications: true });
    }
  }, [apiRef]);

  const handleSubmit = useCallback((task: ITimeTrackTask) => {
    stopAdding();
    onSubmit(task.ID > 0 ? task : { ...task, project: project }, false);
  }, [onSubmit, project, stopAdding]);

  const [errors, setErrors] = useState<IErrorsObject>({});

  const clearErrorByName = useCallback((name: string, id: GridRowId) => {
    const newErrors = { ...errors };
    if (!newErrors[`${id}`]) return;
    newErrors[`${id}`][`${name}`] = '';
    setErrors(newErrors);
  }, [errors]);

  const RowMenuCell = (props: GridRenderCellParams) => {
    const { id, row } = props;

    const api = useGridApiContext();

    const isInEditMode = api.current.getRowMode(id) === GridRowModes.Edit;

    const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
      forceUpdate();
      event.stopPropagation();
      api.current.startRowEditMode({ id });
    };

    const handleSave = (event: MouseEvent<HTMLButtonElement>) => {
      const values = api.current.getRowWithUpdatedValues(id, '');
      const errorList: IErrors = {};
      let haveError = false;
      for (const value of Object.keys(values)) {
        const errorMessage = validationShema[`${value}`]?.(values[`${value}`]);
        if (errorMessage) haveError = true;
        errorList[`${value}`] = errorMessage;
      }
      const newErrors = { ...errors };
      newErrors[`${id}`] = errorList;
      setErrors(newErrors);
      if (haveError) return;
      setConfirmOpen(false);
      api.current.stopRowEditMode({ id });
      forceUpdate();
      const row = { ...values };
      if (row?.ID === 0) delete row['ID'];
      handleSubmit(row as ITimeTrackTask);
    };

    const handleConfirmDelete = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      handleSetTitleAndMethod('deleting', handleDeleteClick);
      setConfirmOpen(true);
    };

    const handleDeleteClick = () => {
      setConfirmOpen(false);
      stopAdding();
      onSubmit({ ID: id } as ITimeTrackTask, true);
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

    const handleChangeVisible = () => {
      if (isInEditMode && separateGrid) {
        apiRef.current.setEditCellValue({ id, field: 'isActive', value: !row.isActive });
        if (id === 0) return;
      };
      stopAdding();
      onSubmit({ ...row, isActive: !row.isActive }, false);
    };

    return (
      <>
        {isInEditMode ? <>
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
        </>
          : <>
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
          </>}
        <IconButton
          color={'primary'}
          style={!props.value ? { color: 'gray' } : {}}
          size="small"
          onClick={handleChangeVisible}
        >
          {props.value ? <VisibilityIcon/> : <VisibilityOffOutlinedIcon fontSize="small" />}
        </IconButton>
      </>
    );
  };

  const renderEditCell = useCallback((params: GridRenderEditCellParams) => (
    <CustomCellEditForm
      {...params}
      errors={errors}
      clearError={clearErrorByName}
    />), [clearErrorByName, errors]);

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      title={titleAndMethod.title}
      text={titleAndMethod.text}
      dangerous={titleAndMethod.mode === 'deleting'}
      confirmClick={titleAndMethod.method}
      cancelClick={() => setConfirmOpen(false)}
    />
  , [confirmOpen, titleAndMethod]);

  const IsFavoriteCell = ({ value, row, field, id }: GridRenderCellParams<ITimeTrackTask, any, any, GridTreeNodeWithRender>) => {
    const api = useGridApiContext();
    const isInEditMode = api.current.getRowMode(id) === GridRowModes.Edit;
    const handleSwitchFavorite = () => {
      if (isInEditMode && separateGrid && id === 0) {
        apiRef.current.setEditCellValue({ id, field, value: !value });
        return;
      }
      stopAdding();
      changeFavorite({ taskId: row.ID, projectId: project.ID }, !row.isFavorite);
    };
    return (
      <SwitchStar selected={value} onClick={handleSwitchFavorite}/>
    );
  };

  const columns: GridColDef<ITimeTrackTask>[] = [
    {
      width: 20,
      headerName: '',
      type: 'actions',
      resizable: false,
      field: 'isFavorite',
      editable: separateGrid,
      renderCell: IsFavoriteCell,
      renderEditCell: IsFavoriteCell,
      align: 'center',
    },
    {
      field: 'name',
      headerName: 'Наименование',
      flex: 1,
      resizable: false,
      editable: true,
      renderEditCell
    },
    {
      field: 'isActive',
      type: 'actions',
      editable: separateGrid,
      resizable: false,
      renderCell: RowMenuCell,
      renderEditCell: RowMenuCell
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
    apiRef.current.updateRows([{ ID: id, isActive: true }]);
    apiRef.current.setRowIndex(id, 0);
    apiRef.current.scrollToIndexes({
      rowIndex: 0,
    });
    apiRef.current.startRowEditMode({ id });
    forceUpdate();
  };

  const getHeight = useCallback((recordsCount = 0) => recordsCount === 0 ? 200 : recordsCount * 50, []);

  const grid = (
    <StyledGrid
      editMode="row"
      apiRef={apiRef}
      hideFooter
      rowHeight={50}
      hideColumnHeaders={!separateGrid}
      rows={tasks}
      columns={columns}
      onRowEditStart={handleRowEditStart}
      onRowEditStop={handleRowEditStop}
      onCellKeyDown={handleCellKeyDown}
    />
  );

  if (separateGrid) {
    return (
      <Stack
        direction="column"
        flex="1"
        display="flex"
        spacing={1}
        height={'100%'}
      >
        {memoConfirmDialog}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton color="primary" onClick={handleAddSource}><AddCircleIcon/></IconButton>
        </div>
        <CustomizedCard
          borders
          style={{
            flex: 1,
          }}
        >
          {grid}
        </CustomizedCard>
      </Stack>
    );
  }

  return (
    <>
      {memoConfirmDialog}
      <div
        style={{
          height: separateGrid ? '100%' : getHeight(tasks.length),
          width: '100%'
        }}
      >
        {grid}
      </div>
    </>
  );
}
