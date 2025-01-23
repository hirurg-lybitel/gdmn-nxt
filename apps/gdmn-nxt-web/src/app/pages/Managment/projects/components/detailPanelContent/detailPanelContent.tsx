import StyledGrid, { ROW_HEIGHT } from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { IFilteringData, ITimeTrackProject, ITimeTrackTask, IWithID, Permissions } from '@gsbelarus/util-api-types';
import { Box, IconButton, Paper, Stack, TextField, Tooltip } from '@mui/material';
import { GridCellModes, GridCellParams, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId, GridRowModes, GridRowParams, GridTreeNodeWithRender, MuiEvent, useGridApiContext, useGridApiRef } from '@mui/x-data-grid-pro';
import { ChangeEvent, KeyboardEvent, MouseEvent, SyntheticEvent, useCallback, useMemo, useReducer, useState } from 'react';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import { ErrorTooltip } from '@gdmn-nxt/components/Styled/error-tooltip/error-tooltip';
import ConfirmDialog from 'apps/gdmn-nxt-web/src/app/confirm-dialog/confirm-dialog';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import ItemButtonSave from '@gdmn-nxt/components/customButtons/item-button-save/item-button-save';
import ItemButtonCancel from '@gdmn-nxt/components/customButtons/item-button-cancel/item-button-cancel';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import CustomAddButton from '@gdmn-nxt/helpers/custom-add-button';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { MenuItemDisable } from '@gdmn-nxt/helpers/menu-burger/items/item-disable';
import TasksFilter from '../tasksFilter';
import { statusItems } from '../../constants';

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

export const ROW_HEIGHT_EDIT_DELTA = 12;

const validationShema: ValidationShema = {
  name: (value) => {
    if (value?.length > 60) return 'Слишком длинное наименование';
    if (!value) return 'Обязательное поле';
    return '';
  },
};

export interface ITaskFilter extends IWithID {
  code: number;
  name: string;
  value?: boolean | string
}

interface CustomCellEditFormProps extends GridRenderEditCellParams {
  errors: IErrorsObject,
  clearError: (name: string, id: GridRowId) => void
}

const CustomCellEditForm = (props: CustomCellEditFormProps) => {
  const { colDef, value, id, field, errors, clearError, row } = props;

  const errorMessage = errors[`${id}`]?.[`${field}`];

  const apiRef = useGridApiContext();

  const handleCellOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    apiRef.current.setEditCellValue({ id, field, value });
  }, [apiRef, field, id]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();

      const rows = apiRef.current.getRowModels().values();
      apiRef.current.setEditCellValue({ id, field, value: null });
      if (id === 0) {
        apiRef.current.setRows(Array.from(rows).filter((row) => row.ID !== 0));
        return;
      }
      apiRef.current.stopRowEditMode({ id, ignoreModifications: true });
    }
  }, [apiRef, field, id]);

  return (
    <ErrorTooltip open={!!errorMessage} title={errorMessage} >
      <div style={{ paddingLeft: '10px', paddingRight: '0px', flex: 1 }}>
        <TextField
          style={{ textDecoration: !row.isActive ? 'line-through' : 'none' }}
          autoFocus
          size="small"
          onFocus={() => clearError(field, id)}
          placeholder={`Введите ${colDef.headerName?.toLowerCase()}`}
          value={value ?? ''}
          onChange={handleCellOnChange}
          fullWidth
          error={!!errorMessage}
          onKeyDown={handleKeyDown}
        />
      </div>
    </ErrorTooltip>
  );
};

interface IDetailPanelContent {
  light?: boolean,
  project: ITimeTrackProject,
  separateGrid?: boolean,
  onSubmit: (task: ITimeTrackTask, isDeleting: boolean) => void,
  changeFavorite: (data: {taskId: number, projectId: number}, favorite: boolean) => void
}

