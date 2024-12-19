import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { Box, CardContent, CardHeader, Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { IFilteringData, IPaginationData, IProjectFilter, ISortingData, ITimeTrackProject } from '@gsbelarus/util-api-types';
import { DataGridProProps, GridColDef, GridGroupNode, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid-pro';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { clearFilterData, saveFilterData } from '../../../store/filtersSlice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { ProjectsFilter } from './components/projectsFilter';
import { useAddFavoriteProjectMutation, useDeleteFavoriteProjectMutation, useGetFiltersQuery, useGetProjectsQuery } from '../../../features/time-tracking';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import CustomAddButton from '@gdmn-nxt/helpers/custom-add-button';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import CustomFilterButton from '@gdmn-nxt/helpers/custom-filter-button';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { CustomGridTreeDataGroupingCell } from './components/CustomGridTreeDataGroupingCell';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import Confirmation from '@gdmn-nxt/helpers/confirmation';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';

export interface IProjectsProps {}

export function Projects(props: IProjectsProps) {
  const filterEntityName = 'projects';
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[`${filterEntityName}`]);
  const { data: projectTypeFilters = [] } = useGetFiltersQuery();
  const typeDefault = projectTypeFilters?.find(f => f.CODE === 4);
  const [openFilters, setOpenFilters] = useState(false);
  const dispatch = useDispatch();
  const [filtersIsLoading, filtersIsFetching] = useFilterStore(filterEntityName, typeDefault ? { type: [typeDefault] } : null);

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

  const [deletingTaskIDs, setDeletingCardIDs] = useState<number[]>([]);

  const rows: ITimeTrackProject[] = useMemo(() => {
    const newRows: any[] = [];
    projects?.forEach(project => {
      newRows.push({ ...project, hierarchy: [project.ID] });
      project.tasks?.forEach(task => {
        if (!deletingTaskIDs.includes(task.ID)) {
          newRows.push({ ...task, ID: task.ID, hierarchy: [project.ID, task.ID] });
        }
      });
    });
    return newRows;
  }, [projects, deletingTaskIDs]);

  const onDelete = async (project: ITimeTrackProject) => {
    // delete(value);
    setDeletingCardIDs(prev => prev.concat(project.ID));
  };

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

  const columns: GridColDef<any>[] = [
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
            <MenuBurger
              items={({ closeMenu }) => [
                <Stack
                  key="edit"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  onClick={() => {
                    // handleEditClick();
                    closeMenu();
                  }}
                >
                  <EditIcon />
                  <span>Редактировать</span>
                </Stack>,
                <Stack
                  key="edit"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  onClick={() => {
                    handleChangeVisible();
                    closeMenu();
                  }}
                >
                  {true ? <VisibilityIcon/> : <VisibilityOffOutlinedIcon fontSize="small" />}
                  <span>{true ? 'Отключить' : 'Включить'}</span>
                </Stack>
              ]}
            />
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

  const getTreeDataPath: DataGridProProps['getTreeDataPath'] = (row) => {
    return row?.hierarchy || [];
  };

  const groupingColDef: DataGridProProps['groupingColDef'] = {
    headerName: 'Наименование',
    flex: 1,
    minWidth: 280,
    renderCell: (params) => <CustomGridTreeDataGroupingCell {...params as GridRenderCellParams<any, any, any, GridGroupNode>} projects={projects} />
  };

  const memoGrid = useMemo(() => (
    <StyledGrid
      treeData
      rows={rows}
      rowCount={projects?.length ?? 0}
      columns={columns}
      loading={projectsIsFetching}
      getTreeDataPath={getTreeDataPath}
      groupingColDef={groupingColDef}
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
      paginationModel={{ page: paginationData.pageNo, pageSize: paginationData.pageSize }}
      sortingMode="server"
      onSortModelChange={handleSortModelChange}
    />
  ), [columns, groupingColDef, handleSortModelChange, pageOptions, paginationData, projects?.length, projectsIsFetching]);

  return (
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
                disabled
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
        {memoGrid}
      </CardContent>
      {memoFilter}
    </CustomizedCard>
  );
};
