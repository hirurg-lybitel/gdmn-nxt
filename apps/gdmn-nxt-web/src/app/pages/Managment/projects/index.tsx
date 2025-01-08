import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { Box, CardContent, CardHeader, Divider, IconButton, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { IFilteringData, IPaginationData, IProjectType, ISortingData, ITimeTrackProject, ITimeTrackTask, Permissions } from '@gsbelarus/util-api-types';
import { GRID_DETAIL_PANEL_TOGGLE_COL_DEF, GridColDef, GridRenderCellParams, GridRowId, GridRowParams, GridSortModel, useGridApiRef } from '@mui/x-data-grid-pro';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { clearFilterData, saveFilterData } from '../../../store/filtersSlice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ProjectsFilter } from './components/projectsFilter/projectsFilter';
import { useAddFavoriteTaskMutation, useAddProjectMutation, useAddTimeTrackTaskMutation, useDeleteFavoriteTaskMutation, useDeleteProjectMutation, useDeleteTimeTrackTaskMutation, useGetFiltersQuery, useGetProjectsQuery, useGetProjectTypesQuery, useUpdateProjectMutation, useUpdateTimeTrackTaskMutation } from '../../../features/time-tracking';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import CustomAddButton from '@gdmn-nxt/helpers/custom-add-button';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import CustomFilterButton from '@gdmn-nxt/helpers/custom-filter-button';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ProjectEdit from './components/projectEdit/projectEdit';
import { DetailPanelContent } from './components/detailPanelContent/detailPanelContent';
import { ProjectTypeSelect } from '@gdmn-nxt/components/selectors/projectType-select/projectType-select';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';
import ItemButtonVisible from '../../../components/customButtons/item-button-visible/item-button-visible';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import VisibilityIcon from '@mui/icons-material/Visibility';

export interface IProjectsProps {}

export function Projects(props: IProjectsProps) {
  const filterEntityName = 'projects';
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[`${filterEntityName}`]);
  const { data: projectTypeFilters = [] } = useGetFiltersQuery();
  const typeDefault = projectTypeFilters?.find(f => f.CODE === 0);
  const [openFilters, setOpenFilters] = useState(false);
  const dispatch = useDispatch();
  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName, typeDefault ? { type: typeDefault.CODE } : null);
  const apiRef = useGridApiRef();
  const [updateTask] = useUpdateTimeTrackTaskMutation();
  const [deleteTask] = useDeleteTimeTrackTaskMutation();
  const [addTask] = useAddTimeTrackTaskMutation();
  const [addFavoriteTask] = useAddFavoriteTaskMutation();
  const [deleteFavoriteTask] = useDeleteFavoriteTaskMutation();
  const [addProject] = useAddProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: 20,
  });
  const [sortingData, setSortingData] = useState<ISortingData | null>();
  const [projectType, setProjectType] = useState<IProjectType | null>(null);

  const rowPerPage = 20;
  const [pageOptions, setPageOptions] = useState<number[]>([
    rowPerPage,
    rowPerPage * 2,
    rowPerPage * 5,
    rowPerPage * 10
  ]);

  const {
    data,
    refetch,
    isFetching: projectsIsFetching,
    isLoading: projectsIsLoading,
  } = useGetProjectsQuery(
    {
      pagination: paginationData,
      ...(filterData && { filter: { ...filterData } }),
      ...(sortingData ? { sort: sortingData } : {}),
      ...({ projectType: projectType?.ID })
    },
    {
      skip: !projectType
    }
  );

  const projects = data?.projects || [];

  useEffect(() => {
    setPageOptions([
      rowPerPage,
      rowPerPage * 2,
      rowPerPage * 5,
      rowPerPage * 10
    ]);
  }, [paginationData]);

  const refreshClick = useCallback(() => refetch(), [refetch]);

  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: filteringData }));
  }, [dispatch]);

  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    setSortingData(sortModel.length > 0 ? { ...sortModel[0] } : null);
  }, []);

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

  const filterHandlers = {
    filterClick: useCallback(() => {
      setOpenFilters(true);
    }, []),
    filterClose: useCallback(() => {
      setOpenFilters(false);
    }, [setOpenFilters]),
    filterClear: useCallback(() => {
      dispatch(clearFilterData({ filterEntityName, saveFields: ['type'] }));
      saveFilters({ type: typeDefault?.CODE });
    }, [dispatch, saveFilters, typeDefault?.CODE]),
  };

  const memoFilter = useMemo(() =>
    <ProjectsFilter
      open={openFilters}
      onClose={filterHandlers.filterClose}
      filteringData={filterData}
      onFilteringDataChange={handleFilteringDataChange}
      onClear={filterHandlers.filterClear}
    />,
  [openFilters, filterData, filterHandlers.filterClear, filterHandlers.filterClose, handleFilteringDataChange]);

  const [openEditForm, setOpenEditForm] = useState(false);
  const [project, setProject] = useState<ITimeTrackProject>();

  const onSubmit = useCallback((project: ITimeTrackProject, isDelete: boolean) => {
    setOpenEditForm(false);
    if (isDelete) {
      deleteProject(project.ID);
      return;
    }
    if (project.ID > 0) {
      updateProject(project);
      return;
    }
    addProject(project);
  }, [addProject, deleteProject, updateProject]);

  const handleEdit = useCallback((project: ITimeTrackProject) => {
    setProject(project);
    setOpenEditForm(true);
  }, []);

  const handleAdd = useCallback(() => {
    setProject(undefined);
    setOpenEditForm(true);
  }, []);

  const onCancelClick = useCallback(() => {
    setOpenEditForm(false);
  }, []);

  const memoProjectEdit = useMemo(() => (
    <ProjectEdit
      open={openEditForm}
      project={project}
      onSubmit={onSubmit}
      onCancelClick={onCancelClick}
    />
  ), [onCancelClick, onSubmit, openEditForm, project]);

  const columns: GridColDef<ITimeTrackProject>[] = [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      width: 70,
      renderCell: ({ formattedValue, row }) => {
        const disabled = row.tasks?.length === 0 || !row.tasks;
        return (
          <div style={{ paddingLeft: '14px', display: 'flex', alignItems: 'center', pointerEvents: disabled ? 'none' : 'all' }}>
            {row.isFavorite ? <StarIcon style={{ color: '#faaf00' }} /> : <StarBorderIcon />}
            <div style={{ minWidth: '5px' }} />
            <IconButton disabled={disabled} size="small">
              <ExpandMoreIcon style={{ transition: '0.1s', transform: formattedValue ? 'rotate(-90deg)' : 'none' }}/>
            </IconButton>
          </div>
        );
      },
      align: 'center',
    },
    {
      field: 'name',
      headerName: 'Наименование',
      flex: 1,
      renderCell: ({ value, row }) => {
        return <span style={{ color: row.isDone ? 'gray' : 'inherit' }}>{value}</span>;
      },
    },
    { field: 'customer', headerName: 'Клиент', flex: 1,
      renderCell: ({ value, row }) => {
        return <span style={{ color: row.isDone ? 'gray' : 'inherit' }}>{value?.NAME || ''}</span>;
      }
    },
    {
      field: 'isDone',
      type: 'actions',
      align: 'right',
      width: 138,
      resizable: false,
      renderCell: ({ value, row }: GridRenderCellParams) => {
        const handleChangeVisible = () => {
          updateProject({ ...row, isDone: !value });
        };
        return (
          <MenuBurger
            items={({ closeMenu }) => [
              userPermissions?.['time-tracking/projects']?.PUT
                ? (
                  <div key="edit">
                    <ItemButtonEdit
                      color={'inherit'}
                      size={'small'}
                      label="Редактировать"
                      onClick={() => {
                        handleEdit(row);
                        closeMenu();
                      }}
                    />
                  </div>
                )
                : <></>,
              userPermissions?.['time-tracking/projects']?.PUT
                ? (
                  <div key="visible">
                    <ItemButtonVisible
                      color={'inherit'}
                      label={!value ? 'Отключить' : 'Включить'}
                      selected={!value}
                      onClick={() => {
                        handleChangeVisible();
                        closeMenu();
                      }}
                    />
                  </div>
                )
                : <></>
            ]}
          />
        );
      }
    }
  ];

  const taskSubmit = useCallback((task: ITimeTrackTask, isDeleting: boolean) => {
    if (isDeleting) {
      deleteTask(task.ID);
      return;
    }
    if (task.ID > 0) {
      updateTask(task);
    } else {
      addTask(task);
    }
  }, [addTask, deleteTask, updateTask]);

  const changeTaskFvorite = useCallback((data: {taskId: number, projectId: number}, favorite: boolean) => {
    if (favorite) {
      addFavoriteTask(data);
    } else {
      deleteFavoriteTask(data);
    }
  }, [addFavoriteTask, deleteFavoriteTask]);

  const getDetailPanelContent = useCallback(({ row }: GridRowParams<ITimeTrackProject>) => (
    <DetailPanelContent
      onSubmit={taskSubmit}
      project={row}
      changeFavorite={changeTaskFvorite}
    />
  ), [changeTaskFvorite, taskSubmit]);

  return (
    <>
      {memoProjectEdit}
      <CustomizedCard style={{ flex: 1 }}>
        <CardHeader
          title={<Typography variant="pageHeader">Проекты</Typography>}
          action={
            <Stack direction="row" spacing={1}>
              <Box paddingX={'4px'} />
              <SearchBar
                disabled={projectsIsLoading}
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
              <Box display="inline-flex" alignSelf="center">
                <PermissionsGate actionAllowed={userPermissions?.['time-tracking/projects']?.POST}>
                  <CustomAddButton
                    onClick={handleAdd}
                    disabled={projectsIsFetching || filtersIsLoading || filtersIsFetching}
                    label="Создать проект"
                  />
                </PermissionsGate>
              </Box>
              <Box display="inline-flex" alignSelf="center">
                <CustomLoadingButton
                  hint="Обновить данные"
                  loading={projectsIsFetching}
                  onClick={refreshClick}
                />
              </Box>
              <Box display="inline-flex" alignSelf="center">
                <CustomFilterButton
                  onClick={filterHandlers.filterClick}
                  disabled={projectsIsFetching || filtersIsLoading || filtersIsFetching}
                  hasFilters={Object.keys(filterData || {}).filter(f => f !== 'type').length > 0 || filterData?.type !== typeDefault?.CODE}
                />
              </Box>
            </Stack>
          }
        />
        <Divider />
        <CardContent style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 20px' }}>
            <ProjectTypeSelect
              withCreate
              withEdit
              notNull
              disableClearable
              value={projectType}
              onChange={(value) => setProjectType(value as IProjectType)}
            />
          </div>
          <Divider/>
          <div style={{ flex: '1' }}>
            <StyledGrid
              rows={projects}
              rowCount={data?.rowCount ?? 0}
              columns={columns}
              loading={projectsIsFetching}
              pagination
              paginationMode="server"
              pageSizeOptions={pageOptions}
              onPaginationModelChange={(data: {page: number, pageSize: number}) => {
                setPaginationData({
                  ...paginationData,
                  pageSize: data.pageSize,
                  pageNo: data.page
                });
              }}
              apiRef={apiRef}
              paginationModel={{ page: paginationData.pageNo, pageSize: paginationData.pageSize }}
              sortingMode="server"
              onSortModelChange={handleSortModelChange}
              rowThreshold={0}
              getDetailPanelHeight={() => 'auto'}
              getDetailPanelContent={getDetailPanelContent}
            />
          </div>
        </CardContent>
        {memoFilter}
      </CustomizedCard>
    </>
  );
};
