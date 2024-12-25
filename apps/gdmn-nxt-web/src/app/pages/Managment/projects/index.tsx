import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { Box, CardContent, CardHeader, Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import { ChangeEvent, MouseEvent, SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { IFilteringData, IPaginationData, IProjectFilter, ISortingData, ITimeTrackProject, ITimeTrackTask } from '@gsbelarus/util-api-types';
import { DataGridProProps, GRID_DETAIL_PANEL_TOGGLE_COL_DEF, GridColDef, GridGroupNode, GridRenderCellParams, GridRenderEditCellParams, GridRowId, GridRowParams, GridSortModel, useGridApiContext, useGridApiRef } from '@mui/x-data-grid-pro';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { clearFilterData, saveFilterData } from '../../../store/filtersSlice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { ProjectsFilter } from './components/projectsFilter/projectsFilter';
import { useAddFavoriteProjectMutation, useAddFavoriteTaskMutation, useAddProjectMutation, useAddTimeTrackTaskMutation, useDeleteFavoriteProjectMutation, useDeleteFavoriteTaskMutation, useDeleteTimeTrackTaskMutation, useGetFiltersQuery, useGetProjectsQuery, useUpdateProjectMutation, useUpdateTimeTrackTaskMutation } from '../../../features/time-tracking';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import CustomAddButton from '@gdmn-nxt/helpers/custom-add-button';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import CustomFilterButton from '@gdmn-nxt/helpers/custom-filter-button';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import Confirmation from '@gdmn-nxt/helpers/confirmation';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ErrorTooltip } from '@gdmn-nxt/components/Styled/error-tooltip/error-tooltip';
import ProjectEdit from './components/projectEdit/projectEdit';
import { DetailPanelContent } from './components/detailPanelContent/detailPanelContent';

interface IErrors {
  [key: string]: string | undefined
}
interface IErrorsObject {
  [key: GridRowId]: IErrors
}

export interface IProjectsProps {}

export function Projects(props: IProjectsProps) {
  const filterEntityName = 'projects';
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[`${filterEntityName}`]);
  const { data: projectTypeFilters = [] } = useGetFiltersQuery();
  const typeDefault = projectTypeFilters?.find(f => f.CODE === 4);
  const [openFilters, setOpenFilters] = useState(false);
  const dispatch = useDispatch();
  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName, typeDefault ? { type: [typeDefault] } : null);
  const apiRef = useGridApiRef();
  const [updateTask] = useUpdateTimeTrackTaskMutation();
  const [deleteTask] = useDeleteTimeTrackTaskMutation();
  const [addTask] = useAddTimeTrackTaskMutation();
  const [addFavoriteTask] = useAddFavoriteTaskMutation();
  const [deleteFavoriteTask] = useDeleteFavoriteTaskMutation();
  const [addProject] = useAddProjectMutation();
  const [updateProject] = useUpdateProjectMutation();

  const {
    data: projects = [],
    refetch,
    isFetching: projectsIsFetching,
    isLoading: projectsIsLoading,
  } = useGetProjectsQuery(
    // {
    //   pagination: paginationData,
    //   ...(filterData && { filter: filterData }),
    //   ...(sortingData ? { sort: sortingData } : {})
    // }
  );

  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: 20,
  });
  const [sortingData, setSortingData] = useState<ISortingData | null>();

  const rowPerPage = 20;
  const [pageOptions, setPageOptions] = useState<number[]>([
    rowPerPage,
    rowPerPage * 2,
    rowPerPage * 5,
    rowPerPage * 10
  ]);

  useEffect(() => {
    setPageOptions([
      rowPerPage,
      rowPerPage * 2,
      rowPerPage * 5,
      rowPerPage * 10
    ]);
  }, [paginationData]);

  const refreshClick = useCallback(() => refetch(), []);

  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: filteringData }));
  }, []);

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
  }, []);

  const cancelSearch = useCallback(() => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange(newObject);
  }, []);

  const filterHandlers = {
    filterClick: useCallback(() => {
      setOpenFilters(true);
    }, []),
    filterClose: useCallback(() => {
      setOpenFilters(false);
    }, [setOpenFilters]),
    filterClear: useCallback(() => {
      dispatch(clearFilterData({ filterEntityName, saveFields: ['type'] }));
    }, [dispatch]),
    filterDeadlineChange: (e: SyntheticEvent<Element, Event>, value: IProjectFilter) => {
      saveFilters({ ...filterData, deadline: [value] });
    }
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
  const onSubmit = useCallback((project: ITimeTrackProject) => {
    setOpenEditForm(false);
    if (project.ID > 0) {
      updateProject(project);
      return;
    }
    addProject(project);
  }, [addProject]);

  const handleEdit = (project: ITimeTrackProject) => () => {
    setProject(project);
    setOpenEditForm(true);
  };

  const handleAdd = () => {
    setProject(undefined);
    setOpenEditForm(true);
  };

  const onCancelClick = () => {
    setOpenEditForm(false);
  };

  const memoProjectEdit = useMemo(() => (
    <ProjectEdit
      open={openEditForm}
      project={project}
      onSubmit={onSubmit}
      onCancelClick={onCancelClick}
    />
  ), [onSubmit, openEditForm, project]);

  const columns: GridColDef<ITimeTrackProject>[] = [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      width: 70,
      renderCell: ({ formattedValue, row }) => {
        return (
          <>
            {row.isFavorite ? <StarIcon style={{ color: '#faaf00' }} /> : <StarBorderIcon />}
            <div style={{ minWidth: '5px' }} />
            <IconButton size="small">
              <ExpandMoreIcon style={{ transition: '0.1s', transform: formattedValue ? 'rotate(-90deg)' : 'none' }}/>
            </IconButton>
          </>
        );
      },
      align: 'center',
    },
    {
      field: 'name', headerName: 'Наименование', flex: 1,
    },
    { field: 'customer', headerName: 'Клиент', flex: 1,
      renderCell: ({ value, row }) => {
        return value?.NAME || '';
      }
    },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      renderCell: ({ value, row }: GridRenderCellParams) => {
        const handleChangeVisible = () => {
          // updateWorkProject({ ...row, STATUS: value === 1 ? 0 : 1 });
        };
        if (row.tasks) {
          return (
            <>
              <IconButton
                role="menuitem"
                color="primary"
                size="small"
                onClick={handleEdit(row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                color={'primary'}
                style={false ? { color: 'gray' } : {}}
                size="small"
                onClick={handleChangeVisible}
              >
                {true ? <VisibilityIcon/> : <VisibilityOffOutlinedIcon fontSize="small" />}
              </IconButton>
            </>
          );
        }

        return (
          <div>
            <IconButton
              color={'primary'}
              size="small"
              onClick={() => {}}
            >
              <EditIcon/>
            </IconButton>
            <IconButton
              color={'primary'}
              style={true ? { color: 'gray' } : {}}
              size="small"
              onClick={handleChangeVisible}
            >
              {true ? <VisibilityIcon/> : <VisibilityOffOutlinedIcon fontSize="small" />}
            </IconButton>
          </div>
        );
      }
    }
  ];

  const taskSubmit = useCallback((task: ITimeTrackTask, isDeleting: boolean) => {
    if (isDeleting)(
      deleteTask(task.ID)
    );
    if (task.ID > 0) {
      updateTask(task);
    } else {
      addTask(task);
    };
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
                {/* <PermissionsGate actionAllowed={userPermissions?.project?.POST}> */}
                <CustomAddButton
                // disabled={projectsIsFetching}
                  onClick={handleAdd}
                  disabled={projectsIsFetching || filtersIsLoading || filtersIsFetching}
                  label="Создать договор"
                />
                {/* </PermissionsGate> */}
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
                  hasFilters={Object.keys(filterData || {}).filter(f => f !== 'type').length > 0}
                />
              </Box>
            </Stack>
          }
        />
        <Divider />
        <CardContent style={{ padding: 0 }}>
          <StyledGrid
            rows={projects}
            rowCount={projects?.length ?? 0}
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
        </CardContent>
        {memoFilter}
      </CustomizedCard>
    </>
  );
};
