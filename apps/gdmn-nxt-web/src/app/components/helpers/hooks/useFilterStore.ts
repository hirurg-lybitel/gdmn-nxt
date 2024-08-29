import { useCallback, useEffect, useState } from 'react';
import { useAddFilterMutation, useDeleteFilterMutation, useGetAllFiltersQuery, useUpdateFilterMutation } from '../../../features/filters/filtersApi';
import { IFilteringData } from '@gsbelarus/util-api-types';
import { saveFilterData, setDebounce, setFilterId, setLastFilter } from '../../../store/filtersSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';

export function useFilterStore(filterEntityName: string, defaultFilters?: {[x: string]: any} | null): any {
  // Если defaultFilters надо подгружать с сервера передавать null пока грузятся
  const filter = useSelector((state: RootState) => state.filtersStorage);
  const debounceTime = 1000 * 10;
  const { data: filtersData, isLoading: filtersIsLoading, isFetching: filtersIsFetching } = useGetAllFiltersQuery();
  const filters = filtersData?.find(filterData => filterData.entityName === filterEntityName);
  const [addFilter, { isLoading: addIsLoading }] = useAddFilterMutation();
  const [deleteFilter, { isLoading: deleteIsLoading }] = useDeleteFilterMutation();
  const [updateFilter, { isLoading: updateIsLoading }] = useUpdateFilterMutation();
  const lastFilter = filter.lastFilter[`${filterEntityName}`];
  const filterId = filter.filterId[`${filterEntityName}`];
  const [pendingRequest, setPendingRequest] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!updateIsLoading && !deleteIsLoading && !addIsLoading && !filtersIsLoading && !filtersIsFetching) {
      setPendingRequest(null);
    }
  }, [pendingRequest]);

  useEffect(() => {
    dispatch(setFilterId({ [`${filterEntityName}`]: (filters?.ID || null) }));
    if (pendingRequest) {
      setPendingRequest(null);
      if (!filters?.ID) return;
      if (pendingRequest === 'delete') {
        deleteFilter(filters?.ID);
        return;
      }
      if (pendingRequest === 'update') {
        updateFilter({
          ID: filters?.ID,
          entityName: filterEntityName,
          filters: currentFilterData
        });
      }
    }
  }, [filters]);

  useEffect(() => {
    if (filtersData === undefined || filter.lastFilter?.[`${filterEntityName}`] !== undefined || defaultFilters === null) return;
    const data = { ...defaultFilters, ...(filters?.filters || filter.filterData?.[`${filterEntityName}`] || {}), ...filter.filterData?.[`${filterEntityName}`] };
    dispatch(setFilterId({ [`${filterEntityName}`]: (filters?.ID || null) }));
    dispatch(setLastFilter({ [`${filterEntityName}`]: Object.keys(filters?.filters || {}).length < 1 ? {} : { ...data } }));
    dispatch(saveFilterData({ [`${filterEntityName}`]: { ...data } }));
  }, [filtersIsLoading, defaultFilters]);

  const currentFilterData = filter.filterData?.[`${filterEntityName}`];

  const save = useCallback((filterData: IFilteringData | undefined) => {
    if (filterData === undefined && !filterId) return;
    if (lastFilter === undefined) return;
    if (Object.keys(filterData || {}).length < 1) {
      dispatch(setLastFilter({ [`${filterEntityName}`]: (filterData || {}) }));
      if (!filterId) {
        setPendingRequest('delete');
        return;
      }
      deleteFilter(filterId);
      return;
    }
    if (Object.keys(lastFilter).length > 0) {
      dispatch(setLastFilter({ [`${filterEntityName}`]: (filterData || {}) }));
      if (!filterId) {
        setPendingRequest('update');
        return;
      }
      updateFilter({
        ID: filterId,
        entityName: filterEntityName,
        filters: filterData || {}
      });
      return;
    }
    dispatch(setLastFilter({ [`${filterEntityName}`]: (filterData || {}) }));
    if (pendingRequest) {
      setPendingRequest('update');
      return;
    }
    addFilter({
      ID: -1,
      entityName: filterEntityName,
      filters: filterData || {}
    });
  }, [addFilter, deleteFilter, filterEntityName, filterId, lastFilter, pendingRequest, updateFilter, dispatch]);

  useEffect(() => {
    dispatch(setDebounce({ name: filterEntityName, callBack: () => save(currentFilterData), time: debounceTime }));
  }, [currentFilterData]);

  return [filtersIsLoading, filtersIsFetching];
}
