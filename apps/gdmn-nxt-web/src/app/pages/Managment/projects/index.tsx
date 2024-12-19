import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { Box, CardContent, CardHeader, Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { IFilteringData, IPaginationData, IProjectFilter, ISortingData } from '@gsbelarus/util-api-types';
import { DataGridProProps, GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid-pro';
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

  const [addFavorite] = useAddFavoriteProjectMutation();
  const [deleteFavorite] = useDeleteFavoriteProjectMutation();

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
      dispatch(clearFilterData(filterEntityName));
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
    {
      field: 'isFavorite',
      type: 'actions',
      resizable: false,
      width: 40,
      renderCell: ({ value, row }: GridRenderCellParams) => {
        const id = row.ID;
        const toggleFavorite = () => {
          if (value) {
            deleteFavorite(id);
            return;
          }
          addFavorite(id);
        };
        return (
          <SwitchStar
            selected={!!value}
            onClick={toggleFavorite}
          />
        );
      }
    },
    { field: 'name', headerName: 'Наименование', flex: 1, },
    { field: 'customer', headerName: 'Клиент', flex: 1,
      renderCell: ({ value, row }) => value.NAME
    },
    {
      field: 'STATUS',
      type: 'actions',
      resizable: false,
      renderCell: ({ value, row }: GridRenderCellParams) => {
        const handleChangeVisible = () => {
          // updateWorkProject({ ...row, STATUS: value === 1 ? 0 : 1 });
        };
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
              color={value === 1 ? 'primary' : 'error'}
              size="small"
              onClick={handleChangeVisible}
            >
              {value === 1 ? <VisibilityIcon/> : <VisibilityOffOutlinedIcon fontSize="small" />}
            </IconButton>
          </div>
        );
      }
    }
  ];

  const getTreeDataPath: DataGridProProps['getTreeDataPath'] = (row) => {
    return row?.hierarchy || [row.ID];
  };

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
                  ? filterData.name[0]
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
                disabled={projectsIsFetching}
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
          getTreeDataPath={getTreeDataPath}
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
          // getDetailPanelHeight={() => 'auto'}
          // getDetailPanelContent={getDetailPanelContent}
        />
      </CardContent>
      {memoFilter}
    </CustomizedCard>
  );
};