export function DetailPanelContent({
  light = false,
  project,
  separateGrid = true,
  onSubmit,
  changeFavorite
}: Readonly<IDetailPanelContent>) {
  const [filterData, setFilterData] = useState<IFilteringData>({ status: statusItems[1].value });

  const tasks = useMemo(() => {
    return (project.tasks ?? []).reduce<ITimeTrackTask[]>((filteredArray, task) => {
      let checkConditions = true;

      if (filterData?.name) {
        const lowerName = String(filterData.name).toLowerCase();
        checkConditions = checkConditions && task.name.toLowerCase().includes(lowerName);
      }

      if (filterData?.status !== 'all') {
        checkConditions = checkConditions && task.isActive === (filterData.status === 'active');
      }

      if (checkConditions) {
        filteredArray.push(task);
      }
      return filteredArray;
    }, []);
  }, [project.tasks, filterData]);

  const apiRef = useGridApiRef();
  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleFilteringDataChange = useCallback((newValue: IFilteringData) => {
    setFilterData(newValue);
  }, []);

  const [titleAndMethod, setTitleAndMethod] = useState<{
    title: string,
    text: string,
    mode: ConfirmationMode,
    method: () => void
      }>({
        title: '', text: '', mode: 'cancel', method: () => {}
      });

  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleSetTitleAndMethod = useCallback((mode: ConfirmationMode, method: () => void) => {
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
  }, []);

  const handleSubmit = useCallback((task: ITimeTrackTask) => {
    onSubmit(task.ID > 0 ? task : { ...task, project: project }, false);
  }, [onSubmit, project]);

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

    const handleEditClick = useCallback((event: React.MouseEvent<HTMLButtonElement & HTMLDivElement>) => {
      forceUpdate();
      event.stopPropagation();
      api.current.startRowEditMode({ id });
    }, [api, id]);

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

    const handleDeleteClick = () => {
      setConfirmOpen(false);
      onSubmit({ ID: id } as ITimeTrackTask, true);
    };

    const handleConfirmDelete = () => {
      handleSetTitleAndMethod('deleting', handleDeleteClick);
      setConfirmOpen(true);
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

    const handleChangeVisible = () => {
      if (isInEditMode) {
        apiRef.current.setEditCellValue({ id, field: 'isActive', value: !row.isActive });
        forceUpdate();
        if (id === 0 || !separateGrid) return;
      };
      onSubmit({ ...row, isActive: !row.isActive, project }, false);
    };

    if (isInEditMode) {
      return (
        <>
          <Tooltip title="Сохранить">
            <IconButton
              role="menuitem"
              color="primary"
              size="small"
              onClick={handleSave}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Отменить">
            <IconButton
              role="menuitem"
              color="primary"
              size="small"
              onClick={handleConfirmCancelClick}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      );
    }

    return (
      <MenuBurger
        items={({ closeMenu }) => [
          isInEditMode ? (
            <ItemButtonSave
              key="save"
              size={'small'}
              label="Сохранить"
              onClick={(e) => {
                handleSave(e);
                closeMenu();
              }}
            />)
            : <></>,
          isInEditMode
            ? (
              <ItemButtonCancel
                key="cancel"
                label={'Отменить'}
                onClick={(e) => {
                  handleConfirmCancelClick();
                  closeMenu();
                }}
              />)
            : <></>,
          userPermissions?.['time-tracking/tasks']?.PUT && !isInEditMode
            ? (
              <ItemButtonEdit
                key="edit"
                size={'small'}
                label="Редактировать"
                onClick={(e) => {
                  handleEditClick(e);
                  closeMenu();
                }}
              />)
            : <></>,
          userPermissions?.['time-tracking/tasks']?.PUT
            ? (
              <MenuItemDisable
                key="disable"
                disabled={!row.isActive}
                onClick={() => {
                  handleChangeVisible();
                  closeMenu();
                }}
              />
            )
            : <></>,
          userPermissions?.['time-tracking/tasks']?.DELETE && row.ID !== 0
            ? (
              <Tooltip
                onClick={() => {
                  if (!row.inUse) {
                    handleConfirmDelete();
                    closeMenu();
                  }
                }}
                key={'delete'}
                title={row.inUse ? 'Нельзя удалить использующуюся задачу' : ''}
              >
                <div>
                  <ItemButtonDelete
                    label="Удалить"
                    confirmation={false}
                    disabled={row.inUse}
                    onClick={() => {}}
                  />
                </div>
              </Tooltip>
            )
            : <></>
          ,
        ]}
      />
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

    const handleSwitchFavorite = useCallback(() => {
      if (isInEditMode) {
        apiRef.current.setEditCellValue({ id, field, value: !value });
        return;
      }
      changeFavorite({ taskId: row.ID, projectId: project.ID }, !row.isFavorite);
    }, [field, id, isInEditMode, row.ID, row.isFavorite, value]);

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
      editable: true,
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
      cellClassName: 'name-cell',
      renderCell: ({ value, row }: GridRenderCellParams<ITimeTrackTask, any, any, GridTreeNodeWithRender>) => {
        return <span style={{ color: !row.isActive ? 'gray' : 'inherit' }}>{value}</span>;
      },
      renderEditCell
    },
    {
      field: 'isActive',
      type: 'actions',
      editable: true,
      resizable: false,
      width: 78,
      renderCell: RowMenuCell,
      renderEditCell: RowMenuCell
    }
  ];

  const handleRowEditStart = useCallback((
    params: GridRowParams,
    event: MuiEvent<SyntheticEvent>,
  ) => {
    event.defaultMuiPrevented = true;
  }, []);

  const handleRowEditStop = useCallback((
    params: GridRowParams,
    event: MuiEvent,
  ) => {
    event.defaultMuiPrevented = true;
  }, []);

  const handleCellKeyDown = useCallback((params: GridCellParams, event: MuiEvent<KeyboardEvent<HTMLElement>>) => {
    if (event.key === 'Enter') {
      event.defaultMuiPrevented = true;
    }
  }, []);

  const handleAddSource = useCallback(() => {
    forceUpdate();
    if (apiRef.current.getRow(0)) return;
    const id = 0;
    apiRef.current.updateRows([{ ID: id, isActive: true }]);
    apiRef.current.setRowIndex(id, 0);
    apiRef.current.scrollToIndexes({
      rowIndex: 0,
    });
    if (apiRef.current.getRowMode(0) === GridRowModes.Edit) return;
    apiRef.current.startRowEditMode({ id });
    setEditMode(true);
  }, [apiRef]);

  const getHeight = useCallback((recordsCount = 0) => {
    const extraHeight = editMode ? ROW_HEIGHT_EDIT_DELTA : 0;

    const rowHeight = ROW_HEIGHT;
    const minHeight = ROW_HEIGHT + extraHeight;
    const maxHeight = ROW_HEIGHT * 5;


    /** We need a space for No data message */
    if (recordsCount === 0) return minHeight * 5;

    const calculatedHeight = recordsCount * rowHeight;
    return Math.max(Math.min(calculatedHeight, maxHeight), minHeight);
  }, [editMode]);

  const grid = (
    <StyledGrid
      sx={{
        flex: 1,
        minHeight: '200px',
        '& .name-cell': {
          paddingLeft: 0,
        },
      }}
      editMode="row"
      apiRef={apiRef}
      hideFooter
      getRowHeight={({ id, ...p }) => {
        const mode = apiRef.current.getCellMode(id, 'name');

        if (mode === GridCellModes.Edit) {
          return ROW_HEIGHT + ROW_HEIGHT_EDIT_DELTA;
        }

        return ROW_HEIGHT;
      }}
      hideColumnHeaders={light}
      rows={tasks}
      columns={columns}
      onRowEditStart={handleRowEditStart}
      onRowEditStop={handleRowEditStop}
      onCellKeyDown={handleCellKeyDown}
      onRowModesModelChange={(model) => setEditMode(Object.keys(model).length !== 0)}
    />
  );

  return (
    <>
      {memoConfirmDialog}
      <Paper
        sx={{
          display: 'flex',
          height: '100%',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 0,
          ...(light ? {
            p: 2,
            backgroundColor: 'var(--color-main-bg)',
          } : {})
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ pb: 2 }}
        >
          <TasksFilter
            light={light}
            filteringData={filterData}
            onFilteringDataChange={handleFilteringDataChange}
          />
          <PermissionsGate actionAllowed={userPermissions?.['time-tracking/tasks']?.POST}>
            <Box alignContent="center">
              <CustomAddButton label="Создать задачу" onClick={handleAddSource} />
            </Box>
          </PermissionsGate>
        </Stack>
        <CustomizedCard
          borders
          style={{
            flex: 1,
            minHeight: getHeight(tasks.length),
            display: 'flex'
          }}
        >
          {grid}
        </CustomizedCard>
      </Paper>
    </>
  );
}
