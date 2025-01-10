import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { IFilteringData, ITimeTrackProject, ITimeTrackTask, IWithID, Permissions } from '@gsbelarus/util-api-types';
import { Autocomplete, Button, Divider, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import { GridCellParams, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId, GridRowModes, GridRowParams, GridTreeNodeWithRender, MuiEvent, useGridApiContext, useGridApiRef } from '@mui/x-data-grid-pro';
import { ChangeEvent, KeyboardEvent, MouseEvent, SyntheticEvent, useCallback, useMemo, useReducer, useState } from 'react';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import { ErrorTooltip } from '@gdmn-nxt/components/Styled/error-tooltip/error-tooltip';
import ConfirmDialog from 'apps/gdmn-nxt-web/src/app/confirm-dialog/confirm-dialog';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';
import ItemButtonVisible from '../../../../../components/customButtons/item-button-power/item-button-power';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import ItemButtonSave from '@gdmn-nxt/components/customButtons/item-button-save/item-button-save';
import ItemButtonCancel from '@gdmn-nxt/components/customButtons/item-button-cancel/item-button-cancel';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { clearFilterData, saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';

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

export interface ITaskFilter extends IWithID {
  code: number;
  name: string;
  value?: boolean | string
}

const isActiveSelectItems: ITaskFilter[] = [
  {
    ID: 0,
    code: 0,
    name: 'Все',
    value: 'all'
  },
  {
    ID: 1,
    code: 1,
    name: 'Активные',
    value: true
  },
  {
    ID: 2,
    code: 2,
    name: 'Закрытые',
    value: false
  }
];

interface CustomCellEditFormProps extends GridRenderEditCellParams {
  errors: IErrorsObject,
  clearError: (name: string, id: GridRowId) => void
}

const CustomCellEditForm = (props: CustomCellEditFormProps) => {
  const { colDef, value, id, field, error, errors, clearError, row } = props;

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
          style={{ textDecoration: !row.isActive ? 'line-through' : 'none' }}
          autoFocus
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

export function DetailPanelContent({ project, separateGrid, onSubmit, changeFavorite }: Readonly<IDetailPanelContent>) {
  const filterEntityName = 'project-tasks';
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[`${filterEntityName}`]);

  const tasks = useMemo(() => (separateGrid ? project.tasks?.reduce<ITimeTrackTask[]>((filteredArray, task) => {
    let checkConditions = true;
    if (filterData?.name) {
      const lowerName = String(filterData.name).toLowerCase();
      checkConditions = checkConditions && task.name.toLowerCase().includes(lowerName);
    }
    if (filterData?.isActive !== 'all') {
      checkConditions = checkConditions && (task.isActive === filterData?.isActive);
    }
    if (checkConditions) {
      filteredArray.push(task);
    }
    return filteredArray;
  }, []) : project.tasks) || [],
  [filterData?.isActive, filterData?.name, project.tasks, separateGrid]) ;

  const apiRef = useGridApiRef();
  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dispatch = useDispatch();
  const defaultIsDone = true;
  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName, { isActive: defaultIsDone });

  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: filteringData }));
  }, [dispatch]);

  const handleFilteringDataChange = useCallback((newValue: IFilteringData) => saveFilters(newValue), []);

  const requestSearch = useCallback((value: string) => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange({
      ...newObject,
      ...(value !== '' ? { name: [value] } : {})
    });
  }, [filterData, handleFilteringDataChange]);

  const cancelSearch = useCallback(() => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange(newObject);
  }, [filterData, handleFilteringDataChange]);

  const handleChangeProjectType = useCallback((e: any, value: ITaskFilter) => {
    const data = { ...filterData };

    if (value?.value === undefined) {
      delete data['isActive'];
    } else {
      data['isActive'] = value.value;
    }

    handleFilteringDataChange(data);
  }, [filterData, handleFilteringDataChange]);

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
              <ItemButtonVisible
                key="visible"
                color="inherit"
                label={props.value ? 'Отключить' : 'Включить'}
                selected={props.value}
                onClick={() => {
                  handleChangeVisible();
                  closeMenu();
                }}
              />)
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
  }, [apiRef]);

  const footerPadding = 10;
  const footerHeight = userPermissions?.['time-tracking/tasks']?.POST ? 31.75 + 10 * 2 : 0;

  const getHeight = useCallback((recordsCount = 0) => recordsCount === 0 ? 0 : recordsCount * 50 + footerHeight, []);

  const grid = (
    <StyledGrid
      sx={{ '& .MuiDataGrid-withBorderColor': {
        borderBottomColor: 'var(--color-grid-borders) !important'
      } }}
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
    />);

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
        <PermissionsGate actionAllowed={userPermissions?.['time-tracking/tasks']?.POST}>
          <Stack direction="row" spacing={1}>
            <Autocomplete
              disabled={filtersIsLoading}
              options={isActiveSelectItems}
              disableClearable
              getOptionLabel={option => option.name}
              value={isActiveSelectItems.find(item => item.value === filterData?.isActive) ?? isActiveSelectItems[1]}
              onChange={handleChangeProjectType}
              style={{ width: '200px' }}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option.ID}>
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Фильтр по типу"
                />
              )}
            />
            <SearchBar
              disabled={filtersIsLoading}
              onCancelSearch={cancelSearch}
              onRequestSearch={requestSearch}
              fullWidth
              cancelOnEscape
              value={
                filterData?.name
                  ? filterData.name?.[0]
                  : undefined
              }
            />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title={'Создать задачу'}>
                <IconButton
                  color="primary"
                  onClick={handleAddSource}
                >
                  <AddCircleIcon/>
                </IconButton>
              </Tooltip>
            </div>
          </Stack>
        </PermissionsGate>
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
          height: getHeight(tasks.length),
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ flex: 1 }}>
          {grid}
        </div>
        <PermissionsGate actionAllowed={userPermissions?.['time-tracking/tasks']?.POST}>
          <div style={{ display: 'flex', padding: `${footerPadding}px` }}>
            <Button onClick={handleAddSource} startIcon={<AddCircleRoundedIcon />}>Создать задачу</Button>
          </div>
        </PermissionsGate>
        <Divider/>
      </div>
    </>
  );
}
